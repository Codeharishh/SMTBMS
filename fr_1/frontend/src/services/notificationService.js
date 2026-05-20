import api from './api';

export const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const createNotification = async (data) => {
  const response = await api.post('/notifications', data);
  return response.data;
};
