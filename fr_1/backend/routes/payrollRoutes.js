// backend/routes/payrollRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createPayrollEntry, getPayrollRecords, updatePayrollStatus } = require('../controllers/payrollController');

// 🔴 CRITICAL MATCH FIX: These paths combine with the server.js mount point to form the full URL

// This handles: GET http://localhost:5001/api/payroll/records
router.get('/records', protect, getPayrollRecords);

// This handles: POST http://localhost:5001/api/payroll/create
router.post('/create', protect, authorize('Admin', 'HR', 'Manager'), createPayrollEntry);

// This handles: PUT http://localhost:5001/api/payroll/update
router.put('/update', protect, authorize('Admin', 'HR'), updatePayrollStatus);

module.exports = router;