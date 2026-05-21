# Members Loan Approval Backend - Laravel

A Laravel-based backend service for the Members Loan Approval System using MySQL database.

## Quick Start

```bash
# Install dependencies
composer install

# Setup environment
copy .env.example .env
php artisan key:generate
php artisan jwt:secret

# Configure database in .env
# DB_DATABASE=members_loan_approval
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations
php artisan migrate

# Start server
php artisan serve
```

Server runs on: `http://localhost:8000`

## Features

- ✅ JWT-based authentication
- ✅ Role-based access control (Teller, Manager, Approver, Admin)
- ✅ Complete loan request workflow management
- ✅ Member database management
- ✅ Multi-branch support
- ✅ User management (Admin)
- ✅ Settings management
- ✅ MySQL database with proper relationships
- ✅ CORS support for frontend
- ✅ Comprehensive API documentation

## Database

- **Database:** MySQL
- **Tables:** 9 (users, members, branches, loan_types, loan_requests, comakers, other_loans, securities, settings)
- **Relationships:** Proper foreign keys and constraints

## API Documentation

See [SETUP.md](SETUP.md) for complete API documentation and setup instructions.

## Key Endpoints

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`

### Resources
- `GET/POST /api/loan-requests`
- `GET/POST /api/members`
- `GET/POST /api/users` (Admin)
- `GET/PUT /api/settings` (Admin)
- `GET /api/health`

## Environment Variables

```env
APP_NAME="Members Loan Approval"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=members_loan_approval
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=your-secret-key-here
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Requirements

- PHP 8.1+
- Composer
- MySQL 8.0+

## License

All rights reserved.
