// backend/routes/leadRoutes.js
const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

// protect on all routes — GET works because token is sent,
// but adding it explicitly ensures consistent auth across all operations
router.get('/', protect, leadController.getAllLeads);
router.post('/', protect, leadController.createLead);
router.put('/:id', protect, leadController.updateLead);
router.delete('/:id', protect, leadController.deleteLead);

module.exports = router;