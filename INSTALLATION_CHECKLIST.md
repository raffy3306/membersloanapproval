# Installation Checklist

Use this checklist to guide you through the complete setup process.

## Prerequisites ✓

- [ ] PHP 8.1 or higher installed
- [ ] Composer installed (https://getcomposer.org)
- [ ] MySQL 8.0 or higher installed and running
- [ ] Node.js installed (for frontend)
- [ ] Git installed (if using version control)

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```
- [ ] Successfully navigated to backend folder

### 2. Install PHP Dependencies
```bash
composer install
```
- [ ] All dependencies installed successfully

### 3. Generate Application Key
```bash
php artisan key:generate
```
- [ ] APP_KEY generated in .env

### 4. Generate JWT Secret
```bash
php artisan jwt:secret
```
- [ ] JWT_SECRET generated in .env

### 5. Configure Database

Edit `.env` file:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=members_loan_approval
DB_USERNAME=root
DB_PASSWORD=
```
- [ ] Database credentials updated in .env

Create MySQL database:
```bash
mysql -u root -p
CREATE DATABASE members_loan_approval CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```
- [ ] MySQL database created

### 6. Run Database Migrations
```bash
php artisan migrate
```
- [ ] All 9 tables created successfully:
  - [ ] branches
  - [ ] users
  - [ ] loan_types
  - [ ] members
  - [ ] loan_requests
  - [ ] other_loans
  - [ ] comakers
  - [ ] securities
  - [ ] settings

### 7. (Optional) Seed Database
```bash
php artisan db:seed
```
- [ ] Initial data loaded (if seeders created)

### 8. Configure CORS

Edit `.env` - ensure CORS_ALLOWED_ORIGINS is set:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```
- [ ] CORS_ALLOWED_ORIGINS configured

### 9. Start Backend Server
```bash
php artisan serve
```
- [ ] Backend running on `http://localhost:8000`
- [ ] Health check: `curl http://localhost:8000/api/health`

## Frontend Setup

### 1. Update Environment Configuration

Edit `.env.local`:
```env
VITE_LARAVEL_API_URL=http://localhost:8000/api
```
- [ ] VITE_LARAVEL_API_URL set to Laravel backend

### 2. Install Frontend Dependencies
```bash
npm install
```
- [ ] All dependencies installed

### 3. Start Frontend Development Server
```bash
npm run dev
```
- [ ] Frontend running on `http://localhost:5173`

## Testing

### 1. Health Check
```bash
curl http://localhost:8000/api/health
```
- [ ] Returns health status JSON

### 2. Test Login
- [ ] Navigate to http://localhost:5173
- [ ] Enter test credentials
- [ ] Verify login successful
- [ ] JWT token stored in localStorage

### 3. Test Core Features
- [ ] View dashboard
- [ ] View pending requests
- [ ] Create new loan request
- [ ] Update request status
- [ ] Search members
- [ ] View request history

### 4. Test Admin Features (if applicable)
- [ ] Access user management
- [ ] Create new user
- [ ] Update user
- [ ] Manage settings

## Data Migration (Optional)

### 1. Export from Google Sheets
- [ ] Export Users sheet → users.csv
- [ ] Export MasterList sheet → members.csv
- [ ] Export LoanType sheet → loan_types.csv
- [ ] Export LoanRequest sheet → loan_requests.csv
- [ ] Export other sheets as needed

### 2. Import to MySQL
- [ ] Place CSV files in `backend/storage/app/imports/`
- [ ] Create seeders for each CSV
- [ ] Run `php artisan db:seed`
- [ ] Verify data imported correctly

## Production Deployment

### Backend Deployment
- [ ] Set `APP_ENV=production` in .env
- [ ] Set `APP_DEBUG=false` in .env
- [ ] Set strong `JWT_SECRET`
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`
- [ ] Set proper file permissions
- [ ] Configure web server (Nginx/Apache)
- [ ] Set up database backups

### Frontend Deployment
- [ ] Run `npm run build`
- [ ] Deploy `dist/` folder to hosting
- [ ] Configure API URL for production

## Documentation Review

- [ ] Read `REFACTORING_SUMMARY.md` - Overview of changes
- [ ] Read `MIGRATION_GUIDE.md` - Detailed migration steps
- [ ] Read `backend/README.md` - Backend documentation
- [ ] Read `backend/SETUP.md` - API endpoints and setup details

## Troubleshooting

If you encounter issues:

### Database Connection Error
- [ ] Verify MySQL is running
- [ ] Check `.env` database credentials
- [ ] Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### JWT Secret Not Set
- [ ] Run `php artisan jwt:secret`
- [ ] Clear config cache: `php artisan config:clear`

### CORS Errors in Frontend
- [ ] Check `CORS_ALLOWED_ORIGINS` in `.env`
- [ ] Ensure frontend URL is included
- [ ] Restart backend server

### Frontend Can't Connect to Backend
- [ ] Verify backend running: `curl http://localhost:8000/api/health`
- [ ] Check `VITE_LARAVEL_API_URL` in `.env.local`
- [ ] Check browser console for errors
- [ ] Verify CORS configuration

### Port Already in Use
- [ ] Backend: `php artisan serve --port=8001`
- [ ] Frontend: `npm run dev -- --port 3001`

## Final Verification

- [ ] Backend serves on http://localhost:8000
- [ ] Frontend serves on http://localhost:5173
- [ ] API health check returns 200
- [ ] Login successful with valid credentials
- [ ] JWT token stored in browser
- [ ] Loan requests can be viewed
- [ ] New loan request can be created
- [ ] Settings can be accessed (admin)

## Support

- 📖 See `REFACTORING_SUMMARY.md` for overview
- 📖 See `MIGRATION_GUIDE.md` for detailed steps
- 📖 See `backend/SETUP.md` for API documentation
- 🐛 Check `backend/storage/logs/laravel.log` for errors
- 💬 Refer to Laravel documentation: https://laravel.com

## Completion ✅

Once all checkboxes are checked, your system is:
- ✅ Successfully installed
- ✅ Configured and running
- ✅ Ready for development or production

**Congratulations on successfully migrating to Laravel and MySQL! 🎉**
