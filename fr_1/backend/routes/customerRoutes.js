const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin', 'Sales', 'Manager'), customerController.getAllCustomers);
router.get('/:id', protect, authorize('Admin', 'Sales', 'Manager'), customerController.getCustomerById);
router.post('/', protect, authorize('Admin', 'Sales', 'Manager'), customerController.createCustomer);
router.put('/:id', protect, authorize('Admin', 'Sales', 'Manager'), customerController.updateCustomer);
router.delete('/:id', protect, authorize('Admin', 'Sales'), customerController.deleteCustomer);

module.exports = router;
