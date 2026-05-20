# SMTBMS Startup Guide

## Prerequisites
- Node.js 16+ installed
- MySQL Server running with `smtbms` database
- User tables already created: `users`, `employees`, `materials`, `customers`

## Quick Start

### 1. Configure Backend Environment

Edit `backend/.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smtbms
JWT_SECRET=smtbmssecret
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

Expected output:
```
SMTBMS backend listening on port 5000
```

### 3. Start Frontend Application

In a new terminal:
```bash
cd frontend
npm start
```

The frontend will open at `http://localhost:3000`

## Test Accounts

Create test users directly in MySQL:

```sql
INSERT INTO users (name, email, password, role, phone, created_at) 
VALUES 
('Admin User', 'admin@smtbms.com', '$2a$10/..hashed_password..', 'Admin', '555-0001', NOW()),
('HR Manager', 'hr@smtbms.com', '$2a$10/..hashed_password..', 'HR', '555-0002', NOW());
```

Or register through the frontend at `/register`.

## Features

### Dashboard
- Real-time stats: total users, materials, employees, customers
- Inventory trend charts
- Weekly KPI dashboard
- Low stock alerts

### Material Tracking
- Add/Edit/Delete materials
- Search and filter by category
- Low stock indicators
- Supplier and location tracking

### HRMS
- Employee roster and management
- Attendance tracking
- Leave balance overview
- Payroll summaries by department

### ERP
- Procurement tracking
- Vendor management dashboard
- Financial summaries
- Order management

### CRM
- Customer management
- Sales pipeline tracking
- Lead management
- Conversion analytics

### Reports
- Monthly spend analysis
- Sales pipeline trends
- Revenue and retention metrics
- Supplier quality scores

### Settings
- Account preferences
- Theme toggle (light/dark mode)
- Password management

## Authentication

- JWT token stored in localStorage
- Token required for all API calls
- Role-based access control on all endpoints
- Supported roles: Admin, HR, Manager, Employee, Sales

## Troubleshooting

**Backend won't start**: Check MySQL connection in `.env` and ensure the database exists.
**CORS error**: Ensure backend is running on port 5000.
**Login fails**: Verify user exists in `users` table with correct email/password.
**Charts don't render**: Wait for backend data to load; refresh the page.

## Project Structure

```
SMTBMS/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/authMiddleware.js
│   ├── routes/
│   ├── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── layouts/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```
