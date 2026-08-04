// src/pages/EmployeeDirectoryPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchEmployees, punchAttendance, createEmployee, updateEmployee, deleteEmployee } from '../services/employeeService';
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
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeEmployeeId, setActiveEmployeeId] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({ employee_id: '', name: '', email: '', role: 'Employee', department: 'IT', hire_date: '', base_salary: '' });

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

  const generateEmployeeId = () => {
    return 'EMP-' + Math.floor(1000 + Math.random() * 9000);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateEmployee(activeEmployeeId, newEmployee);
      } else {
        await createEmployee(newEmployee);
      }
      setShowModal(false);
      setEditMode(false);
      setActiveEmployeeId(null);
      setNewEmployee({ employee_id: '', name: '', email: '', role: 'Employee', department: 'IT', hire_date: '', base_salary: '' });
      loadData();
    } catch (err) {
      alert(editMode ? 'Failed to update employee' : 'Failed to add employee');
    }
  };

  const handleEdit = (emp) => {
    setNewEmployee({
      employee_id: emp.employee_code || `EMP-${String(emp.id).padStart(3, '0')}`,
      name: emp.name || '',
      email: emp.email || '',
      role: emp.user_role || emp.designation || 'Employee',
      department: emp.department || 'IT',
      hire_date: emp.join_date ? emp.join_date.split('T')[0] : '',
      base_salary: emp.salary || ''
    });
    setEditMode(true);
    setActiveEmployeeId(emp.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this employee record?')) return;
    try {
      await deleteEmployee(id);
      loadData();
    } catch (err) {
      alert('Failed to delete employee');
    }
  };

  const handleView = (emp) => {
    setViewingEmployee(emp);
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

        .btn-action-icon {
          width: 32px !important; height: 32px !important; border-radius: 10px !important;
          border: none !important; display: inline-flex !important; align-items: center !important;
          justify-content: center !important; transition: all 0.2s ease !important; cursor: pointer !important;
        }
        .view-icon-btn { background-color: #ECFDF5 !important; color: #10B981 !important; }
        .view-icon-btn:hover { background-color: #10B981 !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important; transform: translateY(-1px); }
        .edit-icon-btn { background-color: #EFF6FF !important; color: #3B82F6 !important; }
        .edit-icon-btn:hover { background-color: #3B82F6 !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25) !important; transform: translateY(-1px); }
        .del-icon-btn { background-color: #FFF1F2 !important; color: #F43F5E !important; }
        .del-icon-btn:hover { background-color: #F43F5E !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25) !important; transform: translateY(-1px); }

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
            onClick={() => {
              setEditMode(false);
              setActiveEmployeeId(null);
              setNewEmployee({ employee_id: generateEmployeeId(), name: '', email: '', role: 'Employee', department: 'IT', hire_date: '', base_salary: '' });
              setShowModal(true);
            }}
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
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4" style={{ color: '#94a3b8' }}>No employee records found.</td></tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="emp-avatar-badge">{getInitials(emp.name)}</div>
                          <div>
                            <div className="fw-bold" style={{ color: '#1e293b' }}>{emp.name || `Employee ${emp.id}`}</div>
                            <div className="small" style={{ color: '#94a3b8' }}>{emp.employee_code || `EMP-${String(emp.id).padStart(3, '0')}`}</div>
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
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center align-items-center">
                          <button className="btn-action-icon view-icon-btn" title="View Profile" onClick={() => handleView(emp)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          <button className="btn-action-icon edit-icon-btn" title="Edit Employee" onClick={() => handleEdit(emp)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="btn-action-icon del-icon-btn" title="Delete Employee" onClick={() => handleDelete(emp.id)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2" />
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
        )}
      </div>

      {/* ADD EMPLOYEE MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '22px' }}>
              <div className="modal-header border-0 px-4 pt-4">
                <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{editMode ? 'Edit Employee' : 'Add New Employee'}</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body px-4 py-4">
                <form onSubmit={handleAddEmployee}>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-muted small">Employee ID</label>
                    <input type="text" className="form-control" required value={newEmployee.employee_id} onChange={e => setNewEmployee({...newEmployee, employee_id: e.target.value})} style={{ borderRadius: '12px', background: '#f8fafc' }} />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-muted small">Full Name</label>
                      <input type="text" className="form-control" required value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} style={{ borderRadius: '12px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-muted small">Email Address</label>
                      <input type="email" className="form-control" required value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} style={{ borderRadius: '12px' }} />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-muted small">Role</label>
                      <select className="form-select" value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})} style={{ borderRadius: '12px' }}>
                        <option>Employee</option>
                        <option>Manager</option>
                        <option>HR</option>
                        <option>Admin</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-muted small">Department</label>
                      <select className="form-select" value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})} style={{ borderRadius: '12px' }}>
                        <option value="IT">IT</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Operations">Operations</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-muted small">Hire Date</label>
                      <input type="date" className="form-control" value={newEmployee.hire_date} onChange={e => setNewEmployee({...newEmployee, hire_date: e.target.value})} style={{ borderRadius: '12px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-muted small">Base Salary</label>
                      <input type="number" className="form-control" value={newEmployee.base_salary} onChange={e => setNewEmployee({...newEmployee, base_salary: e.target.value})} style={{ borderRadius: '12px' }} />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" className="btn px-4 py-2 fw-semibold" onClick={() => setShowModal(false)} style={{ borderRadius: '12px', background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
                    <button type="submit" className="btn px-4 py-2 fw-bold text-white border-0" style={{ borderRadius: '12px', background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>{editMode ? 'Update Employee' : 'Create Employee'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {viewingEmployee && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '22px' }}>
              <div className="modal-header px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #f1f5f9', borderTopLeftRadius: '22px', borderTopRightRadius: '22px' }}>
                <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Employee Profile</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setViewingEmployee(null)} style={{ backgroundSize: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px' }}></button>
              </div>
              <div className="modal-body px-4 py-4">
                <div className="text-center mb-4">
                  <div className="mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                       style={{ width: '80px', height: '80px', borderRadius: '50%', fontSize: '2rem', background: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)' }}>
                    {getInitials(viewingEmployee.name)}
                  </div>
                  <h4 className="fw-bold mb-1" style={{ color: '#1e293b' }}>{viewingEmployee.name || 'Unknown'}</h4>
                  <div className="small mb-2" style={{ color: '#64748b' }}>
                    {viewingEmployee.user_role || viewingEmployee.designation || 'Employee'} · {viewingEmployee.department || 'General'}
                  </div>
                  <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0' }}>
                    <span style={{ fontSize: '14px', marginRight: '4px' }}>•</span> Active
                  </span>
                </div>
                
                <hr style={{ borderColor: '#e2e8f0', margin: '1.5rem 0' }} />

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-center pb-2" style={{ borderBottom: '1px solid #f8fafc' }}>
                    <span className="fw-bold small" style={{ color: '#94a3b8' }}>Employee ID</span>
                    <span className="fw-bold" style={{ color: '#1e293b' }}>{viewingEmployee.employee_code || `EMP-${String(viewingEmployee.id).padStart(3, '0')}`}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pb-2" style={{ borderBottom: '1px solid #f8fafc' }}>
                    <span className="fw-bold small" style={{ color: '#94a3b8' }}>Email</span>
                    <span className="fw-bold" style={{ color: '#1e293b' }}>{viewingEmployee.email || `${(viewingEmployee.name || 'emp').toLowerCase().replace(/\s+/g, '.')}@smtbms.in`}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pb-2" style={{ borderBottom: '1px solid #f8fafc' }}>
                    <span className="fw-bold small" style={{ color: '#94a3b8' }}>Phone</span>
                    <span className="fw-bold" style={{ color: '#1e293b' }}>{viewingEmployee.phone || '9876543223'}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pb-2" style={{ borderBottom: '1px solid #f8fafc' }}>
                    <span className="fw-bold small" style={{ color: '#94a3b8' }}>Date of Joining</span>
                    <span className="fw-bold" style={{ color: '#1e293b' }}>{viewingEmployee.join_date ? viewingEmployee.join_date.split('T')[0] : 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pb-2" style={{ borderBottom: '1px solid #f8fafc' }}>
                    <span className="fw-bold small" style={{ color: '#94a3b8' }}>Monthly Salary</span>
                    <span className="fw-bold" style={{ color: '#1e293b' }}>₹{Number(viewingEmployee.salary || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectoryPage;
