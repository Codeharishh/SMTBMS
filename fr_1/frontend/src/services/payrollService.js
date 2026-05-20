import api from './api';

export const fetchPayrollSummary = async () => {
  const response = await api.get('/payroll/summary');
  return response.data;
};

export const generatePayslip = async (data) => {
  const response = await api.post('/payroll/generate', data);
  return response.data;
};
