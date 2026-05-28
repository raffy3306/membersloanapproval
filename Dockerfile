# syntax=docker/dockerfile:1

FROM php:8.2-cli AS backend-deps
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libzip-dev \
    && docker-php-ext-install zip \
    && apt-get purge -y --auto-remove libzip-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY backend/composer.json backend/composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader

FROM node:22-alpine AS frontend-build
WORKDIR /app

ARG VITE_LARAVEL_API_URL=/api
ENV VITE_LARAVEL_API_URL=${VITE_LARAVEL_API_URL}

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM php:8.2-apache AS runtime
WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev \
    && docker-php-ext-install mbstring pdo_mysql \
    && apt-get purge -y --auto-remove libonig-dev \
    && rm -rf /var/lib/apt/lists/* \
    && a2enmod headers rewrite

COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

RUN cat > /usr/local/bin/entrypoint.sh <<'SH'
#!/bin/sh
set -eu

is_enabled() {
    case "${1:-}" in
        1|true|TRUE|yes|YES|on|ON) return 0 ;;
        *) return 1 ;;
    esac
}

create_database_if_needed() {
    if ! is_enabled "${ALLOW_DB_CREATE:-0}"; then
        return 0
    fi

    if [ "${DB_CONNECTION:-mysql}" != "mysql" ]; then
        echo "ALLOW_DB_CREATE is enabled, but DB_CONNECTION is not mysql. Skipping database creation."
        return 0
    fi

    if [ -z "${DB_DATABASE:-}" ]; then
        echo "ALLOW_DB_CREATE is enabled, but DB_DATABASE is empty. Skipping database creation."
        return 0
    fi

    php <<'PHP'
<?php
$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '3306';
$user = getenv('DB_USERNAME') ?: '';
$pass = getenv('DB_PASSWORD') ?: '';
$socket = getenv('DB_SOCKET') ?: '';
$database = getenv('DB_DATABASE') ?: '';

if ($database === '') {
    fwrite(STDERR, "DB_DATABASE is empty.\n");
    exit(1);
}

$dsn = $socket !== ''
    ? "mysql:unix_socket={$socket};charset=utf8mb4"
    : "mysql:host={$host};port={$port};charset=utf8mb4";

$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

$safeDatabase = str_replace('`', '``', $database);
$pdo->exec("CREATE DATABASE IF NOT EXISTS `{$safeDatabase}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
echo "Database checked/created: {$database}\n";
PHP
}

run_migrations_if_enabled() {
    if ! is_enabled "${RUN_MIGRATIONS:-0}"; then
        return 0
    fi

    if is_enabled "${FORCE_SCHEMA_BOOTSTRAP:-0}"; then
        migrate_cmd="php artisan migrate:fresh --force"
        echo "FORCE_SCHEMA_BOOTSTRAP is enabled. Running destructive schema bootstrap."
    else
        migrate_cmd="php artisan migrate --force"
    fi

    max_attempts="${MIGRATION_MAX_ATTEMPTS:-30}"
    attempt=1
    while [ "$attempt" -le "$max_attempts" ]; do
        if sh -c "$migrate_cmd"; then
            echo "Database migrations completed."
            return 0
        fi

        echo "Migration attempt ${attempt}/${max_attempts} failed. Retrying in 2s..."
        attempt=$((attempt + 1))
        sleep 2
    done

    echo "Migrations failed after ${max_attempts} attempts."
    exit 1
}

create_database_if_needed
run_migrations_if_enabled

exec "$@"
SH

COPY backend/ ./
COPY --from=backend-deps /app/vendor ./vendor
COPY --from=frontend-build /app/dist ./public

RUN mkdir -p \
        bootstrap/cache \
        storage/app/private \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/testing \
        storage/framework/views \
        storage/logs \
    && rm -f bootstrap/cache/*.php \
    && php artisan package:discover --ansi \
    && chmod +x /usr/local/bin/entrypoint.sh \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["apache2-foreground"]
