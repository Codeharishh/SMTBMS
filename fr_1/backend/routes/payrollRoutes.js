const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/summary', protect, authorize('Admin', 'HR', 'Manager'), payrollController.getPayrollSummary);
router.post('/generate', protect, authorize('Admin', 'HR', 'Manager'), payrollController.generatePayslip);

module.exports = router;
