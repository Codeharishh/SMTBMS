// src/services/vendorService.js
import api from './api';

export const fetchVendors = async () => {
  const response = await api.get('/vendors');
  return response.data;
};

export const createVendor = async (data) => {
  const response = await api.post('/vendors', data);
  return response.data;
};

export const updateVendor = async (id, data) => {
  const response = await api.put(`/vendors/${id}`, data);
  return response.data;
};

export const deleteVendor = async (id) => {
  const response = await api.delete(`/vendors/${id}`);
  return response.data;
};