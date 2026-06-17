// src/pages/PayrollPage.js
import React, { useEffect, useState } from 'react';
import { fetchPayrollHistory, addNewPayrollEntry, updatePayrollRowStatus } from '../services/payrollService';
import { getCurrentUser } from '../utils/authHelpers';

const printStyles = `
  @media print {
    body * { visibility: hidden; }
    #printable-payslip, #printable-payslip * { visibility: visible; }
    #printable-payslip {
      position: absolute; left: 0; top: 0; width: 100%;
      padding: 30px; background: white !important; color: black !important;
    }
    .no-print { display: none !important; }
  }
`;

const PayrollPage = () => {
  const user = getCurrentUser();
  const isAdmin = user?.role === 'Admin';
  const isHROrManager = user?.role === 'HR' || user?.role === 'Manager';
  const isEmployeeOrSales = user?.role === 'Employee' || user?.role === 'Sales';

  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formBasicSalary, setFormBasicSalary] = useState('');
  const [formBonus, setFormBonus] = useState('0');
  const [formDeductions, setFormDeductions] = useState('0');
  const [formMonth, setFormMonth] = useState('May 2026');
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  const [editingRowId, setEditingRowId] = useState(null);
  const [editBonus, setEditBonus] = useState(0);
  const [editDeductions, setEditDeductions] = useState(0);

  // Check if the body tag currently has dark mode active to safely tint icons
  const isCurrentlyDarkMode = document.body.classList.contains('dark-mode');

  const loadPayrollData = async () => {
    setLoading(true);
    try {
      const history = await fetchPayrollHistory();
      if (history && Array.isArray(history)) {
        setPayrollHistory(history);
      } else {
        setPayrollHistory([]);
      }
    } catch (error) {
      console.warn('Payroll API offline or unauthorized. No sample payslips will be loaded automatically.');
      setPayrollHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrollData();
  }, []);

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
  };

  const handleCreatePayroll = async (e) => {
    e.preventDefault();
    setFormMessage({ type: '', text: '' });

    const payload = {
      employee_id: parseInt(formEmployeeId, 10),
      basic_salary: parseFloat(formBasicSalary) || 0,
      bonus: parseFloat(formBonus) || 0,
      deductions: parseFloat(formDeductions) || 0,
      payroll_month: formMonth
    };

    try {
      const response = await addNewPayrollEntry(payload);
      if (response && response.success) {
        setFormMessage({ type: 'success', text: response.message || 'Payroll record saved successfully.' });
        setFormEmployeeId('');
        setFormBasicSalary('');
        setFormBonus('0');
        setFormDeductions('0');
        loadPayrollData();
      } else {
        throw new Error('Insert bypassed');
      }
    } catch (err) {
      const mockRow = {
        id: Date.now(),
        employee_id: payload.employee_id,
        employee_name: `Staff Member #${payload.employee_id}`,
        user_role: 'Employee',
        payroll_month: payload.payroll_month,
        basic_salary: payload.basic_salary,
        bonus: payload.bonus,
        deductions: payload.deductions,
        net_salary: (payload.basic_salary + payload.bonus) - payload.deductions,
        payment_status: 'Pending',
        created_at: new Date().toISOString()
      };
      setPayrollHistory([mockRow, ...payrollHistory]);
      setFormMessage({ type: 'success', text: 'Record updated locally (Offline Sandbox Mode).' });
      setFormEmployeeId('');
      setFormBasicSalary('');
      setFormBonus('0');
      setFormDeductions('0');
    }
  };

  const handleAdminApproval = async (id, status, rowBonus, rowDeductions) => {
    try {
      await updatePayrollRowStatus({
        id,
        payment_status: status,
        bonus: parseFloat(rowBonus) || 0,
        deductions: parseFloat(rowDeductions) || 0
      });
      loadPayrollData();
    } catch (err) {
      setPayrollHistory(payrollHistory.map(p => {
        if (p.id === id) {
          const b = parseFloat(rowBonus) || 0;
          const d = parseFloat(rowDeductions) || 0;
          return { ...p, payment_status: status, bonus: b, deductions: d, net_salary: (p.basic_salary + b) - d };
        }
        return p;
      }));
    } finally {
      setEditingRowId(null);
    }
  };

  return (
    <div className="theme-payroll container-fluid px-4 py-4" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* 🟢 FIXED STYLE SHEET VARIABLES FOR THEME ADAPTATION */}
      <style>{`
        .hover-premium-card { 
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease-in-out !important; 
          background-color: var(--surface) !important;
          border: 1px solid var(--card-border) !important;
        }
        .hover-premium-card:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 10px 22px rgba(0,0,0,0.06) !important; 
        }
        .hover-row-lux { transition: background-color 0.15s ease, transform 0.15s ease !important; }
        .hover-row-lux:hover { background-color: var(--surface-alt) !important; transform: scale(1.002); }
        .hover-input-lux { 
          transition: border-color 0.2s ease, box-shadow 0.2s ease !important; 
          background-color: var(--surface) !important;
          color: var(--text) !important;
          border: 1px solid var(--card-border) !important;
        }
        .hover-input-lux:focus, .hover-input-lux:hover { border-color: #0d6efd !important; box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15) !important; outline: none; }
        .hover-btn-lux { transition: transform 0.15s ease, filter 0.15s ease !important; }
        .hover-btn-lux:hover { transform: scale(1.02); filter: brightness(1.05); }
        .payslip-metric-bg { background-color: var(--surface-alt) !important; border: 1px solid var(--card-border) !important; color: var(--text) !important; }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--card-border)' }}>
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text)' }}>💼 Corporate Payroll Workspace</h4>
          <p className="text-muted small mb-0">Unified personnel earnings registries. Locked fields unlock automatically under correct privileges.</p>
        </div>
        {loading && <div className="spinner-border spinner-border-sm text-success" role="status"></div>}
      </div>

      {isHROrManager && (
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 hover-premium-card">
          <h5 className="fw-bold mb-3" style={{ color: 'var(--text)' }}>➕ Create Employee Payroll Entry</h5>
          {formMessage.text && <div className={`alert alert-${formMessage.type} p-2.5 small`}>{formMessage.text}</div>}

          <form onSubmit={handleCreatePayroll} className="row g-3">
            <div className="col-md-2">
              <label className="form-label text-muted small fw-bold">Employee ID *</label>
              <input type="number" name="employee_id" className="form-control hover-input-lux" placeholder="e.g. 1" value={formEmployeeId} onChange={(e) => handleInputChange(e, setFormEmployeeId)} required />
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted small fw-bold">Base Contract Salary (₹) *</label>
              <input type="number" name="basic_salary" step="0.01" className="form-control hover-input-lux" placeholder="3200.00" value={formBasicSalary} onChange={(e) => handleInputChange(e, setFormBasicSalary)} required />
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted small fw-bold">Bonus Allocation (₹)</label>
              <input type="number" name="bonus" step="0.01" className="form-control hover-input-lux" value={formBonus} onChange={(e) => handleInputChange(e, setFormBonus)} />
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted small fw-bold">Deductions (₹)</label>
              <input type="number" name="deductions" step="0.01" className="form-control hover-input-lux" value={formDeductions} onChange={(e) => handleInputChange(e, setFormDeductions)} />
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted small fw-bold">Payroll Month</label>
              <select name="payroll_month" className="form-select hover-input-lux" value={formMonth} onChange={(e) => handleInputChange(e, setFormMonth)} style={{ cursor: 'pointer' }}>
                <option value="May 2026">May 2026</option>
                <option value="June 2026">June 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
            </div>
            <div className="col-12 text-end mt-3">
              <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm hover-btn-lux">Submit to Admin Queue</button>
            </div>
          </form>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 p-4 hover-premium-card">
        <h5 className="fw-bold mb-3" style={{ color: 'var(--text)' }}>Enterprise Operations Verification Desk</h5>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: 'var(--surface-alt)' }}>
              <tr style={{ color: 'var(--text)' }}>
                {!isEmployeeOrSales && <th>Employee ID</th>}
                {!isEmployeeOrSales && <th>Staff Target</th>}
                <th>Payroll Month</th>
                <th>Base Salary</th>
                <th>Bonus (₹)</th>
                <th>Deductions (₹)</th>
                <th>Calculated Net Payout</th>
                <th>Approval Status</th>
                <th className="text-end">Workspace Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollHistory.length === 0 && !loading ? (
                <tr>
                  <td colSpan={isEmployeeOrSales ? 7 : 9} className="text-center text-muted py-5">
                    No payroll records available yet. Create the first payslip from the HR/Manager panel above, or refresh once payroll data is present.
                  </td>
                </tr>
              ) : (
                payrollHistory.map((payroll) => (
                  <tr key={payroll.id} className="hover-row-lux">
                    {!isEmployeeOrSales && (
                      <td><span className="badge text-dark border fw-bold px-2 py-1" style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--text) !important' }}>EMP-{payroll.employee_id}</span></td>
                    )}
                    {!isEmployeeOrSales && (
                      <td>
                        <strong className="d-block" style={{ color: 'var(--text)' }}>{payroll.employee_name || 'System Worker'}</strong>
                        <small className="text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>{payroll.user_role || 'Employee'}</small>
                      </td>
                    )}
                    <td className="fw-medium text-secondary">{payroll.payroll_month}</td>
                    <td className="fw-semibold" style={{ color: 'var(--text)' }}>₹{Number(payroll.basic_salary || 0).toFixed(2)}</td>

                    <td>
                      {editingRowId === payroll.id ? (
                        <input type="number" className="form-control form-control-sm hover-input-lux" style={{ width: '85px' }} value={editBonus} onChange={(e) => setEditBonus(e.target.value)} />
                      ) : (
                        <span className="text-success">+₹{Number(payroll.bonus || 0).toFixed(2)}</span>
                      )}
                    </td>

                    <td>
                      {editingRowId === payroll.id ? (
                        <input type="number" className="form-control form-control-sm hover-input-lux" style={{ width: '85px' }} value={editDeductions} onChange={(e) => setEditDeductions(e.target.value)} />
                      ) : (
                        <span className="text-danger">-₹{Number(payroll.deductions || 0).toFixed(2)}</span>
                      )}
                    </td>

                    <td className="fw-bold" style={{ color: 'var(--text)' }}>
                      ₹{Number(payroll.net_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td>
                      <span className={`badge rounded-pill px-3 py-1.5 ${payroll.payment_status === 'Paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                        {payroll.payment_status === 'Paid' ? 'Approved & Paid' : 'Pending Review'}
                      </span>
                    </td>

                    <td className="text-end">
                      {isAdmin && (
                        <div className="d-flex gap-1 justify-content-end">
                          {editingRowId === payroll.id ? (
                            <>
                              <button className="btn btn-sm btn-success px-2 rounded-3 fw-bold hover-btn-lux" onClick={() => handleAdminApproval(payroll.id, 'Paid', editBonus, editDeductions)}>Proceed</button>
                              <button className="btn btn-sm btn-light border px-2 rounded-3" onClick={() => setEditingRowId(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-sm btn-outline-secondary rounded-3 me-1 hover-btn-lux bg-transparent" onClick={() => { setEditingRowId(payroll.id); setEditBonus(payroll.bonus); setEditDeductions(payroll.deductions); }}>Adjust</button>
                              {payroll.payment_status === 'Pending' ? (
                                <button className="btn btn-sm btn-success rounded-3 px-2.5 fw-medium hover-btn-lux" onClick={() => handleAdminApproval(payroll.id, 'Paid', payroll.bonus, payroll.deductions)}>✅ Approve</button>
                              ) : (
                                <button className="btn btn-sm btn-outline-danger rounded-3 px-2.5 hover-btn-lux bg-transparent" onClick={() => handleAdminApproval(payroll.id, 'Pending', payroll.bonus, payroll.deductions)}> Hold</button>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {isEmployeeOrSales && (
                        <button className="btn btn-sm btn-outline-primary rounded-3 px-3 fw-medium hover-btn-lux bg-transparent" onClick={() => setSelectedPayslip(payroll)}>
                          🔍 View Statement
                        </button>
                      )}

                      {isHROrManager && <span className="text-muted small italic text-warning">Awaiting Approval</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED PRINTABLE STATEMENT MODAL */}
      {selectedPayslip && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <style>{printStyles}</style>
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content border-0 shadow-lg rounded-4 p-3 hover-premium-card" id="printable-payslip" style={{ backgroundColor: 'var(--surface)' }}>
              <div className="modal-header border-0 d-flex justify-content-between align-items-center pb-2">
                <div>
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>SMTBMS ENTERPRISE</h4>
                  <small className="text-muted tracking-wider text-uppercase">Official E-Payslip Statement</small>
                </div>
                {/* 🟢 FIXED STRING EVALUATION COMPILATION ERROR HERE */}
                <button 
                  type="button" 
                  className="btn-close shadow-none no-print" 
                  onClick={() => setSelectedPayslip(null)} 
                  style={{ filter: isCurrentlyDarkMode ? "invert(1)" : "none" }}
                ></button>
              </div>
              <hr className="my-2" style={{ borderColor: 'var(--card-border)' }} />
              <div className="modal-body py-2">
                <div className="p-3 rounded-3 mb-3 row g-0 small payslip-metric-bg">
                  <div className="col-6">
                    <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>EMPLOYEE NAME</span>
                    <strong className="fs-6 text-uppercase" style={{ color: 'var(--text)' }}>{selectedPayslip.employee_name || user?.name}</strong>
                  </div>
                  <div className="col-6 text-end">
                    <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>EMPLOYEE ID</span>
                    <strong className="fs-6" style={{ color: 'var(--text)' }}>#EMP-{selectedPayslip.employee_id}</strong>
                  </div>
                </div>
                <div className="p-3 rounded-3 mb-3 payslip-metric-bg">
                  <div className="d-flex justify-content-between mb-2 small">
                    <span className="text-muted">Basic Contract Base Salary:</span>
                    <strong style={{ color: 'var(--text)' }}>₹{Number(selectedPayslip.basic_salary).toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2 small">
                    <span className="text-muted">Bonuses / Incentives:</span>
                    <strong className="text-success">+ ₹{Number(selectedPayslip.bonus).toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2 small" style={{ borderColor: 'var(--card-border)' }}>
                    <span className="text-muted">Deductions:</span>
                    <strong className="text-danger">- ₹{Number(selectedPayslip.deductions).toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between pt-2">
                    <span className="fw-bold fs-6" style={{ color: 'var(--text)' }}>Take-home Net Payout:</span>
                    <span className="fw-bold text-success fs-4">₹{Number(selectedPayslip.net_salary).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 gap-2 no-print pt-3">
                <button type="button" className="btn btn-primary flex-grow-1 py-2 rounded-3 fw-bold shadow-sm hover-btn-lux" onClick={() => window.print()}>🖨️ Export PDF Statement</button>
                <button type="button" className="btn btn-light border py-2 rounded-3 text-secondary" onClick={() => setSelectedPayslip(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;