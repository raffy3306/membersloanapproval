# Members Loan Approval - Project Structure

## Folder Organization

This project is now organized with clear separation between frontend and backend:

```
MembersLoanApproval/
├── frontend/                    # React Frontend Application
│   ├── src/                    # Source code
│   │   ├── App.tsx            # Main React component
│   │   ├── main.tsx           # React entry point
│   │   ├── styles.css         # Global styles
│   │   ├── vite-env.d.ts     # Vite environment types
│   │   ├── services/
│   │   │   ├── laravelApiClient.ts    # New Laravel API client
│   │   │   └── appsScriptClient.ts    # Compatibility wrapper
│   │   └── config/
│   │       └── googleAppsScript.ts    # Configuration
│   │
│   ├── public/                 # Static assets
│   │   └── login-assets/      # Login page assets
│   │
│   ├── package.json           # Frontend dependencies
│   ├── tsconfig.json          # TypeScript config
│   ├── tsconfig.app.json      # App TypeScript config
│   ├── tsconfig.node.json     # Node TypeScript config
│   ├── vite.config.ts        # Vite configuration
│   ├── .env.local            # Environment variables
│   ├── index.html            # Login page entry
│   ├── teller.html           # Teller dashboard entry
│   ├── manager.html          # Manager dashboard entry
│   ├── approver.html         # Approver dashboard entry
│   └── admin.html            # Admin dashboard entry
│
├── backend/                    # Laravel Backend Application
│   ├── app/
│   │   ├── Models/           # Eloquent models (9 models)
│   │   └── Http/Controllers/Api/    # API controllers (7 controllers)
│   │
│   ├── database/
│   │   ├── migrations/       # Database migrations (9 migrations)
│   │   └── seeders/         # Database seeders
│   │
│   ├── routes/
│   │   └── api.php          # API routes
│   │
│   ├── config/              # Configuration files
│   ├── .env                # Environment configuration
│   ├── .env.example        # Environment template
│   ├── composer.json       # PHP dependencies
│   ├── package.json
│   ├── README.md           # Backend documentation
│   └── SETUP.md            # Detailed setup guide
│
├── docs/                   # Documentation
│   └── google-apps-script-setup.md
│
├── masterlist.csv         # Master list data
├── REFACTORING_SUMMARY.md # Overview of changes
├── MIGRATION_GUIDE.md     # Migration from Google Apps Script
└── INSTALLATION_CHECKLIST.md # Setup verification guide
```

## Running the Applications

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Backend

```bash
cd backend
composer install
php artisan serve
```

Backend runs on: `http://localhost:8000`

## Environment Configuration

### Frontend (.env.local)
Located in `frontend/.env.local`:
```env
VITE_LARAVEL_API_URL=http://localhost:8000/api
```

### Backend (.env)
Located in `backend/.env`:
```env
DB_DATABASE=members_loan_approval
DB_USERNAME=root
DB_PASSWORD=
JWT_SECRET=generated_by_php_artisan_jwt:secret
```

## Key Changes from Original Structure

### Before (Monolithic)
- All files in root directory
- `src/` and `public/` directly at root
- Configuration files scattered
- No clear separation

### After (Separated)
- `frontend/` - All React/TypeScript frontend code
- `backend/` - All Laravel PHP backend code
- Clear isolation between frontend and backend
- Easier to deploy and maintain independently
- Better for scaling and containerization

## File Migration Summary

| Original Location | New Location |
|---|---|
| `src/` | `frontend/src/` |
| `public/` | `frontend/public/` |
| `package.json` | `frontend/package.json` |
| `vite.config.ts` | `frontend/vite.config.ts` |
| `tsconfig*.json` | `frontend/tsconfig*.json` |
| `index.html, teller.html, etc.` | `frontend/*.html` |
| `.env.local` | `frontend/.env.local` |
| `backend/` | `backend/` (unchanged) |

## Benefits of This Structure

✅ **Clear Separation of Concerns**
- Frontend and backend are completely isolated
- Easier to understand and maintain

✅ **Independent Deployment**
- Frontend can be deployed to static hosting or CDN
- Backend can be deployed to server/cloud independently

✅ **Development Workflow**
- Can run frontend and backend on different ports
- Easier to develop both concurrently

✅ **Team Organization**
- Frontend team works in `frontend/` folder
- Backend team works in `backend/` folder
- No conflicts or confusion

✅ **Container Ready**
- Easy to create separate Docker containers
- Can scale frontend and backend independently

✅ **Build Optimization**
- Frontend builds produce static files only
- Backend PHP files served directly
- Smaller build sizes

## API Communication

Frontend communicates with backend via HTTP REST API:

```
Frontend (React)
    ↓
    ↓ HTTP API calls
    ↓
Backend (Laravel)
    ↓
    ↓ Database queries
    ↓
MySQL Database
```

## Getting Started

1. **Install Dependencies**
   ```bash
   cd frontend && npm install
   cd ../backend && composer install
   ```

2. **Configure Environment**
   - Set up `backend/.env` with database credentials
   - Frontend `.env.local` is already configured

3. **Run Migrations**
   ```bash
   cd backend
   php artisan migrate
   ```

4. **Start Development Servers**
   - Terminal 1: `cd frontend && npm run dev`
   - Terminal 2: `cd backend && php artisan serve`

5. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000/api`

## Documentation

- **Backend Setup:** See [backend/SETUP.md](backend/SETUP.md)
- **Migration Guide:** See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **Refactoring Summary:** See [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)
- **Installation Checklist:** See [INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md)

## Support

For detailed information about setup and deployment, refer to the documentation files in the project root.

---

**Note:** This structure makes it much easier to scale, maintain, and deploy the application separately for frontend and backend services.
