import api from './api';

export const applyLeave = async (data) => {
  const response = await api.post('/leaves', data);

  return response.data;
};

export const fetchMyLeaves = async () => {
  const response = await api.get('/leaves/my');

  return response.data;
};

export const fetchAllLeaves = async () => {
  const response = await api.get('/leaves');

  return response.data;
};

export const updateLeaveStatus = async (id, status) => {
  const response = await api.put(`/leaves/${id}`, {
    status,
  });

  return response.data;
};