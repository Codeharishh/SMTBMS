// src/services/payrollService.js
import api from './api';

// 🟢 FIXES THE ERROR: Maps the dashboard's expected function to your core records endpoint
export const fetchPayrollSummary = async () => {
  const response = await api.get('/payroll/records');
  
  // Calculate basic summary aggregates on the fly for the dashboard tiles
  const records = response.data.data || [];
  const totalPayroll = records.reduce((sum, row) => sum + Number(row.net_salary || 0), 0);
  const pendingCount = records.filter(row => row.payment_status === 'Pending').length;

  return {
    success: true,
    total_payroll: totalPayroll,
    pending_approvals: pendingCount,
    data: records
  };
};

// Fetches the dynamic list based on the logged-in user's role criteria
export const fetchPayrollHistory = async () => {
  const response = await api.get('/payroll/records');
  return response.data.data;
};

// HR / Manager allocation submission hook
export const addNewPayrollEntry = async (payrollData) => {
  const response = await api.post('/payroll/create', payrollData);
  return response.data;
};

// Admin workflow approval (Proceed / Decline state updates)
export const updatePayrollRowStatus = async (updateData) => {
  const response = await api.put('/payroll/update', updateData);
  return response.data;
};