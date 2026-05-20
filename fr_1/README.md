# SMTBMS

Smart Material Tracking and Business Management System built with React, Bootstrap, Node.js, Express, and MySQL.

## Structure

- `backend/` - Express API, JWT authentication, role-based middleware, CRUD endpoints
- `frontend/` - React dashboard, Bootstrap UI, React Router, Axios API integration

## Setup

1. Configure `backend/.env` with your MySQL credentials.
2. Open two terminals.

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Notes

- The backend expects the existing `smtbms` database and tables: `users`, `employees`, `materials`, `customers`.
- Do not run any schema creation scripts from this project.
- Authentication requires valid user records in the `users` table.
