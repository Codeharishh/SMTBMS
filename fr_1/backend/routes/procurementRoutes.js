const express = require('express');
const router = express.Router();
const procurementController = require('../controllers/procurementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin', 'Manager', 'HR'), procurementController.getAllProcurements);
router.get('/:id', protect, authorize('Admin', 'Manager', 'HR'), procurementController.getProcurementById);
router.post('/', protect, authorize('Admin', 'Manager'), procurementController.createProcurement);
router.put('/:id', protect, authorize('Admin', 'Manager'), procurementController.updateProcurement);
router.delete('/:id', protect, authorize('Admin', 'Manager'), procurementController.deleteProcurement);

module.exports = router;
