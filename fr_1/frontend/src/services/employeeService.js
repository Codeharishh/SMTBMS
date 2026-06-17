import api from './api';

export const fetchEmployees = async () => {
  const response = await api.get('/employees');
  return response.data;
};

export const fetchEmployeeProfile = async () => {
  const response = await api.get('/employees/me');
  return response.data;
};

export const createEmployee = async (data) => {
  const response = await api.post('/employees', data);
  return response.data;
};

export const updateEmployee = async (id, data) => {
  const response = await api.put(`/employees/${id}`, data);
  return response.data;
};

export const punchAttendance = async (id, data) => {
  const response = await api.post(`/employees/${id}/punch`, data);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

// Fetch all tasks assigned to the logged-in employee
export const fetchMyTasks = async () => {
  const response = await api.get('/employees/tasks');
  return response.data;
};

// Employee updates their own task status: Todo → In Progress → Completed
export const updateMyTaskStatus = async (taskId, status) => {
  const response = await api.put(`/employees/tasks/${taskId}/status`, { status });
  return response.data;
};