const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Allows Admins, HR, Managers, and Sales to view employee roster
router.get('/', protect, authorize('Admin', 'HR', 'Manager', 'Sales'), employeeController.getAllEmployees);

// RECTIFIED: Permits Admin, HR, Manager, Employee, and Sales to get their own profile card
router.get('/me', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), employeeController.getMyProfile);

// RECTIFIED: Added 'HR' to prevent the 403 Forbidden error when logged in as HR
// NOTE: Kept before /:id so Express doesn't treat "tasks" as an alternate parameter ID
router.get('/tasks', protect, authorize('Employee', 'Manager', 'Admin', 'Sales', 'HR'), employeeController.getMyTasks);

// RECTIFIED: Allows all core system roles to view a specific employee profile by ID
router.get('/:id', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), employeeController.getEmployeeById);

// Administrative operations
router.post('/', protect, authorize('Admin', 'HR', 'Manager'), employeeController.createEmployee);
router.put('/:id', protect, authorize('Admin', 'HR', 'Manager'), employeeController.updateEmployee);
router.delete('/:id', protect, authorize('Admin', 'HR'), employeeController.deleteEmployee);

// Attendance system interaction endpoint
router.post('/:id/punch', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), employeeController.punchAttendance);

module.exports = router;