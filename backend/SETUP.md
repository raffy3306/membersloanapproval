# Members Loan Approval - Laravel Backend Setup Guide

## Overview
This is a Laravel 11 backend for the Members Loan Approval System, replacing the Google Apps Script backend. It uses MySQL as the database and JWT for authentication.

## Prerequisites
- PHP 8.1 or higher
- Composer
- MySQL 8.0 or higher
- Node.js (optional, for frontend development)

## Installation Steps

### 1. Environment Setup

#### Clone/Navigate to Backend Directory
```bash
cd backend
```

#### Install Dependencies
```bash
composer install
```

#### Generate Application Key
```bash
php artisan key:generate
```

#### Generate JWT Secret
```bash
php artisan jwt:secret
```

#### Copy Environment File
```bash
copy .env.example .env
```

### 2. Configure Database

Edit `.env` file with your MySQL credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=members_loan_approval
DB_USERNAME=root
DB_PASSWORD=
```

Create MySQL database (optional - Laravel can create it):
```bash
mysql -u root -p
CREATE DATABASE members_loan_approval CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Run Migrations

```bash
php artisan migrate
```

This will create all required tables:
- branches
- users
- loan_types
- members
- loan_requests
- other_loans
- comakers
- securities
- settings
- password_reset_tokens

### 4. Configure EmailJS Password Reset Delivery

Create an EmailJS email service and a password-reset template, then set these values in `.env`:

```env
EMAILJS_ENDPOINT=https://api.emailjs.com/api/v1.0/email/send
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_PASSWORD_RESET_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
EMAILJS_TIMEOUT=15
```

Configure the EmailJS template recipient as `{{to_email}}`. The backend supplies these template parameters:

- `to_email`
- `to_name`
- `reset_url`
- `expires_in_minutes`
- `app_name`

The template body must include a link to `{{reset_url}}`. Keep the private key only in the Laravel `.env` file; do not add it to the React environment.

### 5. Seed Database (Optional)

Set a unique initial password (at least 12 characters) and create the initial data:
```env
INITIAL_USER_PASSWORD=replace-with-a-unique-secret
```

```bash
php artisan db:seed
```

The seeded accounts are forced to change this password on first login. Do not reuse this value in production.

### 6. Configure CORS

Edit `.env` to allow frontend origins:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 7. Start Development Server

```bash
php artisan serve
```

The backend will run on: `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password

### Loan Requests
- `GET /api/loan-requests` - Paginated loan summaries (`view`, `date_from`, `date_to`, `page`, `per_page`)
- `GET /api/loan-requests/audit` - Paginated admin audit summaries with the same date/page filters
- `POST /api/loan-requests` - Create loan request
- `GET /api/loan-requests/{id}` - Get loan request
- `PUT /api/loan-requests/{id}` - Update loan request
- `DELETE /api/loan-requests/{id}` - Delete loan request

Loan list and audit requests default to the current calendar month in `APP_TIMEZONE`. The maximum `per_page` value is 100; use the detail endpoint when the full related request data is needed.

### Members
- `GET /api/members` - List members
- `POST /api/members` - Create member
- `GET /api/members/{id}` - Get member
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member

### Users (Admin)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Settings (Admin)
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### Health
- `GET /api/health` - Check backend health

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Request
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Response
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "admin",
      "fullname": "John Doe",
      ...
    }
  }
}
```

### Use Token in Requests
```bash
curl -X GET http://localhost:8000/api/loan-requests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Database Schema

### Users Table
- id, email (unique), password, role, fullname, position, branch_id, first_login, last_login_at

### Members Table
- id, cif_key (unique), fullname, member_type, sex, age, birth_date, contact, address, location, status, tin, monthly_income, occupation, educational_attainment, membership_date, share_capital, date_of_retirement

### Loan Requests Table
- id, request_id (unique), request_date, member_id (FK), loan_type_id (FK), branch_id (FK), amount_applied, loan_balance, employer, position, employers_address, monthly_pension, current_nthp, analysis_nthp, status, requested_by (FK), manager_notes, approver_notes, manager_id (FK), review_and_recommendations, date_of_approval, loan_amount_approved, additional_requirements, appraisal_result, recommendation

### Related Tables
- loan_types: loan_type_name, description, minimum_amount, maximum_amount, maximum_term_months, interest_rate, is_active
- comakers: loan_request_id (FK), member_id (FK), comaker_fullname, loan_type, loan_amount, loan_balance, status
- other_loans: loan_request_id (FK), member_id (FK), loan_type, loan_amount, balance, status, analysis
- securities: loan_request_id (FK), nature, market_value, appraised_value
- branches: branch_code, branch_name, address, phone
- settings: key, value

## Important Notes

### Environment Configuration
Update these in `.env` file:
- `APP_KEY` - Generated by `php artisan key:generate`
- `JWT_SECRET` - Generated by `php artisan jwt:secret`
- `DB_*` - Database credentials
- `CORS_ALLOWED_ORIGINS` - Frontend URLs allowed to access API
- `APP_TIMEZONE` - Application month/date boundary (recommended: `Asia/Manila`)
- `CACHE_STORE` - Use `redis` in production so rate limits are shared across instances
- `REDIS_*` - Redis connection used by the shared cache and rate limiter
- `ATTACHMENT_DISK` - Use `s3` for shared attachment storage in multi-instance deployments
- `AWS_*` - S3 or S3-compatible object-storage credentials and endpoint

### Security
- Always use HTTPS in production
- Keep `.env` file secure and never commit it to version control
- Rotate JWT secret regularly
- Use strong database passwords

### Deployment
For production deployment:
1. Set `APP_DEBUG=false` in `.env`
2. Set `APP_ENV=production` in `.env`
3. Run `php artisan config:cache`
4. Run `php artisan route:cache`
5. Set `CACHE_STORE=redis` and configure `REDIS_*` when running multiple instances
6. Set `ATTACHMENT_DISK=s3` and configure `AWS_*` when running multiple instances
7. Ensure proper file permissions
8. Use a proper PHP application server (not `php artisan serve`)

## Troubleshooting

### Database Connection Error
```
Check DB_* settings in .env
Ensure MySQL is running
Verify database exists
```

### JWT Secret Not Set
```bash
php artisan jwt:secret
```

### Migrations Not Running
```bash
php artisan migrate:fresh
```

To include seed data, set `INITIAL_USER_PASSWORD` first and then add `--seed`.

### CORS Issues
Update `CORS_ALLOWED_ORIGINS` in `.env` with your frontend URL

## Support
For issues or questions, refer to the Laravel documentation at https://laravel.com
