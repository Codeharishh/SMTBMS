const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin', 'HR', 'Manager'), employeeController.getAllEmployees);
router.get('/me', protect, authorize('Admin', 'HR', 'Manager', 'Employee'), employeeController.getMyProfile);

// NEW — must be before /:id so Express doesn't treat "tasks" as an id param
router.get('/tasks', protect, authorize('Employee', 'Manager', 'Admin'), employeeController.getMyTasks);

router.get('/:id', protect, authorize('Admin', 'HR', 'Manager', 'Employee'), employeeController.getEmployeeById);
router.post('/', protect, authorize('Admin', 'HR', 'Manager'), employeeController.createEmployee);
router.put('/:id', protect, authorize('Admin', 'HR', 'Manager'), employeeController.updateEmployee);
router.delete('/:id', protect, authorize('Admin', 'HR'), employeeController.deleteEmployee);
router.post('/:id/punch', protect, authorize('Admin', 'HR', 'Manager', 'Employee'), employeeController.punchAttendance);

module.exports = router;