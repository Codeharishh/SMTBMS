// src/pages/PayrollPage.js
import React, { useEffect, useState, useMemo } from 'react';
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

// ── SAME PALETTE AS MaterialsPage.js FOR VISUAL CONSISTENCY ────────────────
const COLORS = {
  indigo: '#5B8DEF',
  emerald: '#2ED9C3',
  amber: '#FFC542',
  rose: '#FF6B9D',
  sky: '#4FC3F7',
  violet: '#9B7EDE',
  slate: '#64748B',
  primary: '#FF7A45',
  alert: '#FF6B6B'
};

// ── CRISP-OPTIMIZED VECTOR SVG MATRIX FOR METRIC CARDS ────────────────────
const THIN_ICONS = {
  wallet: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="2" y="4" width="20" height="16" rx="2" />
      <path vectorEffect="non-scaling-stroke" d="M12 11h4v2h-4z" />
    </svg>
  ),
  arrowUpRight: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="7" y1="17" x2="17" y2="7" />
      <polyline vectorEffect="non-scaling-stroke" points="7 7 17 7 17 17" />
    </svg>
  ),
  arrowDownLeft: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="17" y1="7" x2="7" y2="17" />
      <polyline vectorEffect="non-scaling-stroke" points="17 17 7 17 7 7" />
    </svg>
  ),
  creditCard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
};

