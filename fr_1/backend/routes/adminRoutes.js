// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Secure all admin routes to Admin role only
router.use(protect, authorize('Admin'));

// User Management CRUD
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

// Integrations Configuration
router.get('/integrations', adminController.getIntegrations);
router.put('/integrations/:id', adminController.toggleIntegration);
router.post('/integrations/test', adminController.testIntegration);

// Backup & Restore Database
router.get('/backups', adminController.getBackups);
router.post('/backups', adminController.createBackup);
router.post('/backups/:id/restore', adminController.restoreBackup);

// Help & Support Tickets
router.get('/tickets', adminController.getTickets);
router.post('/tickets', adminController.createTicket);

module.exports = router;
