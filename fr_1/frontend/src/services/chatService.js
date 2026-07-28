// src/services/chatService.js
import api from './api';

/**
 * Fetches server-stored chat history for the authenticated user and role.
 * GET /api/chat/history
 */
export const fetchChatHistory = async () => {
  const response = await api.get('/chat/history');
  return response.data;
};

/**
 * Sends chat message to backend AI assistant endpoint (stored server-side per role & user).
 * POST /api/chat/send
 * @param {string} message - User query text
 * @returns {Promise<Object>} Object containing AI response
 */
export const sendChatMessage = async (message) => {
  const response = await api.post('/chat/send', { message });
  return response.data;
};

/**
 * Clears server-stored chat history for the current role/user.
 * DELETE /api/chat/history
 */
export const clearChatHistory = async () => {
  const response = await api.delete('/chat/history');
  return response.data;
};
