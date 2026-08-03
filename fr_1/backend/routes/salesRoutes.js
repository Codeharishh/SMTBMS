// backend/routes/salesRoutes.js
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Your Original Core Sales Routes
router.get('/', protect, authorize('Admin', 'Manager', 'Sales', 'Finance'), salesController.getAllSales);
router.get('/summary', protect, authorize('Admin', 'Manager', 'Sales', 'Finance'), salesController.getSalesSummary);
router.get('/:id', protect, authorize('Admin', 'Manager', 'Sales', 'Finance'), salesController.getSaleById);
router.post('/', protect, authorize('Admin', 'Manager', 'Sales', 'Finance'), salesController.createSale);
router.put('/:id', protect, authorize('Admin', 'Manager', 'Sales', 'Finance'), salesController.updateSale);
router.put('/:id/status', protect, authorize('Admin', 'Manager', 'Sales', 'Finance'), salesController.updateSaleStatus);
router.delete('/:id', protect, authorize('Admin', 'Manager', 'Sales', 'Finance'), salesController.deleteSale);

// 🟢 NEW CRM EXTENSION OPERATIONS (Appended for CRMPage View)
router.get('/crm/quotations', protect, authorize('Admin', 'Manager', 'Sales'), salesController.getQuotations);
router.post('/crm/quotations', protect, authorize('Admin', 'Sales'), salesController.createQuotation);
router.get('/crm/telemetry', protect, authorize('Admin', 'Manager', 'Sales'), salesController.getSalesTelemetry);

module.exports = router;