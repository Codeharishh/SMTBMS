import api from './api';

// 1. Team Monitoring
export const fetchTeam = async () => {
  const response = await api.get('/manager/team');
  return response.data;
};

// 2. Task Assignment
export const fetchTasks = async () => {
  const response = await api.get('/manager/tasks');
  return response.data;
};

export const createTask = async (data) => {
  const response = await api.post('/manager/tasks', data);
  return response.data;
};

export const updateTaskStatus = async (id, status) => {
  const response = await api.put(`/manager/tasks/${id}/status`, { status });
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/manager/tasks/${id}`);
  return response.data;
};

// 3. Project Tracking
export const fetchProjects = async () => {
  const response = await api.get('/manager/projects');
  return response.data;
};

export const createProject = async (data) => {
  const response = await api.post('/manager/projects', data);
  return response.data;
};

export const updateProject = async (id, data) => {
  const response = await api.put(`/manager/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/manager/projects/${id}`);
  return response.data;
};

// 4. Approvals Hub
export const fetchPendingApprovals = async () => {
  const response = await api.get('/manager/approvals');
  return response.data;
};
