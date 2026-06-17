const express = require('express');

const router = express.Router();

const {
  getAllMovements,
  createMovement
} = require('../controllers/materialMovementController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllMovements);

router.post('/', protect, createMovement);

module.exports = router;