const express = require('express');

const router = express.Router();

const {
  getAllMovements,
  createMovement,
  updateMovement,
  deleteMovement
} = require('../controllers/materialMovementController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllMovements);
router.post('/', protect, createMovement);
router.put('/:id', protect, updateMovement);
router.delete('/:id', protect, deleteMovement);

module.exports = router;