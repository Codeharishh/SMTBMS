const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// RECTIFIED: Added 'Sales' across all core attendance actions
router.get('/today', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), attendanceController.getTodayAttendance);
router.get('/history', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), attendanceController.getAttendanceHistory);
router.post('/punch-in', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), attendanceController.punchIn);
router.post('/punch-out', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), attendanceController.punchOut);

module.exports = router;