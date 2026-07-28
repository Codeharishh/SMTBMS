// src/pages/FollowUps.js
import React, { useState, useMemo } from 'react';
import { getCurrentUser } from '../utils/authHelpers';

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
  userCheck: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="8.5" cy="7" r="4" />
      <polyline vectorEffect="non-scaling-stroke" points="17 11 19 13 23 9" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <polyline vectorEffect="non-scaling-stroke" points="12 6 12 12 16 14" />
    </svg>
  ),
  alertTriangle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="9" x2="12" y2="13" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="7" r="4" />
      <path vectorEffect="non-scaling-stroke" d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path vectorEffect="non-scaling-stroke" d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="12" y1="5" x2="12" y2="19" />
      <line vectorEffect="non-scaling-stroke" x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="20 6 9 17 4 12" />
    </svg>
  ),
  edit: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path vectorEffect="non-scaling-stroke" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="3 6 5 6 21 6" />
      <path vectorEffect="non-scaling-stroke" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
};

const STATUS_STYLES = {
  Completed: { bg: '#D1FAE5', color: '#047857' },
  Pending: { bg: '#FEF3C7', color: '#B45309' }
};

const PRIORITY_STYLES = {
  High: { bg: '#FEE2E2', color: '#DC2626' },
  Medium: { bg: '#F1F5F9', color: '#64748B' },
  Low: { bg: '#E0F2FE', color: '#0369A1' }
};

