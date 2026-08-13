const express = require('express');
const router = express.Router();
const { getStats, generateReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getStats);
router.post('/generate', protect, generateReport);

module.exports = router;
