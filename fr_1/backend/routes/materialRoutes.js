const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin', 'Manager', 'Employee'), materialController.getAllMaterials);
router.get('/low-stock', protect, authorize('Admin', 'Manager', 'Employee'), materialController.lowStock);
router.get('/:id', protect, authorize('Admin', 'Manager', 'Employee'), materialController.getMaterialById);
router.post('/', protect, authorize('Admin', 'Manager', 'Employee'), materialController.createMaterial);
router.put('/:id', protect, authorize('Admin', 'Manager', 'Employee'), materialController.updateMaterial);
router.delete('/:id', protect, authorize('Admin', 'Manager'), materialController.deleteMaterial);

module.exports = router;
