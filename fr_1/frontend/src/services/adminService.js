import api from './api';

// ── 1. USER MANAGEMENT CRUD ──────────────────────────────────────────────────
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

// ── 2. AUDIT LOGS ─────────────────────────────────────────────────────────────
export const fetchAuditLogs = async () => {
  const response = await api.get('/admin/audit-logs');
  return response.data;
};

// ── 3. INTEGRATIONS ───────────────────────────────────────────────────────────
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

// ── 4. BACKUP & RESTORE ───────────────────────────────────────────────────────
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

// Downloads the raw database .zip stream directly
export const downloadBackupZip = async (id, fileName) => {
  const response = await api.get(`/admin/backups/${id}/download`, {
    responseType: 'blob'
  });

  const blob = new Blob([response.data], { type: 'application/zip' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName || `backup_${id}.zip`);

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};

// ── 5. HELP & SUPPORT TICKETS ─────────────────────────────────────────────────
export const fetchTickets = async () => {
  const response = await api.get('/admin/tickets');
  return response.data;
};

export const createSupportTicket = async (ticketData) => {
  const response = await api.post('/admin/tickets', ticketData);
  return response.data;
};