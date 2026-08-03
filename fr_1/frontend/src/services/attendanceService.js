import api from './api';

export const fetchTodayAttendance = async () => {
  const response = await api.get('/attendance/today');
  return response.data;
};

export const fetchAttendanceHistory = async (params = {}) => {
  const response = await api.get('/attendance/history', { params });
  return response.data;
};

export const punchIn = async () => {
  const response = await api.post('/attendance/punch-in');
  return response.data;
};

export const punchOut = async () => {
  const response = await api.post('/attendance/punch-out');
  return response.data;
};
