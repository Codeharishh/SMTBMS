const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), notificationController.getNotifications);
router.post('/', protect, authorize('Admin', 'HR', 'Manager'), notificationController.createNotification);
router.put('/:id/read', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), notificationController.markRead);

module.exports = router;
