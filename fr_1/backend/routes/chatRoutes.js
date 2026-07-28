// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/chat/history - Fetches per-role & per-user isolated chat history
router.get('/history', protect, chatController.getChatHistory);

// POST /api/chat/send (and POST /api/chat) - Grounded AI Assistant endpoint
router.post('/send', protect, chatController.handleChatMessage);
router.post('/', protect, chatController.handleChatMessage);

// DELETE /api/chat/history - Clears role-isolated chat history
router.delete('/history', protect, chatController.clearChatHistory);

module.exports = router;
