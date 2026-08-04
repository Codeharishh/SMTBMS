const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Performance Reviews routes
router.get(
  '/performance',
  protect,
  authorize('Admin', 'HR', 'Manager', 'Employee'),
  hrController.getPerformanceReviews
);
router.post(
  '/performance',
  protect,
  authorize('Admin', 'HR', 'Manager'),
  hrController.createPerformanceReview
);

// Recruitment Candidates routes
router.get(
  '/recruitment',
  protect,
  authorize('Admin', 'HR', 'Manager'),
  hrController.getCandidates
);
router.post(
  '/recruitment',
  protect,
  authorize('Admin', 'HR', 'Manager'),
  hrController.createCandidate
);
router.put(
  '/recruitment/:id/status',
  protect,
  authorize('Admin', 'HR', 'Manager'),
  hrController.updateCandidateStatus
);

// Trainings routes
router.get(
  '/training',
  protect,
  authorize('Admin', 'HR', 'Manager', 'Employee'),
  hrController.getTrainings
);
router.post(
  '/training',
  protect,
  authorize('Admin', 'HR', 'Manager'),
  hrController.createTraining
);
router.put(
  '/training/:id/status',
  protect,
  authorize('Admin', 'HR', 'Manager'),
  hrController.updateTrainingStatus
);

// Holiday Calendar routes
router.get(
  '/holiday',
  protect,
  authorize('Admin', 'HR', 'Manager', 'Employee'),
  hrController.getHolidays
);
router.post(
  '/holiday',
  protect,
  authorize('Admin', 'HR', 'Manager'),
  hrController.createHoliday
);

router.put(
  '/holiday/:id',
  protect,
  authorize('Admin', 'HR'),
  hrController.updateHoliday
);

router.delete(
  '/holiday/:id',
  protect,
  authorize('Admin', 'HR'),
  hrController.deleteHoliday
);

// Documents routes
router.get(
  '/document',
  protect,
  authorize('Admin', 'HR', 'Manager', 'Employee'),
  hrController.getDocuments
);
router.post(
  '/document',
  protect,
  authorize('Admin', 'HR', 'Manager'),
  hrController.createDocument
);

module.exports = router;
