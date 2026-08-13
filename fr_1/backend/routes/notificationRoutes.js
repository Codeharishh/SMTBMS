const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const noCache = require('../middleware/noCache');

// Applied to every GET route below — prevents the browser / any proxy in
// front of Render (e.g. Vercel's edge network if you rewrite /api/* through
// it) from serving a stale cached response. Without this, a GET can come
// back as "304 Not Modified" even when new rows were just inserted, which
// is exactly what showed up in the Network tab.
router.get('/preferences', protect, noCache, notificationController.getPreferences);
router.put('/preferences', protect, notificationController.updatePreferences);
router.put('/mark-all-read', protect, notificationController.markAllRead);

router.get('/', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), noCache, notificationController.getNotifications);
router.post('/', protect, authorize('Admin', 'HR', 'Manager'), notificationController.createNotification);
router.put('/:id/read', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), notificationController.markRead);

module.exports = router;