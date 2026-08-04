import api from './api';

// 1. Performance Reviews
export const fetchPerformanceReviews = async () => {
  const response = await api.get('/hr/performance');
  return response.data;
};

export const createPerformanceReview = async (data) => {
  const response = await api.post('/hr/performance', data);
  return response.data;
};

// 2. Recruitment Candidates
export const fetchCandidates = async () => {
  const response = await api.get('/hr/recruitment');
  return response.data;
};

export const createCandidate = async (data) => {
  const response = await api.post('/hr/recruitment', data);
  return response.data;
};

export const updateCandidateStatus = async (id, status) => {
  const response = await api.put(`/hr/recruitment/${id}/status`, { status });
  return response.data;
};

// 3. Trainings
export const fetchTrainings = async () => {
  const response = await api.get('/hr/training');
  return response.data;
};

export const createTraining = async (data) => {
  const response = await api.post('/hr/training', data);
  return response.data;
};

export const updateTrainingStatus = async (id, status) => {
  const response = await api.put(`/hr/training/${id}/status`, { status });
  return response.data;
};

// 4. Holiday Calendar
export const fetchHolidays = async () => {
  const response = await api.get('/hr/holiday');
  return response.data;
};

export const createHoliday = async (data) => {
  const response = await api.post('/hr/holiday', data);
  return response.data;
};

export const updateHoliday = async (id, data) => {
  const response = await api.put(`/hr/holiday/${id}`, data);
  return response.data;
};

export const deleteHoliday = async (id) => {
  const response = await api.delete(`/hr/holiday/${id}`);
  return response.data;
};

// 5. HR Documents
export const fetchDocuments = async () => {
  const response = await api.get('/hr/document');
  return response.data;
};

export const createDocument = async (data) => {
  const response = await api.post('/hr/document', data);
  return response.data;
};

export const recordDocumentDownload = async (id) => {
  const response = await api.post(`/hr/document/${id}/download`);
  return response.data;
};
