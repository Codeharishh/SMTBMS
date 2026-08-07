// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { register, login, googleLogin, getMe, updateMe } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);   // ← NEW: Google OAuth sign-in
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;