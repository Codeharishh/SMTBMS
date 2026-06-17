const express = require('express');
const router = express.Router();

const vendorController = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all vendors
router.get(
    '/',
    protect,
    authorize('Admin', 'Manager', 'HR', 'Sales'),
    vendorController.getAllVendors
);

// Get vendor by ID
router.get(
    '/:id',
    protect,
    authorize('Admin', 'Manager', 'HR', 'Sales'),
    vendorController.getVendorById
);

// Create vendor
router.post(
    '/',
    protect,
    authorize('Admin', 'Manager'),
    vendorController.createVendor
);

// Update vendor
router.put(
    '/:id',
    protect,
    authorize('Admin', 'Manager'),
    vendorController.updateVendor
);

// Delete vendor
router.delete(
    '/:id',
    protect,
    authorize('Admin', 'Manager'),
    vendorController.deleteVendor
);

module.exports = router;