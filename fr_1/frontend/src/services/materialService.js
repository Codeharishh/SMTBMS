import api from './api';

export const fetchMaterials = async (params) => {
  const response = await api.get('/materials', { params });
  return response.data;
};

export const fetchLowStock = async (threshold) => {
  const response = await api.get('/materials/low-stock', { params: { threshold } });
  return response.data;
};

export const createMaterial = async (data) => {
  const response = await api.post('/materials', data);
  return response.data;
};

export const updateMaterial = async (id, data) => {
  const response = await api.put(`/materials/${id}`, data);
  return response.data;
};

export const deleteMaterial = async (id) => {
  const response = await api.delete(`/materials/${id}`);
  return response.data;
};
