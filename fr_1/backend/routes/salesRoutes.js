const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin', 'Manager', 'Sales'), salesController.getAllSales);
router.get('/summary', protect, authorize('Admin', 'Manager', 'Sales'), salesController.getSalesSummary);
router.get('/:id', protect, authorize('Admin', 'Manager', 'Sales'), salesController.getSaleById);
router.post('/', protect, authorize('Admin', 'Sales'), salesController.createSale);
router.put('/:id', protect, authorize('Admin', 'Sales'), salesController.updateSale);
router.delete('/:id', protect, authorize('Admin', 'Sales'), salesController.deleteSale);

module.exports = router;
