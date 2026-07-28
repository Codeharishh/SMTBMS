const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ── 1. USER MANAGEMENT CRUD (ADMIN & HR COOPERATIVE) ─────────────────────────
router.get('/users', protect, authorize('Admin', 'HR'), adminController.getUsers);
router.post('/users', protect, authorize('Admin', 'HR'), adminController.createUser);
router.put('/users/:id', protect, authorize('Admin', 'HR'), adminController.updateUser);
router.delete('/users/:id', protect, authorize('Admin'), adminController.deleteUser); // Deletion strictly Admin only

// ── 2. AUDIT LOGS (ADMIN & HR ONLY) ──────────────────────────────────────────
router.get('/audit-logs', protect, authorize('Admin', 'HR'), adminController.getAuditLogs);

// ── 3. INTEGRATIONS CONFIGURATION (STRICTLY ADMIN) ───────────────────────────
router.get('/integrations', protect, authorize('Admin'), adminController.getIntegrations);
router.put('/integrations/:id', protect, authorize('Admin'), adminController.toggleIntegration);
router.post('/integrations/test', protect, authorize('Admin'), adminController.testIntegration);

// ── 4. BACKUP & RESTORE DATABASE (STRICTLY ADMIN) ────────────────────────────
router.get('/backups', protect, authorize('Admin'), adminController.getBackups);
router.post('/backups', protect, authorize('Admin'), adminController.createBackup);
router.post('/backups/:id/restore', protect, authorize('Admin'), adminController.restoreBackup);

// ── 5. HELP & SUPPORT TICKETS (OPEN TO ALL AUTHENTICATED ROLES) ──────────────
router.get('/tickets', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), adminController.getTickets);
router.post('/tickets', protect, authorize('Admin', 'HR', 'Manager', 'Employee', 'Sales'), adminController.createTicket);

module.exports = router;