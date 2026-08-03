# SMTBMS Documentation

## Table of Contents
1. [Overview](#1-overview)
2. [Setup & Installation](#2-setup--installation)
3. [Architecture](#3-architecture)
4. [Module & File Breakdown](#4-module--file-breakdown)
5. [API Reference](#5-api-reference)
6. [Configuration Reference](#6-configuration-reference)
7. [Contributing Guidelines](#7-contributing-guidelines)
8. [Changelog](#8-changelog)
9. [FAQ & Troubleshooting](#9-faq--troubleshooting)
10. [Assumptions & Notes](#10-assumptions--notes)

---

## 1. Overview
The **Smart Material Tracking and Business Management System (SMTBMS)** is a comprehensive full-stack application designed to streamline internal company operations. It features integrated modules for Human Resources Management (HRMS), Enterprise Resource Planning (ERP), Customer Relationship Management (CRM), and advanced Material Tracking. 

**Tech Stack:**
- **Frontend:** React (Create React App), Bootstrap 5, Chart.js, Axios, React Router, HTML5 QR Code.
- **Backend:** Node.js, Express.js, MySQL 2, JSON Web Tokens (JWT) for Auth, bcryptjs.
- **Database:** MySQL.
- **Architecture Summary:** The system follows a standard client-server architecture. The React frontend consumes a RESTful Node.js/Express API. The backend interacts directly with a MySQL database via the `mysql2` promise wrapper and utilizes JWT middleware for role-based access control (Admin, HR, Manager, Employee, Sales, Finance).

---

## 2. Setup & Installation

### Prerequisites
- Node.js (v16+)
- MySQL Server (v8+)

### Installation Steps
1. **Clone the repository** and navigate to the root directory.
2. **Setup the Database:** Ensure a MySQL database named `smtbms` exists along with the necessary tables (`users`, `employees`, `materials`, `customers`).
3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
4. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

### Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smtbms
JWT_SECRET=your_super_secret_jwt_key
```

### Running Locally
Open two terminal windows:
- **Terminal 1 (Backend):**
  ```bash
  cd backend
  npm run dev
  ```
- **Terminal 2 (Frontend):**
  ```bash
  cd frontend
  npm start
  ```

---

## 3. Architecture

The application adopts a monolithic layered architecture for the backend and a component-based UI for the frontend.

### Data Flow
1. **Client:** The React frontend triggers an API call via Axios.
2. **Gateway/Middleware:** The Express server intercepts the request, verifying the JWT token and validating the user's role using `authMiddleware`.
3. **Controller:** The route maps to a specific Controller which processes business logic.
4. **Database:** The Controller executes SQL queries via the `mysql2/promise` pool.
5. **Response:** Data is returned as a JSON response to the React client.

### Folder Structure
```
SMTBMS/
├── backend/
│   ├── config/          # Database connection pool (db.js)
│   ├── controllers/     # Business logic for all modules
│   ├── middleware/      # JWT & Role-based authentication
│   ├── routes/          # Express route definitions
│   └── server.js        # Entry point for backend API
└── frontend/
    ├── public/          # Static assets
    └── src/
        ├── components/  # Reusable UI components (Sidebar, TopNavbar)
        ├── layouts/     # Main page wrappers
        ├── pages/       # Distinct views (Dashboard, LeaveManagement, etc.)
        ├── services/    # Axios API wrappers (api.js, authHelpers.js)
        └── App.js       # Frontend routing
```

---

## 4. Module & File Breakdown

### Backend Modules
- `server.js`: Initializes Express, applies CORS/JSON middleware, and mounts route handlers.
- `config/db.js`: Establishes the MySQL connection pool and sets the timezone context.
- `middleware/authMiddleware.js`: Verifies JWT tokens (`protect`) and enforces role-based authorization (`restrictTo`).
- `controllers/ & routes/`: Organized by business domain:
  - **Auth/Admin:** `authController.js`, `adminController.js` (User registration, roles, system backups).
  - **HRMS:** `hrController.js`, `attendanceController.js`, `leaveController.js`, `employeeController.js`.
  - **CRM:** `customerController.js`, `leadController.js`, `salesController.js`.
  - **ERP:** `materialController.js`, `procurementController.js`, `vendorController.js`.

### Frontend Modules
- `App.js`: Defines all routes using `react-router-dom`. Uses `RoleBasedRoute` for protected paths.
- `components/Sidebar.js` & `TopNavbar.js`: Main navigation UI. The TopNavbar includes a global search index for quick navigation.
- `pages/*`: Contains modular React components for each screen (e.g., `LeaveManagementPage.js`, `DashboardPage.js`).
- `services/api.js`: Centralized Axios instance configuration pointing to the backend API.
- `utils/authHelpers.js`: Local storage token management and role validation for the frontend.

---

## 5. API Reference

All endpoints are prefixed with `/api`. A token must be passed in the `Authorization: Bearer <token>` header for protected routes.

### Authentication
- `POST /api/auth/login` - Authenticate user and return JWT.
- `POST /api/auth/register` - Create a new user (Admin only).

### HRMS (Examples)
- `GET /api/attendance/today` - Fetch today's attendance logs for the workforce.
- `POST /api/attendance/punch-in` - Log an employee check-in.
- `GET /api/leaves` - Get all leave applications.
- `PUT /api/leaves/:id/status` - Update leave status (Approve/Reject).

### Materials & ERP (Examples)
- `GET /api/materials` - List all inventory items.
- `POST /api/materials` - Add new inventory item.
- `GET /api/material-movements` - Fetch historical stock transfers and movements.

*(Note: Explore the `backend/routes/` folder for a comprehensive list of all 100+ endpoints.)*

---

## 6. Configuration Reference

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 5001 |
| `DB_HOST` | MySQL Server Hostname | localhost |
| `DB_USER` | MySQL Username | root |
| `DB_PASSWORD` | MySQL Password | *none* |
| `DB_NAME` | MySQL Database Name | smtbms |
| `JWT_SECRET` | Secret key for signing JWTs | *none* |
| `REACT_APP_API_URL` | Override the default backend URL in the frontend | http://localhost:5001 |

---

## 7. Contributing Guidelines

1. **Code Style:** 
   - Use ES6 syntax.
   - Frontend components should be functional using React Hooks.
   - Extract inline styles into CSS classes where possible to maintain readability.
2. **Routing:** Always secure new frontend routes using `<RoleBasedRoute allowedRoles={[...]}>` in `App.js`.
3. **Database:** Do not mutate table schemas directly. If adding a new feature, coordinate with the DB administrator to update the `smtbms` schema.
4. **Commits:** Write clear, concise commit messages. 

---

## 8. Changelog

- **1.0 - Initial documentation baseline** 
  - Comprehensive dashboard, CRM, ERP, and HRMS functional components.
  - Role-based UI rendering dynamically adjusting layouts for Admins vs. Employees.
  - Configured Aiven remote MySQL connection capabilities in `config/db.js`.

---

## 9. FAQ & Troubleshooting

- **Q: Why am I getting a CORS error on the frontend?**
  - **A:** Ensure the backend is running and listening on the port defined by `REACT_APP_API_URL` (default `5001`). Check `backend/server.js` CORS configuration.
- **Q: My role is 'Admin' but I can't see the Admin routes.**
  - **A:** Ensure role capitalization is accurate. Roles are normalized to UPPERCASE in the JWT token and local storage (`ADMIN`, `HR`, `MANAGER`, `SALES`, `EMPLOYEE`). Use `.toUpperCase()` when performing manual checks.
- **Q: The database connection fails on startup.**
  - **A:** Verify your `.env` variables match your MySQL server credentials and ensure the MySQL service is running. If connecting to Aiven, ensure the `ca.pem` SSL certificate is in the backend directory.

---

## 10. Assumptions & Notes

- **Database Initialization:** This repository does not contain database seeding or migration scripts. It is assumed the `smtbms` schema is pre-populated and managed externally.
- **Authentication Bypass:** Some utility endpoints might lack strict `restrictTo` middleware checks depending on recent development cycles. Always audit new routes for proper `protect` usage.
- **Timezones:** The backend explicitly sets the session timezone to IST (`+05:30`) upon connecting to MySQL to ensure consistency across dates.
