import api from './api';

// User Management CRUD
export const fetchUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

// Audit Logs
export const fetchAuditLogs = async () => {
  const response = await api.get('/admin/audit-logs');
  return response.data;
};

// Integrations
export const fetchIntegrations = async () => {
  const response = await api.get('/admin/integrations');
  return response.data;
};

export const toggleIntegrationStatus = async (id, active) => {
  const response = await api.put(`/admin/integrations/${id}`, { active });
  return response.data;
};

export const testIntegrationConnection = async (name) => {
  const response = await api.post('/admin/integrations/test', { name });
  return response.data;
};

// Backup & Restore
export const fetchBackups = async () => {
  const response = await api.get('/admin/backups');
  return response.data;
};

export const triggerBackupCreation = async () => {
  const response = await api.post('/admin/backups');
  return response.data;
};

export const restoreDatabaseFromBackup = async (id) => {
  const response = await api.post(`/admin/backups/${id}/restore`);
  return response.data;
};

// Help & Support Tickets
export const fetchTickets = async () => {
  const response = await api.get('/admin/tickets');
  return response.data;
};

export const createSupportTicket = async (ticketData) => {
  const response = await api.post('/admin/tickets', ticketData);
  return response.data;
};
