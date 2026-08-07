// src/pages/UserManagementPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/adminService';

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
  users: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="7" r="4" />
      <path vectorEffect="non-scaling-stroke" d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path vectorEffect="non-scaling-stroke" d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  trendingUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline vectorEffect="non-scaling-stroke" points="17 6 23 6 23 12" />
    </svg>
  ),
  briefcase: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path vectorEffect="non-scaling-stroke" d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <line vectorEffect="non-scaling-stroke" x1="2" y1="12" x2="22" y2="12" />
    </svg>
  ),
  // ── FIXED: matched exactly to MaterialTable.js edit icon (no vectorEffect / overflow override,
  // so the stroke scales down with the 24→15 viewBox the same way it does on the Materials page) ──
  pencil: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
  ),
  // ── FIXED: matched exactly to MaterialTable.js delete icon ──
  trash: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', role: 'Employee', department: 'Administration', phone: ''
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const u = await fetchUsers();
      setUsers(Array.isArray(u) ? u : []);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  // 1. Metric Calculations
  const metrics = useMemo(() => {
    const total = users.length;
    const adminHr = users.filter(u => ['Admin', 'HR'].includes(u.role)).length;
    const managerSales = users.filter(u => ['Manager', 'Sales'].includes(u.role)).length;
    const employees = users.filter(u => u.role === 'Employee').length;
    return { total, adminHr, managerSales, employees };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === 'All' || u.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  const handleOpenUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({ ...user, password: '' });
    } else {
      setEditingUser(null);
      setUserForm({ name: '', email: '', password: '', role: 'Employee', department: 'Administration', phone: '' });
    }
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) await updateUser(editingUser.id, userForm);
      else await createUser(userForm);
      setShowUserModal(false);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // ── circular ring-icon metric card, matching UI reference precisely ──
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
    <div className="theme-users container-fluid px-4 py-4" style={{
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

        /* CONFIGURING MANAGEMENT REFERENCE DATA TABLE */
        .theme-users table {
          width: 100% !important;
          border-collapse: collapse !important;
          background-color: #ffffff !important;
        }

        /* Header Style Mapping */
        .theme-users th {
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
        .theme-users td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          border-bottom: 1px solid #f4f2fb !important;
          color: #475569 !important;
          font-size: 0.92rem !important;
        }

        .theme-users tbody tr {
          transition: background-color 0.15s ease !important;
        }
        .theme-users tbody tr:hover {
          background-color: #FDFAFF !important;
        }

        /* Primary Data Boldings Mapping */
        .theme-users .user-name-cell {
          font-weight: 700 !important;
          color: #1a202c !important;
        }
        .theme-users .user-email-cell {
          font-weight: 500 !important;
          color: #4a5568 !important;
        }

        /* Department Pill Badges */
        .theme-users .badge-dept {
          background-color: ${COLORS.indigo}14 !important;
          color: ${COLORS.indigo} !important;
          border: 1px solid ${COLORS.indigo}33 !important;
          padding: 4px 14px !important;
          border-radius: 20px !important;
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          display: inline-block;
        }

        /* Role UI Badge System Mapping */
        .theme-users .role-admin {
          background-color: ${COLORS.rose}14 !important;
          color: #dc2626 !important;
          border: 1px solid ${COLORS.rose}44 !important;
          padding: 4px 12px !important;
          border-radius: 20px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          display: inline-block;
        }
        .theme-users .role-manager {
          background-color: ${COLORS.amber}18 !important;
          color: #b45309 !important;
          border: 1px solid ${COLORS.amber}44 !important;
          padding: 4px 12px !important;
          border-radius: 20px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          display: inline-block;
        }
        .theme-users .role-standard {
          background-color: ${COLORS.emerald}14 !important;
          color: #0f9488 !important;
          border: 1px solid ${COLORS.emerald}44 !important;
          padding: 4px 12px !important;
          border-radius: 20px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          display: inline-block;
        }

        /* ── ACTION MATRIX ICON BUTTONS — matched exactly to MaterialsPage / MaterialTable ── */
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
        .del-icon-btn {
          background-color: #FFF1F2 !important;
          color: #F43F5E !important;
        }
        .del-icon-btn:hover {
          background-color: #F43F5E !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25) !important;
          transform: translateY(-1px);
        }

        /* Clean Input Filtering Header Styles */
        .theme-users .filter-input-lux {
          background-color: #ffffff !important;
          border: 1px solid #e5e0f5 !important;
          border-radius: 8px !important;
          padding: 8px 14px !important;
          font-size: 0.9rem !important;
          font-weight: 500 !important;
          color: #475569 !important;
        }
        .theme-users .filter-input-lux:focus {
          outline: none !important;
          border-color: ${COLORS.indigo} !important;
          box-shadow: 0 0 0 3px ${COLORS.indigo}1A !important;
        }

        /* Search input needs extra left padding so text clears the icon —
           the shorthand padding above would otherwise override ps-5 */
        .theme-users .search-input-lux {
          padding-left: 2.75rem !important;
        }
      `}</style>

      {/* MATCHED MODERN NAVIGATION HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.users}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>User Management Terminal</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Manage platform credentials and organizational roles</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={() => handleOpenUserModal()}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus}
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS DISPLAYS WITH CLEAN SVG MATRIX INTEGRATION */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Users', value: metrics.total, sub: 'Registered accounts', icon: THIN_ICONS.users, color: COLORS.indigo },
          { label: 'Admin & HR', value: metrics.adminHr, sub: 'Privileged access credentials', icon: THIN_ICONS.shield, color: COLORS.rose },
          { label: 'Manager & Sales', value: metrics.managerSales, sub: 'Active operational leads', icon: THIN_ICONS.trendingUp, color: COLORS.sky },
          { label: 'Employees', value: metrics.employees, sub: 'Standard production staff', icon: THIN_ICONS.briefcase, color: COLORS.emerald }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* SUBMIT / EDIT SYSTEM FORMS */}
      {showUserModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUserModal(false);
          }}
        >
          <div
            className="card border-0 shadow-lg p-4 animate__animated animate__fadeInUp hide-scrollbar-lux"
            style={{
              width: '100%',
              maxWidth: '580px',
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              maxHeight: '92vh',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <style>{`
              .hide-scrollbar-lux::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }
              .modal-input-lux {
                background-color: #F1F5F9 !important;
                border: 1px solid #E2E8F0 !important;
                border-radius: 12px !important;
                padding: 0.5rem 0.85rem !important;
                font-weight: 600 !important;
                color: #334155 !important;
                font-size: 0.86rem !important;
              }
              .modal-input-lux:focus {
                border-color: #FF7A45 !important;
                box-shadow: 0 0 0 3px rgba(255, 122, 69, 0.15) !important;
              }
              .modal-label-lux {
                font-size: 0.68rem !important;
                font-weight: 800 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.04em !important;
                color: #64748B !important;
                margin-bottom: 4px !important;
              }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '32px', height: '32px', background: '#F5F3FF', color: COLORS.indigo }}>
                  {editingUser ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                </span>
                <h5 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.25rem' }}>
                  {editingUser ? 'Modify User Credentials' : 'Register New User Profile'}
                </h5>
              </div>
              <button
                type="button"
                className="btn-close rounded-circle p-2"
                style={{ backgroundColor: '#F1F5F9' }}
                onClick={() => setShowUserModal(false)}
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={handleUserSubmit} className="p-2">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">FULL NAME *</label>
                  <input type="text" className="form-control modal-input-lux" value={userForm.name} required onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">EMAIL ADDRESS *</label>
                  <input type="email" className="form-control modal-input-lux" value={userForm.email} required onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">PASSWORD {editingUser && '(LEAVE BLANK TO RETAIN)'}</label>
                  <input type="password" className="form-control modal-input-lux" value={userForm.password} required={!editingUser} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">FUNCTIONAL ROLE *</label>
                  <select className="form-select modal-input-lux" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                    <option value="Admin">Admin</option>
                    <option value="HR">HR</option>
                    <option value="Manager">Manager</option>
                    <option value="Sales">Sales</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">DEPARTMENT</label>
                  <input type="text" className="form-control modal-input-lux" value={userForm.department} onChange={(e) => setUserForm({ ...userForm, department: e.target.value })} />
                </div>
              </div>
              <div className="row g-3 mt-4 pt-2">
                <div className="col-12 col-md-6">
                  <button
                    type="submit"
                    className="btn w-100 py-2.5 rounded-3 fw-bold text-white border-0 shadow-sm hover-btn-lux"
                    style={{ background: 'linear-gradient(135deg, #FF7A45 0%, #FFA36C 100%)' }}
                  >
                    {editingUser ? 'Save Updates' : 'Confirm Registration'}
                  </button>
                </div>
                <div className="col-12 col-md-6">
                  <button
                    type="button"
                    className="btn w-100 py-2.5 rounded-3 fw-bold border-0"
                    style={{ background: '#F1F5F9', color: '#475569' }}
                    onClick={() => setShowUserModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FILTER CONTROL BAR & LAYOUT REGISTRIES TABLE CONTAINER */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-3 border-bottom d-flex flex-wrap gap-2 align-items-center bg-white">
          <div className="position-relative" style={{ minWidth: '260px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3 d-flex align-items-center" style={{ color: '#94a3b8', pointerEvents: 'none' }}>{THIN_ICONS.search}</span>
            <input
              type="text"
              className="form-control filter-input-lux search-input-lux"
              placeholder="Search user directory..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
          <select className="form-select w-25 filter-input-lux" style={{ minWidth: '160px' }} value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
            <option value="All">All Roles Directory</option>
            <option value="Admin">Admin</option>
            <option value="HR">HR</option>
            <option value="Manager">Manager</option>
            <option value="Sales">Sales</option>
            <option value="Employee">Employee</option>
          </select>
        </div>

        {loading ? (
          <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
            Synchronizing live account structures...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th className="px-4 py-3">Full Name</th>
                  <th>Email Address</th>
                  <th>Privilege Role</th>
                  <th className="text-center" style={{ textAlign: 'center' }}>Department Allocation</th>
                  <th className="text-center" style={{ textAlign: 'center' }}>Actions Matrix</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted fw-medium">No matching active records verified on the platform.</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    // Assign explicit status-badge style strings depending on standard role access
                    let roleClass = 'role-standard';
                    if (u.role === 'Admin' || u.role === 'HR') roleClass = 'role-admin';
                    if (u.role === 'Manager' || u.role === 'Sales') roleClass = 'role-manager';

                    return (
                      <tr key={u.id}>
                        <td className="px-4 py-3 user-name-cell">{u.name}</td>
                        <td className="user-email-cell">{u.email}</td>
                        <td>
                          <span className={roleClass}>{u.role}</span>
                        </td>
                        <td className="text-center" style={{ textAlign: 'center' }}>
                          <span className="badge-dept">{u.department || 'General'}</span>
                        </td>
                        <td className="text-center" style={{ textAlign: 'center' }}>
                          <div className="d-flex justify-content-center gap-1">
                            <button className="btn-action-icon edit-icon-btn" title="Edit User" onClick={() => handleOpenUserModal(u)}>
                              {THIN_ICONS.pencil}
                            </button>
                            <button className="btn-action-icon del-icon-btn" title="Delete User" onClick={() => handleDeleteUser(u.id, u.name)}>
                              {THIN_ICONS.trash}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;