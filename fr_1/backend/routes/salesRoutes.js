// backend/routes/salesRoutes.js
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Your Original Core Sales Routes
router.get('/', protect, authorize('Admin', 'Manager', 'Sales'), salesController.getAllSales);
router.get('/summary', protect, authorize('Admin', 'Manager', 'Sales'), salesController.getSalesSummary);
router.get('/:id', protect, authorize('Admin', 'Manager', 'Sales'), salesController.getSaleById);
router.post('/', protect, authorize('Admin', 'Sales'), salesController.createSale);
router.put('/:id', protect, authorize('Admin', 'Sales'), salesController.updateSale);
router.delete('/:id', protect, authorize('Admin', 'Sales'), salesController.deleteSale);

// 🟢 NEW CRM EXTENSION OPERATIONS (Appended for CRMPage View)
router.get('/crm/quotations', protect, authorize('Admin', 'Manager', 'Sales'), salesController.getQuotations);
router.post('/crm/quotations', protect, authorize('Admin', 'Sales'), salesController.createQuotation);
router.get('/crm/telemetry', protect, authorize('Admin', 'Manager', 'Sales'), salesController.getSalesTelemetry);

module.exports = router;