// src/services/salesService.js
import api from './api'; // 🟢 Uses your working native configuration instance directly!

export const fetchSales = async () => {
  const response = await api.get('/sales');
  return response.data;
};

export const fetchSalesSummary = async () => {
  const response = await api.get('/sales/summary');
  return response.data;
};

export const createSale = async (data) => {
  const response = await api.post('/sales', data);
  return response.data;
};

export const updateSale = async (id, data) => {
  const response = await api.put(`/sales/${id}`, data);
  return response.data;
};

export const deleteSale = async (id) => {
  const response = await api.delete(`/sales/${id}`);
  return response.data;
};

// 🟢 ADDED: Fetch vendors list safely utilizing your core authorized instance
export const fetchVendorsList = async () => {
  const response = await api.get('/vendors');
  return response.data;
};

// 🟢 ADDED: Route directly to your standard controller status verification endpoint
export const updateSalesOrderStatus = async (id, status) => {
  const response = await api.put(`/sales/${id}/status`, { status });
  return response.data;
};
// src/services/salesService.js

// 🟢 ADDED: Fetch quotations linked to active system leads
export const fetchQuotations = async () => {
  const response = await api.get('/sales/crm/quotations');
  return response.data;
};

// 🟢 ADDED: Commit a newly generated commercial quotation invoice
export const createQuotation = async (data) => {
  const response = await api.post('/sales/crm/quotations', data);
  return response.data;
};

// 🟢 ADDED: Compile the target monthly limits and won revenue split data
export const fetchSalesTelemetry = async () => {
  const response = await api.get('/sales/crm/telemetry');
  return response.data;
};