const PayrollPage = () => {
  const user = getCurrentUser();

  const userRole = (user?.role || '').toUpperCase();
  const isAdmin = userRole === 'ADMIN';
  const isHROrManager = userRole === 'HR' || userRole === 'MANAGER';
  const isEmployeeOrSales = userRole === 'EMPLOYEE' || userRole === 'SALES';

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

  // Compute live data summaries to supply custom KPI metrics metrics row
  const metrics = useMemo(() => {
    let baseSum = 0;
    let bonusSum = 0;
    let dedSum = 0;
    let netSum = 0;

    payrollHistory.forEach((item) => {
      baseSum += Number(item.basic_salary || 0);
      bonusSum += Number(item.bonus || 0);
      dedSum += Number(item.deductions || 0);
      netSum += Number(item.net_salary || 0);
    });

    return { baseSum, bonusSum, dedSum, netSum };
  }, [payrollHistory]);

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

  // ── circular ring-icon metric card, matching Dashboard/Materials Page style ──
  const MetricCard = ({ label, value, sub, icon, color }) => (
    <div className="card border-0 h-100 metric-card-lux" style={{ borderRadius: '22px', background: '#ffffff' }}>
      <div className="p-3 d-flex align-items-start gap-2">
        <div className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: '#ffffff', color: color, fontSize: '1.1rem',
            border: `2px solid ${color}40`
          }}>
          {icon}
        </div>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <h3 className="mb-0 fw-bold" style={{ color: '#1e293b', fontSize: '1.25rem', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{value}</h3>
          <span className="d-block fw-semibold" style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.25 }}>{label}</span>
        </div>
      </div>
      {sub && (
        <div className="px-3 pb-3">
          <small className="fw-medium" style={{ fontSize: '0.66rem', color: '#94a3b8', display: 'block' }}>{sub}</small>
        </div>
      )}
    </div>
  );

  return (
    <div className="theme-payroll container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif'
    }}>

      <style>{`
        /* Premium Card Configurations */
        .hover-premium-card {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
          background-color: #ffffff !important;
          box-shadow: 0 8px 24px rgba(31,41,55,0.06) !important;
        }
        .hover-premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(31,41,55,0.09) !important;
        }
        .metric-card-lux {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
          box-shadow: 0 8px 22px rgba(31,41,55,0.05) !important;
        }
        .metric-card-lux:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 26px rgba(31,41,55,0.09) !important;
        }
        .hover-btn-lux {
          transition: all 0.2s ease !important;
        }
        .hover-btn-lux:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(255, 122, 69, 0.28) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 6px;
        }

        /* Clean Input Filtering Styles */
        .theme-payroll .filter-input-lux {
          background-color: #ffffff !important;
          border: 1px solid #e5e0f5 !important;
          border-radius: 8px !important;
          padding: 8px 14px !important;
          font-size: 0.9rem !important;
          font-weight: 500 !important;
          color: #475569 !important;
        }
        .theme-payroll .filter-input-lux:focus {
          outline: none !important;
          border-color: ${COLORS.indigo} !important;
          box-shadow: 0 0 0 3px ${COLORS.indigo}1A !important;
        }

        /* REGISTER DATA TABLE IMPLEMENTATION */
        .theme-payroll table {
          width: 100% !important;
          border-collapse: collapse !important;
          background-color: #ffffff !important;
        }

        /* Header Style Mapping */
        .theme-payroll th {
          background-color: #FAF8FF !important;
          color: #94a3b8 !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          font-size: 0.78rem !important;
          letter-spacing: 0.05em !important;
          padding: 14px 20px !important;
          border-bottom: 2px solid #f1f0f9 !important;
        }

        /* Row Layout Mapping */
        .theme-payroll td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          border-bottom: 1px solid #f4f2fb !important;
          color: #4a5568 !important;
          font-size: 0.92rem !important;
        }

        .theme-payroll tbody tr {
          transition: background-color 0.15s ease !important;
        }
        .theme-payroll tbody tr:hover {
          background-color: #FDFAFF !important;
        }

        /* Text Custom Boldings Mapping */
        .theme-payroll .user-name-cell {
          font-weight: 700 !important;
          color: #1a202c !important;
        }
        .theme-payroll .amount-cell {
          font-weight: 700 !important;
          color: #2d3748 !important;
        }

        /* Subtitle Details */
        .theme-payroll .user-subtitle {
          font-size: 0.78rem !important;
          color: #a0aec0 !important;
          margin-top: 2px;
          font-weight: 400 !important;
        }

        /* Functional Month Pill Badges */
        .theme-payroll .badge-month {
          background-color: ${COLORS.indigo}14 !important;
          color: ${COLORS.indigo} !important;
          border: 1px solid ${COLORS.indigo}33 !important;
          padding: 4px 14px !important;
          border-radius: 20px !important;
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          display: inline-block;
        }

        /* Payment Status Badges */
        .theme-payroll .status-paid {
          background-color: ${COLORS.emerald}14 !important;
          color: #0f9488 !important;
          border: 1px solid ${COLORS.emerald}44 !important;
          padding: 4px 12px !important;
          border-radius: 20px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          display: inline-block;
        }
        .theme-payroll .status-pending {
          background-color: ${COLORS.amber}18 !important;
          color: #b45309 !important;
          border: 1px solid ${COLORS.amber}44 !important;
          padding: 4px 12px !important;
          border-radius: 20px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          display: inline-block;
        }

        /* ── ACTION ICON BUTTONS ── */
        .btn-action-icon {
          width: 32px !important;
          height: 32px !important;
          border-radius: 10px !important;
          border: none !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
        }
        .edit-icon-btn {
          background-color: #EFF6FF !important;
          color: #3B82F6 !important;
        }
        .edit-icon-btn:hover {
          background-color: #3B82F6 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25) !important;
          transform: translateY(-1px);
        }
        .approve-icon-btn {
          background-color: #ECFDF5 !important;
          color: #10B981 !important;
        }
        .approve-icon-btn:hover {
          background-color: #10B981 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
          transform: translateY(-1px);
        }
        .hold-icon-btn {
          background-color: #FFF1F2 !important;
          color: #F43F5E !important;
        }
        .hold-icon-btn:hover {
          background-color: #F43F5E !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25) !important;
          transform: translateY(-1px);
        }
        .view-icon-btn {
          background-color: #F0F9FF !important;
          color: #0284C7 !important;
        }
        .view-icon-btn:hover {
          background-color: #0284C7 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25) !important;
          transform: translateY(-1px);
        }
      `}</style>

      {/* MATCHED MODERN NAVIGATION HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.creditCard}
          </div>
          <div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Corporate Payroll Workspace</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Unified personnel earnings registries — Locked entries automatically verify under administrative protocols.</p>
          </div>
        </div>
        {loading && (
          <div className="d-flex align-items-center gap-2">
            <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ color: COLORS.primary }}></div>
          </div>
        )}
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS DISPLAYS WITH CLEAN SVG MATRIX INTEGRATION */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Basic Salary Base', value: `₹${metrics.baseSum.toLocaleString()}`, sub: 'Contractual commitments', icon: THIN_ICONS.wallet, color: COLORS.indigo },
          { label: 'Incentives Allocated', value: `+₹${metrics.bonusSum.toLocaleString()}`, sub: 'Performance bonuses active', icon: THIN_ICONS.arrowUpRight, color: COLORS.emerald },
          { label: 'Total Deductions', value: `-₹${metrics.dedSum.toLocaleString()}`, sub: 'Withholdings & tax parameters', icon: THIN_ICONS.arrowDownLeft, color: COLORS.rose },
          { label: 'Net Payout Ledger', value: `₹${metrics.netSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Aggregate net disbursements', icon: THIN_ICONS.creditCard, color: COLORS.sky }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* PAYROLL ENTRY GENERATOR CREATION PROFILE CARD */}
      {isHROrManager && (
        <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card" style={{ borderRadius: '22px', borderLeft: `4px solid ${COLORS.primary}` }}>
          <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>✨ Register New Personnel Payroll entry</h5>
          {formMessage.text && <div className={`alert alert-${formMessage.type} p-2 small mb-3`}>{formMessage.text}</div>}

          <form onSubmit={handleCreatePayroll} className="row g-3 align-items-end">
            <div className="col-md-2">
              <label className="form-label text-muted small fw-bold mb-1">Employee ID *</label>
              <input type="number" name="employee_id" className="form-control filter-input-lux" placeholder="e.g. 1" value={formEmployeeId} onChange={(e) => handleInputChange(e, setFormEmployeeId)} required />
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted small fw-bold mb-1">Base Salary (₹) *</label>
              <input type="number" name="basic_salary" step="0.01" className="form-control filter-input-lux" placeholder="32000.00" value={formBasicSalary} onChange={(e) => handleInputChange(e, setFormBasicSalary)} required />
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted small fw-bold mb-1">Bonus (₹)</label>
              <input type="number" name="bonus" step="0.01" className="form-control filter-input-lux" value={formBonus} onChange={(e) => handleInputChange(e, setFormBonus)} />
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted small fw-bold mb-1">Deductions (₹)</label>
              <input type="number" name="deductions" step="0.01" className="form-control filter-input-lux" value={formDeductions} onChange={(e) => handleInputChange(e, setFormDeductions)} />
            </div>
            <div className="col-md-2">
              <label className="form-label text-muted small fw-bold mb-1">Payroll Month</label>
              <select name="payroll_month" className="form-select filter-input-lux" value={formMonth} onChange={(e) => handleInputChange(e, setFormMonth)} style={{ cursor: 'pointer' }}>
                <option value="May 2026">May 2026</option>
                <option value="June 2026">June 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn text-white w-100 py-2 rounded-3 fw-semibold hover-btn-lux border-0" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                Submit to Queue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OPERATIONS VERIFICATION DESK DATA REFERENCE TABLE */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 border-bottom bg-white">
          <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Enterprise Operations Verification Desk</h6>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                {!isEmployeeOrSales && <th className="px-4">Employee Profile</th>}
                <th>Disbursement Month</th>
                <th>Base Salary</th>
                <th className="text-center">Adjustments Matrix (Bonus / Ded)</th>
                <th>Net Calculated Payout</th>
                <th>Verification Status</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions Matrix</th>
              </tr>
            </thead>
            <tbody>
              {payrollHistory.length === 0 && !loading ? (
                <tr>
                  <td colSpan={isEmployeeOrSales ? 5 : 7} className="text-center text-muted py-5 fw-medium">
                    No active payroll structures verified on the platform.
                  </td>
                </tr>
              ) : (
                payrollHistory.map((payroll) => (
                  <tr key={payroll.id}>
                    {!isEmployeeOrSales && (
                      <td className="px-4">
                        <div className="d-flex flex-column">
                          <span className="user-name-cell">
                            {payroll.employee_name || 'System Worker'}
                            <span className="text-muted fw-normal ms-1">#{payroll.employee_id}</span>
                          </span>
                          <span className="user-subtitle text-uppercase">{payroll.user_role || 'Employee'}</span>
                        </div>
                      </td>
                    )}
                    <td>
                      <span className="badge-month">{payroll.payroll_month}</span>
                    </td>
                    <td className="amount-cell">₹{Number(payroll.basic_salary || 0).toLocaleString()}</td>

                    {/* CENTERED PROFILE ADJUSTMENTS ROW CONTROLS */}
                    <td className="text-center">
                      {editingRowId === payroll.id ? (
                        <div className="d-flex flex-column align-items-center gap-1">
                          <div className="d-flex align-items-center gap-1">
                            <span className="text-success fw-bold" style={{ width: '12px' }}>+</span>
                            <input type="number" className="form-control filter-input-lux px-2 py-0 text-center" style={{ width: '80px', height: '26px', fontSize: '0.78rem' }} value={editBonus} onChange={(e) => setEditBonus(e.target.value)} />
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <span className="text-danger fw-bold" style={{ width: '12px' }}>-</span>
                            <input type="number" className="form-control filter-input-lux px-2 py-0 text-center" style={{ width: '80px', height: '26px', fontSize: '0.78rem' }} value={editDeductions} onChange={(e) => setEditDeductions(e.target.value)} />
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex flex-column align-items-center" style={{ fontSize: '0.78rem' }}>
                          <span className="text-success fw-bold">+₹{Number(payroll.bonus || 0).toLocaleString()}</span>
                          <span className="text-danger fw-bold">-₹{Number(payroll.deductions || 0).toLocaleString()}</span>
                        </div>
                      )}
                    </td>

                    <td className="amount-cell" style={{ color: COLORS.indigo }}>
                      ₹{Number(payroll.net_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td>
                      <span className={payroll.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}>
                        {payroll.payment_status === 'Paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>

                    {/* CONFIGURING ROW ACTION CONTROLS */}
                    <td className="text-center">
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        {isAdmin && (
                          editingRowId === payroll.id ? (
                            <>
                              <button className="btn-action-icon approve-icon-btn" title="Save Adjustments" onClick={() => handleAdminApproval(payroll.id, 'Paid', editBonus, editDeductions)}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </button>
                              <button className="btn-action-icon hold-icon-btn" title="Cancel Edit" onClick={() => setEditingRowId(null)}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn-action-icon edit-icon-btn" title="Edit Payroll Entry" onClick={() => { setEditingRowId(payroll.id); setEditBonus(payroll.bonus); setEditDeductions(payroll.deductions); }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              {payroll.payment_status === 'Pending' ? (
                                <button className="btn-action-icon approve-icon-btn" title="Approve & Pay" onClick={() => handleAdminApproval(payroll.id, 'Paid', payroll.bonus, payroll.deductions)}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </button>
                              ) : (
                                <button className="btn-action-icon hold-icon-btn" title="Hold Payment" onClick={() => handleAdminApproval(payroll.id, 'Pending', payroll.bonus, payroll.deductions)}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="10" y1="15" x2="10" y2="9" />
                                    <line x1="14" y1="15" x2="14" y2="9" />
                                  </svg>
                                </button>
                              )}
                            </>
                          )
                        )}

                        <button className="btn-action-icon view-icon-btn" title="View E-Payslip" onClick={() => setSelectedPayslip(payroll)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </div>
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
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', zIndex: 1060 }}>
          <style>{printStyles}</style>
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content border-0 shadow-lg p-3" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }} id="printable-payslip">
              <div className="modal-header border-0 d-flex justify-content-between align-items-center pb-2">
                <div>
                  <h4 className="fw-bold mb-0" style={{ color: '#1e293b', letterSpacing: '-0.5px' }}>SMTBMS ENTERPRISE</h4>
                  <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.66rem', letterSpacing: '0.05em' }}>Official E-Payslip Statement</small>
                </div>
                <button type="button" className="btn-close shadow-none no-print" onClick={() => setSelectedPayslip(null)}></button>
              </div>
              <hr className="my-2" style={{ borderColor: '#f1f0f9' }} />
              <div className="modal-body py-2">
                <div className="p-3 rounded-4 mb-3 row g-0 small" style={{ backgroundColor: '#FAF8FF', border: '1px solid #f1f0f9' }}>
                  <div className="col-6">
                    <span className="text-muted d-block fw-bold" style={{ fontSize: '0.66rem' }}>EMPLOYEE NAME</span>
                    <strong className="fs-6 text-uppercase" style={{ color: '#1e293b' }}>{selectedPayslip.employee_name || user?.name}</strong>
                  </div>
                  <div className="col-6 text-end">
                    <span className="text-muted d-block fw-bold" style={{ fontSize: '0.66rem' }}>EMPLOYEE REFS</span>
                    <strong className="fs-6" style={{ color: '#1e293b' }}>#EMP-{selectedPayslip.employee_id}</strong>
                  </div>
                </div>
                <div className="p-3 rounded-4 mb-3" style={{ backgroundColor: '#FAF8FF', border: '1px solid #f1f0f9' }}>
                  <div className="d-flex justify-content-between mb-2 small">
                    <span className="text-muted fw-medium">Basic Contract Base Salary:</span>
                    <strong style={{ color: '#1e293b' }}>₹{Number(selectedPayslip.basic_salary).toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2 small">
                    <span className="text-muted fw-medium">Bonuses / Incentives:</span>
                    <strong className="text-success">+ ₹{Number(selectedPayslip.bonus).toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2 small" style={{ borderColor: '#f1f0f9' }}>
                    <span className="text-muted fw-medium">Deductions:</span>
                    <strong className="text-danger">- ₹{Number(selectedPayslip.deductions).toLocaleString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between pt-2 align-items-center">
                    <span className="fw-bold text-dark small">Take-home Net Payout:</span>
                    <span className="fw-extrabold fs-4" style={{ color: COLORS.indigo, letterSpacing: '-0.5px' }}>₹{Number(selectedPayslip.net_salary).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 gap-2 no-print pt-2">
                <button type="button" className="btn btn-light px-4 py-2 rounded-3 fw-semibold border small" onClick={() => setSelectedPayslip(null)}>Close</button>
                <button type="button" className="btn text-white px-4 py-2 rounded-3 fw-semibold hover-btn-lux border-0 small flex-grow-1" onClick={() => window.print()} style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                  🖨️ Export PDF Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;