const FollowUps = () => {
  const user = getCurrentUser();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [followups, setFollowups] = useState([
    { id: 1, customer: 'Greenfield Infra', contact: 'Deepa Rao', type: 'Call', scheduled: 'Today, 3:00 PM', status: 'Completed', priority: 'Medium', assigned: 'Divya Pillai', notes: 'Followed up regarding quote approval' },
    { id: 2, customer: 'Acme Industries', contact: 'Rohan Sharma', type: 'Call', scheduled: 'Today, 09:30 AM', status: 'Pending', priority: 'High', assigned: 'Arjun Sharma', notes: 'Call after product demo' },
    { id: 3, customer: 'Nova Retail', contact: 'Suresh Patel', type: 'Email', scheduled: 'Tomorrow, 11:00 AM', status: 'Pending', priority: 'Medium', assigned: 'Priya Nair', notes: 'Send revised commercial terms' }
  ]);

  const emptyForm = { customer_select: '', customer_name: '', contact: '', type: 'Call', scheduled: '', status: 'Pending', priority: 'Medium', assigned: 'Divya Pillai', notes: '' };
  const [form, setForm] = useState(emptyForm);

  const metrics = useMemo(() => {
    const total = followups.length;
    const pending = followups.filter(f => f.status === 'Pending').length;
    const completed = followups.filter(f => f.status === 'Completed').length;
    return { total, pending, completed };
  }, [followups]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleOpenEditModal = (f) => {
    setEditingItem(f);
    setForm({
      customer_select: f.customer,
      customer_name: f.customer,
      contact: f.contact,
      type: f.type,
      scheduled: f.scheduled,
      status: f.status,
      priority: f.priority,
      assigned: f.assigned,
      notes: f.notes || ''
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const customerDisplayName = form.customer_name || form.customer_select || 'Valued Customer';
    if (editingItem) {
      const updated = {
        ...editingItem,
        customer: customerDisplayName,
        contact: form.contact,
        type: form.type,
        scheduled: form.scheduled,
        status: form.status,
        priority: form.priority,
        assigned: form.assigned,
        notes: form.notes
      };
      setFollowups(followups.map(f => f.id === editingItem.id ? updated : f));
    } else {
      const newF = {
        id: Date.now(),
        customer: customerDisplayName,
        contact: form.contact,
        type: form.type,
        scheduled: form.scheduled || 'Today, 3:00 PM',
        status: form.status,
        priority: form.priority,
        assigned: form.assigned,
        notes: form.notes
      };
      setFollowups([newF, ...followups]);
    }
    setShowModal(false);
  };

  const handleMarkDone = (id) => {
    setFollowups(followups.map(f => f.id === id ? { ...f, status: 'Completed' } : f));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this follow-up record?')) return;
    setFollowups(followups.filter(f => f.id !== id));
  };

  // ── METRIC CARD — MATCHES MaterialsPage.js EXACTLY (white bg, outlined icon circle) ──
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
    <div className="theme-followups container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif'
    }}>

      <style>{`
        /* Premium Card Configurations — matches MaterialsPage.js */
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

        /* FOLLOW-UPS REGISTER TABLE — MATCHES MaterialsPage.js */
        .theme-followups table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-followups th {
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
        .theme-followups td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-followups tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-followups tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-followups tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-followups tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
          background-color: #ffffff !important;
        }

        /* ── ACTION BUTTON STRUCTURAL OVERRIDES — MATCHES MaterialsPage.js ── */
        .theme-followups td .btn-action-done {
          background-color: #ecfdf5 !important;
          color: #059669 !important;
          border: none !important;
          padding: 4px 10px !important;
          border-radius: 6px !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          margin-right: 6px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 4px !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .theme-followups td .btn-action-edit {
          background-color: #eff6ff !important;
          color: #3b82f6 !important;
          border: none !important;
          padding: 4px 12px !important;
          border-radius: 6px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          margin-right: 6px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: none !important;
          transform: none !important;
          height: auto !important;
          min-height: unset !important;
          line-height: normal !important;
        }
        .theme-followups td .btn-action-del {
          background-color: #fff1f2 !important;
          color: #f43f5e !important;
          border: none !important;
          padding: 4px 12px !important;
          border-radius: 6px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: none !important;
          transform: none !important;
          height: auto !important;
          min-height: unset !important;
          line-height: normal !important;
        }
        .theme-followups td .btn-action-done:hover,
        .theme-followups td .btn-action-edit:hover,
        .theme-followups td .btn-action-del:hover {
          filter: brightness(0.95) !important;
          transform: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* MATCHED MODERN NAVIGATION HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex flex-column justify-content-center">
          <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Customer Follow-ups</h3>
          <p style={{ color: '#94a3b8' }} className="small mb-0">Customer list cross-fetched from CRM active leads catalog</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={handleOpenCreateModal}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus} Schedule Follow-up
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Follow-ups', value: metrics.total, sub: 'All scheduled activity', icon: THIN_ICONS.clock, color: COLORS.indigo },
          { label: 'Pending', value: metrics.pending, sub: 'Requires action', icon: THIN_ICONS.alertTriangle, color: COLORS.rose },
          { label: 'Completed', value: metrics.completed, sub: 'Closed out', icon: THIN_ICONS.checkCircle, color: COLORS.emerald },
          { label: 'CRM Customers', value: '6', sub: 'Cross-linked contacts', icon: THIN_ICONS.users, color: COLORS.violet }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* FOLLOW-UPS TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0">
          <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>All Follow-ups</h5>
          <p className="small mb-0" style={{ color: '#94a3b8' }}>CRM customers cross-linked conversation roster</p>
        </div>

        <div className="table-responsive p-4 pt-2">
          <table>
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>CONTACT</th>
                <th>TYPE</th>
                <th>SCHEDULED</th>
                <th>STATUS</th>
                <th>PRIORITY</th>
                <th>ASSIGNED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {followups.map(f => {
                const statusStyle = STATUS_STYLES[f.status] || STATUS_STYLES.Pending;
                const priorityStyle = PRIORITY_STYLES[f.priority] || PRIORITY_STYLES.Medium;
                return (
                  <tr key={f.id}>
                    <td className="fw-bold" style={{ color: '#1e293b' }}>{f.customer}</td>
                    <td>{f.contact}</td>
                    <td>
                      <span className="badge bg-light text-primary border px-3">{f.type}</span>
                    </td>
                    <td className="small fw-semibold">{f.scheduled}</td>
                    <td>
                      <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                        ● {f.status}
                      </span>
                    </td>
                    <td>
                      <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: priorityStyle.bg, color: priorityStyle.color }}>
                        {f.priority}
                      </span>
                    </td>
                    <td className="fw-semibold">{f.assigned}</td>
                    <td>
                      {f.status === 'Pending' && (
                        <button className="btn-action-done" onClick={() => handleMarkDone(f.id)}>
                          {THIN_ICONS.check} Done
                        </button>
                      )}
                      <button className="btn-action-edit" onClick={() => handleOpenEditModal(f)}>
                        {THIN_ICONS.edit}
                      </button>
                      <button className="btn-action-del" onClick={() => handleDelete(f.id)}>
                        {THIN_ICONS.trash}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {followups.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center" style={{ color: '#94a3b8' }}>No follow-ups scheduled yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT FOLLOW-UP MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg p-3" style={{ borderLeft: `4px solid ${COLORS.primary}` }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  {editingItem ? '🔧 Modify Follow-up' : '✨ Schedule New Follow-up'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body py-3">
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>CUSTOMER *</label>
                      <select className="form-select rounded-3" value={form.customer_select} onChange={(e) => setForm({ ...form, customer_select: e.target.value, customer_name: e.target.value })}>
                        <option value="">— Select —</option>
                        <option value="Greenfield Infra">Greenfield Infra</option>
                        <option value="Acme Industries">Acme Industries</option>
                        <option value="Nova Retail">Nova Retail</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>CUSTOMER NAME</label>
                      <input type="text" className="form-control rounded-3" placeholder="Enter customer name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>CONTACT PERSON</label>
                      <input type="text" className="form-control rounded-3" placeholder="Contact name" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>TYPE</label>
                      <select className="form-select rounded-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                        <option value="Call">Call</option>
                        <option value="Email">Email</option>
                        <option value="Meeting">Meeting</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>SCHEDULED AT</label>
                      <input type="text" className="form-control rounded-3" placeholder="e.g. Today, 3:00 PM" value={form.scheduled} onChange={(e) => setForm({ ...form, scheduled: e.target.value })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>STATUS</label>
                      <select className="form-select rounded-3" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>PRIORITY</label>
                      <select className="form-select rounded-3" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>ASSIGNED TO</label>
                      <input type="text" className="form-control rounded-3" placeholder="Sales rep" value={form.assigned} onChange={(e) => setForm({ ...form, assigned: e.target.value })} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>NOTES</label>
                    <textarea className="form-control rounded-3" rows="3" placeholder="Notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 gap-2">
                  <button type="submit" className="btn rounded-3 px-4 py-2 border-0 text-white fw-bold hover-btn-lux" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)`, flex: 1 }}>
                    {editingItem ? 'Save Changes' : 'Schedule'}
                  </button>
                  <button type="button" className="btn rounded-3 px-4 py-2 bg-light border fw-bold text-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                    Cancel
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

export default FollowUps;