# Quick Start Guide - Frontend & Backend Separated

## 📂 Project Structure Overview

```
MembersLoanApproval/
├── frontend/          ← React TypeScript app (port 5173)
├── backend/           ← Laravel PHP API (port 8000)
├── docs/              ← Documentation
└── [config files]
```

## 🚀 Quick Setup (< 5 minutes)

### Step 1: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 2: Install Backend Dependencies
```bash
cd backend
composer install
```

### Step 3: Configure Backend Database
Edit `backend/.env`:
```env
DB_DATABASE=members_loan_approval
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Step 4: Generate JWT Secret
```bash
cd backend
php artisan jwt:secret
```

### Step 5: Run Migrations
```bash
cd backend
php artisan migrate
```

## ▶️ Running Both Applications

### Option A: Two Terminal Tabs

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
→ Runs on `http://localhost:5173`

**Terminal 2 - Backend:**
```bash
cd backend
php artisan serve
```
→ API on `http://localhost:8000/api`

### Option B: Run Backend First
```bash
cd backend
php artisan serve

# In another terminal:
cd frontend
npm run dev
```

## 🌐 Access the Application

1. **Login Page:** `http://localhost:5173`
2. **API Docs:** `http://localhost:8000/api/health`

### Sample Login Credentials
(After database seeding)
- Email: `admin@example.com` (admin)
- Email: `teller@example.com` (teller)
- Email: `manager@example.com` (manager)
- Email: `approver@example.com` (approver)

## 📱 Dashboard Entry Points

| Role | URL | File |
|------|-----|------|
| Login | `http://localhost:5173/` | `frontend/index.html` |
| Teller | `http://localhost:5173/teller.html` | `frontend/teller.html` |
| Manager | `http://localhost:5173/manager.html` | `frontend/manager.html` |
| Approver | `http://localhost:5173/approver.html` | `frontend/approver.html` |
| Admin | `http://localhost:5173/admin.html` | `frontend/admin.html` |

## 🛠️ Development

### Frontend Development
```bash
cd frontend

# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
cd backend

# Start development server
php artisan serve

# Run tests
php artisan test

# Tinker shell (interactive)
php artisan tinker
```

## 🔌 API Integration

Frontend automatically connects to backend API via:
- **File:** `frontend/src/services/laravelApiClient.ts`
- **Base URL:** `http://localhost:8000/api`
- **Auth:** JWT tokens in localStorage

### Example API Usage
```typescript
// frontend/src/services/laravelApiClient.ts
import { login, getLoanRequests, createLoanRequest } from './laravelApiClient';

// Login
const user = await login({
  email: 'user@example.com',
  password: 'password'
});

// Get loan requests
const { requests } = await getLoanRequests({
  view: 'pending',
  dashboard: 'teller'
});

// Create new request
await createLoanRequest({
  member_id: 123,
  loan_type_id: 1,
  amount_applied: 50000
});
```

## 📋 Important Files

### Frontend
- `frontend/.env.local` - Frontend environment config
- `frontend/package.json` - Frontend dependencies
- `frontend/src/App.tsx` - Main React component
- `frontend/src/services/laravelApiClient.ts` - API client

### Backend
- `backend/.env` - Backend environment config
- `backend/composer.json` - PHP dependencies
- `backend/routes/api.php` - API routes
- `backend/database/migrations/` - Database schema

## ⚙️ Troubleshooting

### Frontend Won't Start
```bash
# Clear node modules and reinstall
cd frontend
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Backend API Not Responding
```bash
# Check if port 8000 is available
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Restart artisan
cd backend
php artisan serve
```

### Database Connection Error
```bash
# Verify .env settings
cat backend/.env | grep DB_

# Test connection
cd backend
php artisan tinker
# Type: DB::connection()->getPdo();
```

### CORS Issues
Backend CORS is configured for `http://localhost:5173`
Edit `backend/config/cors.php` if using different frontend URL

## 📚 Documentation Files

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Full structure overview
- **[SEPARATION_COMPLETE.md](SEPARATION_COMPLETE.md)** - Separation details
- **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** - What was created
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Data migration from Google Sheets
- **[INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md)** - Verification steps
- **[backend/SETUP.md](backend/SETUP.md)** - Detailed backend setup

## 🔐 Security Notes

For **production deployment**:
1. Update JWT_SECRET in `backend/.env`
2. Set `APP_DEBUG=false` in `backend/.env`
3. Configure CORS for production domain
4. Use environment-specific database
5. Deploy frontend to static hosting (Vercel, Netlify, etc.)
6. Deploy backend to server with SSL/HTTPS

## 📞 Common Commands

### Frontend Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Check TypeScript
npm install          # Install dependencies
```

### Backend Commands
```bash
php artisan serve                    # Start server
php artisan migrate                  # Run migrations
php artisan tinker                   # Interactive shell
php artisan jwt:secret               # Generate JWT secret
php artisan cache:clear              # Clear cache
php artisan config:cache             # Cache config
```

## ✅ Verification Checklist

- [ ] Frontend running on `http://localhost:5173`
- [ ] Backend running on `http://localhost:8000`
- [ ] Can access login page
- [ ] Can login with test credentials
- [ ] Dashboard loads after login
- [ ] API responds to requests
- [ ] Database is connected

---

**Ready to start?** Run these two commands in separate terminals:

```bash
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd backend && php artisan serve
```

Then open `http://localhost:5173` in your browser!
