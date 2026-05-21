# Migration Guide: Google Apps Script to Laravel

This document provides a complete guide for migrating the Members Loan Approval System from Google Apps Script backend to Laravel with MySQL database.

## Overview of Changes

### Before (Google Apps Script)
- **Backend:** Google Apps Script
- **Database:** Google Sheets
- **Authentication:** Custom session management in Google Sheets
- **Deployment:** Google Apps Script deployment

### After (Laravel)
- **Backend:** PHP Laravel framework
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **Deployment:** Traditional PHP/Laravel server

## Step-by-Step Migration

### Phase 1: Setup Laravel Backend

#### 1. Install Laravel Backend
```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan jwt:secret
```

#### 2. Configure MySQL Database
Update `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=members_loan_approval
DB_USERNAME=root
DB_PASSWORD=
```

Create the database:
```bash
mysql -u root -p
CREATE DATABASE members_loan_approval CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 3. Run Migrations
```bash
php artisan migrate
```

This creates all required tables with proper relationships.

### Phase 2: Data Migration from Google Sheets to MySQL

#### 1. Export Data from Google Sheets

Export each sheet as CSV:
- Users sheet → users.csv
- MasterList sheet → members.csv
- LoanType sheet → loan_types.csv
- LoanRequest sheet → loan_requests.csv
- OtherLoans sheet → other_loans.csv
- Comakers sheet → comakers.csv
- Securities sheet → securities.csv
- Branch sheet → branches.csv

#### 2. Create Database Seeders

Create seeders to import CSV data:

```bash
php artisan make:seeder BranchSeeder
php artisan make:seeder UserSeeder
php artisan make:seeder LoanTypeSeeder
php artisan make:seeder MemberSeeder
php artisan make:seeder LoanRequestSeeder
```

#### 3. Implement CSV Import

Example for BranchSeeder:
```php
<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $file = fopen(storage_path('app/imports/branches.csv'), 'r');
        $header = fgetcsv($file);

        while ($row = fgetcsv($file)) {
            $data = array_combine($header, $row);
            Branch::create($data);
        }

        fclose($file);
    }
}
```

Place CSV files in `storage/app/imports/` directory.

#### 4. Run Seeders
```bash
php artisan db:seed
```

### Phase 3: Update Frontend Configuration

#### 1. Update Environment Variables

Edit `.env.local`:
```env
VITE_LARAVEL_API_URL=http://localhost:8000/api
```

#### 2. API Client Migration

The frontend automatically uses the new Laravel API client. The `src/services/laravelApiClient.ts` replaces `appsScriptClient.ts` for:
- Authentication (now using JWT)
- Loan request management
- Member management
- User management
- Settings management

### Phase 4: Testing

#### 1. Start Laravel Backend
```bash
cd backend
php artisan serve
```

Backend runs on: `http://localhost:8000`

#### 2. Start Frontend Development Server
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173` (or configured port)

#### 3. Test Login
- Navigate to login page
- Use credentials from migrated users
- Verify JWT token is generated and stored
- Check that user dashboard loads correctly

#### 4. Test Core Features
- [ ] User login/logout
- [ ] View pending loan requests
- [ ] Create new loan request
- [ ] Update loan request status
- [ ] Search members
- [ ] View request history
- [ ] Admin user management (if applicable)

### Phase 5: Deployment

#### Production Setup

1. **Server Requirements:**
   - PHP 8.1 or higher
   - MySQL 8.0 or higher
   - Nginx or Apache with PHP-FPM
   - Composer installed on server

2. **Backend Deployment:**
   ```bash
   # On production server
   git clone <repository>
   cd backend
   composer install --no-dev
   cp .env.example .env
   php artisan key:generate
   php artisan jwt:secret
   ```

3. **Environment Configuration:**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   DB_HOST=production-db-host
   DB_DATABASE=members_loan_approval_prod
   DB_USERNAME=prod_user
   DB_PASSWORD=strong_password
   JWT_SECRET=secure_random_string
   CORS_ALLOWED_ORIGINS=https://yourdomain.com
   ```

4. **Run Migrations:**
   ```bash
   php artisan migrate --force
   ```

5. **Cache Configuration:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

6. **Set File Permissions:**
   ```bash
   chown -R www-data:www-data /path/to/backend
   chmod -R 755 /path/to/backend
   chmod -R 777 /path/to/backend/storage
   chmod -R 777 /path/to/backend/bootstrap/cache
   ```

7. **Configure Web Server:**

   **Nginx:**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       root /path/to/backend/public;

       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;

       index index.php;

       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }

       location ~ \.php$ {
           fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
           fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
           include fastcgi_params;
       }

       location ~ /\.(?!well-known).* {
           deny all;
       }
   }
   ```

8. **Frontend Deployment:**
   ```bash
   npm run build
   # Deploy dist/ folder to static hosting or web server
   ```

## API Changes Summary

### Authentication
- **Old:** Custom session storage in Google Sheets
- **New:** JWT tokens in Authorization header

### Request Format
- **Old:** `google.script.run.functionName(params)`
- **New:** `fetch('/api/endpoint', { method, headers, body })`

### Response Format
- **Old:** JavaScript callbacks
- **New:** JSON with `{ success, data, message }`

### Endpoints
All endpoints now follow RESTful convention:
- `GET /api/resource` - List
- `POST /api/resource` - Create
- `GET /api/resource/{id}` - Show
- `PUT /api/resource/{id}` - Update
- `DELETE /api/resource/{id}` - Delete

## Rollback Plan

If issues occur, you can rollback to Google Apps Script:

1. Keep Google Apps Script deployment active during transition
2. In frontend config, can switch back to Google Apps Script URL
3. Keep Google Sheets data intact as backup
4. Monitor error logs during initial migration

## Troubleshooting

### Database Connection Issues
```bash
# Verify MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# Check .env database credentials
cat .env | grep DB_
```

### JWT Token Issues
```bash
# Regenerate JWT secret
php artisan jwt:secret

# Clear config cache
php artisan config:clear
```

### CORS Errors
Update `.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### Permission Errors
```bash
chmod -R 755 storage bootstrap/cache
chmod -R 777 storage/logs
```

## Performance Optimization

1. **Database Indexing:** Migrations include proper indexes
2. **Query Optimization:** Use eager loading with `->with()`
3. **Caching:** Implement Redis caching for frequently accessed data
4. **API Rate Limiting:** Add rate limiting middleware for security

## Support and Maintenance

### Regular Tasks
- Monitor error logs: `storage/logs/laravel.log`
- Update dependencies: `composer update`
- Backup database regularly
- Review JWT secret rotation policy

### Monitoring
Monitor these metrics:
- API response times
- Database query performance
- Error rates
- Authentication failures
- Concurrent user load

## Conclusion

This migration provides:
- ✅ Improved performance with dedicated backend
- ✅ Better security with JWT and proper database structure
- ✅ Easier maintenance and scaling
- ✅ Professional deployment options
- ✅ Better error handling and logging
- ✅ Full RESTful API design
