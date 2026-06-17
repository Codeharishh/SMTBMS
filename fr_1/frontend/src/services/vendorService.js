import api from './api';

export const fetchVendors = async () => {

  const response = await api.get('/vendors');

  return response.data;

};

export const createVendor = async (data) => {

  const response = await api.post('/vendors', data);

  return response.data;

};