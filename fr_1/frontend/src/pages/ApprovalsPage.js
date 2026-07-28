// src/pages/ApprovalsPage.js
import React, { useState, useMemo } from 'react';
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
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
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
  fileText: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline vectorEffect="non-scaling-stroke" points="14 2 14 8 20 8" />
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
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="20 6 9 17 4 12" />
    </svg>
  ),
  cross: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="18" y1="6" x2="6" y2="18" />
      <line vectorEffect="non-scaling-stroke" x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
};

const ApprovalsPage = () => {
  const user = getCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const [requests, setRequests] = useState([
    { id: 1, title: 'Purchase Order #4412 – Steel Rods', category: 'Procurement', requester: 'Arjun Sharma', initials: 'AS', amount: 184500, urgency: 'High', dueDate: 'Jun 19, 2026', status: 'Pending', overdue: true },
    { id: 2, title: 'Vendor Onboarding – RK Traders', category: 'Vendor Pay', requester: 'Priya Nair', initials: 'PN', amount: 0, urgency: 'Medium', dueDate: 'Jun 20, 2026', status: 'Approved', overdue: false },
    { id: 3, title: 'Site Inspection Report Clearance', category: 'Quality', requester: 'Suresh Patel', initials: 'SP', amount: 0, urgency: 'Low', dueDate: 'Jun 22, 2026', status: 'Approved', overdue: false },
    { id: 4, title: 'Unbudgeted Machinery Maintenance', category: 'Infrastructure', requester: 'Ravi Kumar', initials: 'RK', amount: 65000, urgency: 'High', dueDate: 'Jun 15, 2026', status: 'Rejected', overdue: false }
  ]);

  const [requestForm, setRequestForm] = useState({ title: '', requester: 'Arjun Sharma', initials: 'AS', category: 'Procurement', urgency: 'Medium', amount: 0, dueDate: '2026-06-30' });

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const q = searchTerm.toLowerCase();
      const matchSearch = r.title.toLowerCase().includes(q) || r.requester.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const handleAction = (id, newStatus) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleCreateRequest = (e) => {
    e.preventDefault();
    const newReq = {
      id: Date.now(),
      ...requestForm,
      status: 'Pending',
      overdue: false
    };
    setRequests([newReq, ...requests]);
    setShowModal(false);
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
    <div className="theme-approvals container-fluid px-4 py-4" style={{
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
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.28) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 6px;
        }

        /* FLOATING-ROW APPROVALS TABLE */
        .theme-approvals table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-approvals th {
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
        .theme-approvals td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-approvals tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-approvals tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-approvals tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-approvals tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.checkCircle}
          </div>
          <div>
            <h3 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
              Approvals
              <span className="badge rounded-pill bg-light text-primary border px-3" style={{ fontSize: '0.65rem' }}>GOVERNANCE</span>
            </h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Review and action pending approval requests across your team.</p>
          </div>
        </div>

        <button
          className="btn px-4 py-2 rounded-3 fw-bold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2 ms-auto"
          onClick={() => setShowModal(true)}
          style={{ background: `linear-gradient(135deg, ${COLORS.indigo} 0%, #60A5FA 100%)` }}
        >
          {THIN_ICONS.plus}
          <span> New Approval Request</span>
        </button>
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS ROW */}
      <div className="row g-3 mb-4">
        {[
          { label: 'TOTAL REQUESTS', value: requests.length.toString(), sub: '2 High Urgency · 4 Overdue', icon: THIN_ICONS.fileText, color: COLORS.indigo },
          { label: 'PENDING', value: requests.filter(r => r.status === 'Pending').length.toString(), sub: 'Awaiting Decision', icon: THIN_ICONS.clock, color: COLORS.slate },
          { label: 'APPROVED', value: requests.filter(r => r.status === 'Approved').length.toString(), sub: '38% Approval Rate', icon: THIN_ICONS.checkCircle, color: COLORS.emerald },
          { label: 'REJECTED', value: requests.filter(r => r.status === 'Rejected').length.toString(), sub: '13% Rejection Rate', icon: THIN_ICONS.xCircle, color: COLORS.alert }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTER TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="position-relative" style={{ minWidth: '280px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
            <input
              type="text"
              className="form-control rounded-pill ps-5 small"
              placeholder="Search requests, requester or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            {['All', 'Pending', 'Approved', 'Rejected'].map(st => (
              <button
                key={st}
                className={`btn btn-sm rounded-pill px-3 fw-bold ${statusFilter === st ? 'text-white' : 'bg-light text-dark border-0'}`}
                onClick={() => setStatusFilter(st)}
                style={{ background: statusFilter === st ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : undefined }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive p-4 pt-2">
          <table>
            <thead>
              <tr>
                <th>REQUEST</th>
                <th>REQUESTER</th>
                <th>AMOUNT</th>
                <th>URGENCY</th>
                <th>DUE DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(r => (
                <tr key={r.id}>
                  <td>
                    <div>
                      <span className="fw-bold d-block" style={{ color: '#1e293b' }}>{r.title}</span>
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>{r.category}</small>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge rounded-circle bg-primary-subtle text-primary p-2" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>{r.initials}</span>
                      <span className="fw-bold">{r.requester}</span>
                    </div>
                  </td>
                  <td className="fw-bold">{r.amount ? `₹${r.amount.toLocaleString()}` : '-'}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-1 fw-bold ${r.urgency === 'High' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'}`}>
                      • {r.urgency}
                    </span>
                  </td>
                  <td>
                    <span className={r.overdue ? 'text-danger fw-bold' : ''}>
                      {r.dueDate}
                      {r.overdue && <small className="d-block text-danger fw-bold" style={{ fontSize: '0.65rem' }}>OVERDUE</small>}
                    </span>
                  </td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-1 fw-bold ${r.status === 'Approved' ? 'bg-success-subtle text-success' : r.status === 'Rejected' ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'}`}>
                      ● {r.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {r.status === 'Pending' && (
                        <>
                          <button className="btn btn-sm btn-outline-success border-0 rounded-3 p-1" title="Approve" onClick={() => handleAction(r.id, 'Approved')}>
                            {THIN_ICONS.check}
                          </button>
                          <button className="btn btn-sm btn-outline-danger border-0 rounded-3 p-1" title="Reject" onClick={() => handleAction(r.id, 'Rejected')}>
                            {THIN_ICONS.cross}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW APPROVAL REQUEST MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title">New Approval Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateRequest}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Request Title *</label>
                    <input type="text" className="form-control rounded-3" placeholder="e.g. Purchase Order - Steel Rods" value={requestForm.title} onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })} required />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Due Date</label>
                      <input type="date" className="form-control rounded-3" value={requestForm.dueDate} onChange={(e) => setRequestForm({ ...requestForm, dueDate: e.target.value })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Category</label>
                      <input type="text" className="form-control rounded-3" placeholder="e.g. Procurement" value={requestForm.category} onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })} required />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Requester</label>
                      <select className="form-select rounded-3" value={requestForm.requester} onChange={(e) => setRequestForm({ ...requestForm, requester: e.target.value, initials: e.target.value.split(' ').map(n => n[0]).join('') })}>
                        <option value="Arjun Sharma">Arjun Sharma</option>
                        <option value="Priya Nair">Priya Nair</option>
                        <option value="Suresh Patel">Suresh Patel</option>
                        <option value="Ravi Kumar">Ravi Kumar</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Urgency</label>
                      <select className="form-select rounded-3" value={requestForm.urgency} onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Amount (₹, optional)</label>
                    <input type="number" className="form-control rounded-3" value={requestForm.amount} onChange={(e) => setRequestForm({ ...requestForm, amount: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn rounded-pill px-4 bg-white border" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn rounded-pill px-4 border-0 text-white fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.indigo} 0%, #60A5FA 100%)` }}>
                    Submit Request
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

export default ApprovalsPage;
