const express = require('express');

const router = express.Router();

const {
  applyLeave,
  getEmployeeLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, applyLeave);

router.get('/my', protect, getEmployeeLeaves);

router.get('/', protect, getAllLeaves);

router.put('/:id', protect, updateLeaveStatus);

module.exports = router;