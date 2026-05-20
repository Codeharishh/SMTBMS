import api from './api';

export const fetchReportSummary = async () => {
  const response = await api.get('/reports/summary');
  return response.data;
};
