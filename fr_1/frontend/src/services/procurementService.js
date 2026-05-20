import api from './api';

export const fetchProcurements = async () => {
  const response = await api.get('/procurements');
  return response.data;
};

export const createProcurement = async (data) => {
  const response = await api.post('/procurements', data);
  return response.data;
};

export const updateProcurement = async (id, data) => {
  const response = await api.put(`/procurements/${id}`, data);
  return response.data;
};

export const deleteProcurement = async (id) => {
  const response = await api.delete(`/procurements/${id}`);
  return response.data;
};
