# syntax=docker/dockerfile:1

FROM php:8.2-cli AS backend-deps
WORKDIR /app

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

COPY backend/ ./
COPY --from=backend-deps /app/vendor ./vendor
COPY --from=frontend-build /app/dist ./public

RUN rm -f bootstrap/cache/*.php \
    && php artisan package:discover --ansi \
    && mkdir -p \
        storage/app/private \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/testing \
        storage/framework/views \
        storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

CMD ["apache2-foreground"]
