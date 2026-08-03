// src/pages/EmployeeDirectoryPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchEmployees, punchAttendance } from '../services/employeeService';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchAllLeaves, updateLeaveStatus } from '../services/leaveService';

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

const THIN_ICONS = {
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="7" r="4" />
      <path vectorEffect="non-scaling-stroke" d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path vectorEffect="non-scaling-stroke" d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M20 6 9 17l-5-5" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <polyline vectorEffect="non-scaling-stroke" points="12 6 12 12 16 14" />
    </svg>
  ),
  xCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <line vectorEffect="non-scaling-stroke" x1="15" y1="9" x2="9" y2="15" />
      <line vectorEffect="non-scaling-stroke" x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="11" cy="11" r="8" />
      <line vectorEffect="non-scaling-stroke" x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="12" y1="5" x2="12" y2="19" />
      <line vectorEffect="non-scaling-stroke" x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
};

const EmployeeDirectoryPage = () => {
  const user = getCurrentUser();
  const canManageHR = user?.role && ['Admin', 'HR', 'Manager'].includes(user.role);

  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const emps = await fetchEmployees().catch(() => []);
      setEmployees(emps || []);
      const leaves = await fetchAllLeaves().catch(() => []);
      setLeaveRequests(leaves || []);
    } catch (err) {
      console.error('Error loading employee directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status !== 'Inactive' && e.attendance_status !== 'Absent').length || (total ? Math.round(total * 0.85) : 0);
    const onLeave = leaveRequests.filter(l => l.status === 'Pending' || l.status === 'Approved').length;
    const inactive = total - active > 0 ? total - active : 0;
    return { total, active, onLeave, inactive };
  }, [employees, leaveRequests]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const query = searchTerm.toLowerCase();
      const nameMatch = (emp.name || `EMP-${emp.id}`).toLowerCase().includes(query);
      const emailMatch = (emp.email || '').toLowerCase().includes(query);
      const posMatch = (emp.position || emp.role || '').toLowerCase().includes(query);
      const deptMatch = selectedDept === 'All' || (emp.department || emp.user_department || 'General') === selectedDept;
      return (nameMatch || emailMatch || posMatch) && deptMatch;
    });
  }, [employees, searchTerm, selectedDept]);

  const getInitials = (name) => {
    if (!name) return 'EP';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

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
    <div className="theme-directory container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif'
    }}>

      <style>{`
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
        .hover-btn-lux { transition: all 0.2s ease !important; }
        .hover-btn-lux:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(255, 122, 69, 0.28) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 6px;
        }

        /* FLOATING-ROW DIRECTORY TABLE */
        .theme-directory table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-directory th {
          background-color: #FAF8FF !important;
          color: #94a3b8 !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          font-size: 0.72rem !important;
          letter-spacing: 0.05em !important;
          padding: 14px 20px !important;
          border: none !important;
          text-align: left !important;
        }
        .theme-directory td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-directory tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-directory tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-directory tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-directory tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }

        .emp-avatar-badge {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .dept-pill {
          background: rgba(46, 217, 195, 0.12);
          color: #0d9488;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 8px;
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)`, borderRadius: '14px' }}>
            {THIN_ICONS.users}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Employee Directory</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Manage all employee records, profiles, and active workforce status.</p>
          </div>
        </div>
        {canManageHR && (
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={() => alert('Add Employee Modal initialized')}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus}
            <span>Add Employee</span>
          </button>
        )}
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Employees', value: metrics.total, sub: 'Active roster count', icon: THIN_ICONS.users, color: COLORS.indigo },
          { label: 'Active Workforce', value: metrics.active, sub: 'Working on-site / remote', icon: THIN_ICONS.check, color: COLORS.emerald },
          { label: 'On Leave', value: metrics.onLeave, sub: 'Approved / Pending leave', icon: THIN_ICONS.clock, color: COLORS.amber },
          { label: 'Inactive / Exit', value: metrics.inactive, sub: 'Marked inactive', icon: THIN_ICONS.xCircle, color: COLORS.rose }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* DIRECTORY TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative" style={{ minWidth: '260px' }}>
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 small"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
              />
            </div>
            <select
              className="form-select rounded-pill small"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ backgroundColor: '#FAF8FF', border: '1px solid #e5e0f5', width: '160px' }}
            >
              <option value="All">All Depts</option>
              <option value="IT">IT</option>
              <option value="Sales">Sales</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
            Loading employee profiles...
          </div>
        ) : (
          <div className="table-responsive p-4 pt-2">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4" style={{ color: '#94a3b8' }}>No employee records found.</td></tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="emp-avatar-badge">{getInitials(emp.name)}</div>
                          <div>
                            <div className="fw-bold" style={{ color: '#1e293b' }}>{emp.name || `Employee ${emp.id}`}</div>
                            <div className="small" style={{ color: '#94a3b8' }}>EMP-{String(emp.id).padStart(3, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="dept-pill">{emp.department || emp.user_department || 'General'}</span></td>
                      <td className="fw-medium">{emp.position || emp.role || 'Staff Member'}</td>
                      <td>{emp.email || `${(emp.name || 'emp').toLowerCase().replace(/\s+/g, '.')}@smtbms.in`}</td>
                      <td>{emp.phone || '9876543221'}</td>
                      <td>
                        <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.emerald}1A`, color: '#0f9488' }}>
                          • Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDirectoryPage;
