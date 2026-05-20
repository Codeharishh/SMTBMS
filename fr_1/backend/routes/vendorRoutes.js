const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin', 'Manager', 'HR'), vendorController.getAllVendors);
router.get('/:id', protect, authorize('Admin', 'Manager', 'HR'), vendorController.getVendorById);
router.post('/', protect, authorize('Admin', 'Manager'), vendorController.createVendor);
router.put('/:id', protect, authorize('Admin', 'Manager'), vendorController.updateVendor);
router.delete('/:id', protect, authorize('Admin', 'Manager'), vendorController.deleteVendor);

module.exports = router;
