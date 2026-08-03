// src/pages/LeaveManagementPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchAllLeaves, fetchMyLeaves, applyLeave, updateLeaveStatus } from '../services/leaveService';
import { getCurrentUser } from '../utils/authHelpers';

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
  document: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline vectorEffect="non-scaling-stroke" points="14 2 14 8 20 8" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <polyline vectorEffect="non-scaling-stroke" points="12 6 12 12 16 14" />
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M20 6 9 17l-5-5" />
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
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="2" x2="16" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="2" x2="8" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
};

const LeaveManagementPage = () => {
  const user = getCurrentUser();
  const canManageHR = user?.role && ['ADMIN', 'HR', 'MANAGER'].includes(user.role);

  const [leaves, setLeaves] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form State
  const [applyForm, setApplyForm] = useState({
    leave_type: 'Casual Leave',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const allData = await fetchAllLeaves().catch(() => []);
      setLeaves(allData || []);
      const myData = await fetchMyLeaves().catch(() => []);
      setMyLeaves(myData || []);
    } catch (err) {
      console.error('Error loading leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const total = leaves.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    leaves.forEach(l => {
      if (l.status === 'Approved') approved++;
      else if (l.status === 'Rejected') rejected++;
      else pending++;
    });

    return { total, pending, approved, rejected };
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      const query = searchTerm.toLowerCase();
      const nameMatch = (l.employee_name || `EMP-${l.employee_id}`).toLowerCase().includes(query);
      const typeMatch = (l.leave_type || '').toLowerCase().includes(query);
      const statusMatch = statusFilter === 'All' || l.status === statusFilter;
      return (nameMatch || typeMatch) && statusMatch;
    });
  }, [leaves, searchTerm, statusFilter]);

  const handleAction = async (leaveId, status) => {
    try {
      await updateLeaveStatus(leaveId, status);
      loadLeaves();
    } catch (err) {
      alert('Failed to update leave request status.');
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      await applyLeave(applyForm);
      alert('Leave application submitted successfully!');
      setShowApplyModal(false);
      setApplyForm({
        leave_type: 'Casual Leave',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: ''
      });
      loadLeaves();
    } catch (err) {
      alert('Failed to submit leave application.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'LM';
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
    <div className="theme-leave container-fluid px-4 py-4" style={{
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

        /* FLOATING-ROW LEAVE TABLE */
        .theme-leave table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-leave th {
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
        .theme-leave th.text-center {
          text-align: center !important;
        }
        .theme-leave td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-leave tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-leave tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-leave tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-leave tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }

        .emp-avatar-badge {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${COLORS.amber} 0%, ${COLORS.primary} 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.95rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .leave-type-pill {
          background: rgba(91, 141, 239, 0.12);
          color: #2563eb;
          font-weight: 700;
          font-size: 0.78rem;
          padding: 4px 12px;
          border-radius: 8px;
        }

        /* ARC PROGRESS CARDS */
        .leave-balance-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid rgba(226, 232, 240, 0.8);
          text-align: center;
        }
      `}</style>

      {/* HEADER (VISIBLE TO ALL ROLES) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.calendar}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
              {canManageHR ? ' Leave Management' : 'My Leaves & Leave Management'}
            </h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">
              {canManageHR ? 'Review, approve, and manage workforce leave requests.' : 'Manage your leave applications, balance history, and company approvals.'}
            </p>
          </div>
        </div>
        <button
          className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
          onClick={() => setShowApplyModal(true)}
          style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
        >
          {THIN_ICONS.plus}
          <span>Apply Leave</span>
        </button>
      </div>

      {/* ADMIN & HR GLOBAL LEAVE APPLICATIONS MANAGEMENT TABLE */}
      {['ADMIN', 'HR'].includes(user?.role) ? (
        <div className="pt-2">
          <div className="section-eyebrow mb-3" style={{ fontSize: '0.85rem' }}>All Workforce Leave Applications</div>

          {/* METRIC OVERVIEW CARDS */}
          <div className="row g-3 mb-4">
            {[
              { label: 'Total Requests', value: metrics.total, sub: 'All leave applications', icon: THIN_ICONS.document, color: COLORS.indigo },
              { label: 'Pending', value: metrics.pending, sub: 'Action required', icon: THIN_ICONS.clock, color: COLORS.amber },
              { label: 'Approved', value: metrics.approved, sub: 'Approval rate', icon: THIN_ICONS.check, color: COLORS.emerald },
              { label: 'Rejected', value: metrics.rejected, sub: 'Not approved', icon: THIN_ICONS.xCircle, color: COLORS.rose }
            ].map((card, idx) => (
              <div key={idx} className="col-12 col-sm-6 col-xl-3">
                <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
              </div>
            ))}
          </div>

          {/* LEAVE TABLE CARD */}
          <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
            <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="position-relative" style={{ minWidth: '260px' }}>
                  <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
                  <input
                    type="text"
                    className="form-control rounded-pill ps-5 small"
                    placeholder="Search employee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
                  />
                </div>
                <select
                  className="form-select rounded-pill small px-3 text-muted"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ backgroundColor: '#FAF8FF', border: '1px solid #e5e0f5', width: '140px' }}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
                <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
                Loading leave applications...
              </div>
            ) : (
              <div className="table-responsive p-4 pt-2">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Dept</th>
                      <th>Leave Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.length === 0 ? (
                      <tr><td colSpan="8" className="text-center py-4" style={{ color: '#94a3b8' }}>No leave applications logged.</td></tr>
                    ) : (
                      filteredLeaves.map(l => {
                        const empName = l.employee_name || `Employee ${l.employee_id}`;
                        let statusBadge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.amber}22`, color: '#b45309' }}>• Pending</span>;
                        if (l.status === 'Approved') {
                          statusBadge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.emerald}1A`, color: '#0f9488' }}>• Approved</span>;
                        } else if (l.status === 'Rejected') {
                          statusBadge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.alert}1A`, color: '#dc2626' }}>• Rejected</span>;
                        }

                        return (
                          <tr key={l.id}>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <div className="emp-avatar-badge">{getInitials(empName)}</div>
                                <div className="fw-bold" style={{ color: '#1e293b' }}>{empName}</div>
                              </div>
                            </td>
                            <td>{l.department || 'General'}</td>
                            <td><span className="leave-type-pill">{l.leave_type || 'Casual Leave'}</span></td>
                            <td>{l.start_date ? new Date(l.start_date).toLocaleDateString() : '2026-06-14'}</td>
                            <td>{l.end_date ? new Date(l.end_date).toLocaleDateString() : '2026-06-14'}</td>
                            <td className="fw-bold">1d</td>
                            <td>{statusBadge}</td>
                            <td className="text-center">
                              {l.status === 'Pending' ? (
                                <div className="d-flex gap-2 justify-content-center">
                                  <button className="btn btn-sm btn-success rounded-2 px-2 py-1 fw-bold" onClick={() => handleAction(l.id, 'Approved')}>Approve</button>
                                  <button className="btn btn-sm btn-outline-danger rounded-2 px-2 py-1 fw-bold" onClick={() => handleAction(l.id, 'Rejected')}>Reject</button>
                                </div>
                              ) : (
                                <span className="small text-muted">Archived</span>
                              )}
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
      ) : (
        <>
          {/* USER PROFILE SUMMARY BANNER */}
          <div className="card border-0 p-4 mb-4 hover-premium-card" style={{ borderRadius: '22px' }}>
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4">
              <div className="d-flex align-items-center gap-3">
                <div className="emp-avatar-badge" style={{ width: 56, height: 56, fontSize: '1.2rem' }}>
                  {getInitials(user?.name)}
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h4 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{user?.name || 'Tarun Bose'}</h4>
                    <span className="badge rounded-pill bg-success-subtle text-success px-3 py-1 fw-bold">Active</span>
                  </div>
                  <p className="small text-muted mb-0 mt-1">
                    {user?.role === 'ADMIN' ? 'Admin Workspace' : `EMP-${String(user?.id || '014').padStart(3, '0')}`} • {user?.role || 'Staff Member'} • {user?.email || 'tarun.b@smtbms.in'}
                  </p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-4 border-start-lg ps-lg-4" style={{ borderColor: '#e5e0f5' }}>
                <div>
                  <span className="d-block small text-muted">Department</span>
                  <span className="fw-bold" style={{ color: '#1e293b' }}>{user?.department || 'IT Operations'}</span>
                </div>
                <div>
                  <span className="d-block small text-muted">Employee Type</span>
                  <span className="fw-bold" style={{ color: '#1e293b' }}>Full Time</span>
                </div>
                <div>
                  <span className="d-block small text-muted">Join Date</span>
                  <span className="fw-bold" style={{ color: '#1e293b' }}>Nov 20, 2023</span>
                </div>
              </div>
            </div>
          </div>

          {/* LEAVE BALANCE PROGRESS GRID */}
          <div className="section-eyebrow">Leave Balance Overview</div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="leave-balance-card">
                <h6 className="fw-bold text-start mb-3" style={{ color: COLORS.indigo }}>Casual Leave</h6>
                <div className="my-2">
                  <h2 className="fw-extrabold mb-0" style={{ color: '#1e293b' }}>10</h2>
                  <span className="small text-muted fw-bold">Days Left</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mt-3 pt-2 border-top">
                  <span>0 Used</span>
                  <span>10 Total</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="leave-balance-card">
                <h6 className="fw-bold text-start mb-3" style={{ color: '#0f9488' }}>Sick Leave</h6>
                <div className="my-2">
                  <h2 className="fw-extrabold mb-0" style={{ color: '#1e293b' }}>10</h2>
                  <span className="small text-muted fw-bold">Days Left</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mt-3 pt-2 border-top">
                  <span>0 Used</span>
                  <span>10 Total</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="leave-balance-card">
                <h6 className="fw-bold text-start mb-3" style={{ color: COLORS.violet }}>Privilege Leave</h6>
                <div className="my-2">
                  <h2 className="fw-extrabold mb-0" style={{ color: '#1e293b' }}>15</h2>
                  <span className="small text-muted fw-bold">Days Left</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mt-3 pt-2 border-top">
                  <span>0 Used</span>
                  <span>15 Total</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="leave-balance-card">
                <h6 className="fw-bold text-start mb-3" style={{ color: COLORS.amber }}>Comp Off</h6>
                <div className="my-2">
                  <h2 className="fw-extrabold mb-0" style={{ color: '#1e293b' }}>4</h2>
                  <span className="small text-muted fw-bold">Days Left</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mt-3 pt-2 border-top">
                  <span>0 Used</span>
                  <span>4 Total</span>
                </div>
              </div>
            </div>
          </div>

          {/* MY PERSONAL LEAVE APPLICATIONS TABLE (FOR EMPLOYEES / MANAGERS / SALES) */}
          <div className="section-eyebrow">My Leave History</div>
          <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
            {loading ? (
              <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
                <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
                Loading your leave history...
              </div>
            ) : (
              <div className="table-responsive p-4">
                <table>
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaves.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-4" style={{ color: '#94a3b8' }}>You have not submitted any leave applications yet.</td></tr>
                    ) : (
                      myLeaves.map(l => {
                        let statusBadge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.amber}22`, color: '#b45309' }}>• Pending Approval</span>;
                        if (l.status === 'Approved') {
                          statusBadge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.emerald}1A`, color: '#0f9488' }}>• Approved</span>;
                        } else if (l.status === 'Rejected') {
                          statusBadge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.alert}1A`, color: '#dc2626' }}>• Rejected</span>;
                        }

                        return (
                          <tr key={l.id}>
                            <td><span className="leave-type-pill">{l.leave_type || 'Casual Leave'}</span></td>
                            <td className="fw-semibold">{l.start_date ? new Date(l.start_date).toLocaleDateString() : '2026-06-14'}</td>
                            <td className="fw-semibold">{l.end_date ? new Date(l.end_date).toLocaleDateString() : '2026-06-14'}</td>
                            <td>{l.reason || 'Personal leave request'}</td>
                            <td>{statusBadge}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* APPLY LEAVE MODAL */}
      {showApplyModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title" style={{ color: '#1e293b' }}>Apply for Leave</h5>
                <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)}></button>
              </div>
              <form onSubmit={handleApplySubmit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Leave Type</label>
                    <select
                      className="form-select rounded-3"
                      value={applyForm.leave_type}
                      onChange={(e) => setApplyForm({ ...applyForm, leave_type: e.target.value })}
                      required
                    >
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Privilege Leave">Privilege Leave</option>
                      <option value="Comp Off">Comp Off</option>
                    </select>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Start Date</label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        value={applyForm.start_date}
                        onChange={(e) => setApplyForm({ ...applyForm, start_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">End Date</label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        value={applyForm.end_date}
                        onChange={(e) => setApplyForm({ ...applyForm, end_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Reason for Leave</label>
                    <textarea
                      className="form-control rounded-3"
                      rows={3}
                      placeholder="Specify reason..."
                      value={applyForm.reason}
                      onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn rounded-pill px-4 bg-white border" onClick={() => setShowApplyModal(false)}>Cancel</button>
                  <button
                    type="submit"
                    className="btn rounded-pill px-4 border-0 text-white fw-semibold"
                    style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagementPage;