const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/today', protect, authorize('Admin', 'HR', 'Manager', 'Employee'), attendanceController.getTodayAttendance);
router.get('/history', protect, authorize('Admin', 'HR', 'Manager', 'Employee'), attendanceController.getAttendanceHistory);
router.post('/punch-in', protect, authorize('Admin', 'HR', 'Manager', 'Employee'), attendanceController.punchIn);
router.post('/punch-out', protect, authorize('Admin', 'HR', 'Manager', 'Employee'), attendanceController.punchOut);

module.exports = router;
