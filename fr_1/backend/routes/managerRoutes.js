const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Team routes
router.get('/team', protect, authorize('Admin', 'Manager'), managerController.getTeam);

// Tasks routes
router.get('/tasks', protect, authorize('Admin', 'Manager'), managerController.getTasks);
router.post('/tasks', protect, authorize('Admin', 'Manager'), managerController.createTask);
router.put('/tasks/:id/status', protect, authorize('Admin', 'Manager'), managerController.updateTaskStatus);
router.delete('/tasks/:id', protect, authorize('Admin', 'Manager'), managerController.deleteTask);

// Projects routes
router.get('/projects', protect, authorize('Admin', 'Manager'), managerController.getProjects);
router.post('/projects', protect, authorize('Admin', 'Manager'), managerController.createProject);
router.put('/projects/:id', protect, authorize('Admin', 'Manager'), managerController.updateProject);
router.delete('/projects/:id', protect, authorize('Admin', 'Manager'), managerController.deleteProject);

// Approvals routes
router.get('/approvals', protect, authorize('Admin', 'Manager'), managerController.getPendingApprovals);

module.exports = router;
