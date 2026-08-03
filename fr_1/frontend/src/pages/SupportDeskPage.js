// src/pages/SupportDeskPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from '../utils/authHelpers';
import api from '../services/api';

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
  messageSquare: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  alertCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="8" x2="12" y2="12" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path vectorEffect="non-scaling-stroke" d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="20 6 9 17 4 12" />
    </svg>
  )
};

const STATUS_STYLES = {
  Open: { bg: '#E0F2FE', color: '#0369A1' },
  'In Progress': { bg: '#E0F2FE', color: '#0369A1' },
  Escalated: { bg: '#F5F0FF', color: '#8B5CF6' },
  Resolved: { bg: '#D1FAE5', color: '#047857' }
};

const PRIORITY_STYLES = {
  High: { bg: '#FEE2E2', color: '#DC2626' },
  Medium: { bg: '#FEF3C7', color: '#B45309' },
  Low: { bg: '#F1F5F9', color: '#64748B' }
};

const SupportDeskPage = () => {
  const user = getCurrentUser();

  const defaultTickets = [
    { id: 11, ticket_code: 'TKT-011', customer: 'Greenfield Infra', subject: 'SO-2010 cancellation refund qu...', type: 'Fulfillment', priority: 'Medium', status: 'Resolved', assigned_to: 'Finance', sla: '48h', created_at: '4 Jun 2026' },
    { id: 9, ticket_code: 'TKT-009', customer: 'Metro Projects', subject: 'MS Angle batch quality not as spec', type: 'Quality', priority: 'High', status: 'Escalated', assigned_to: 'QA Team', sla: '12h', created_at: '2 Jun 2026' },
    { id: 8, ticket_code: 'TKT-008', customer: 'Horizon Housing', subject: 'Delayed dispatch notification inquiry', type: 'Fulfillment', priority: 'Medium', status: 'In Progress', assigned_to: 'Support', sla: '24h', created_at: '1 Jun 2026' },
    { id: 7, ticket_code: 'TKT-007', customer: 'TechBuild Co.', subject: 'Invoice billing mismatch for PO-88', type: 'Billing', priority: 'High', status: 'Open', assigned_to: 'Finance', sla: '8h', created_at: '29 May 2026' },
    { id: 6, ticket_code: 'TKT-006', customer: 'Apex Constructions', subject: 'Portal login credential reset', type: 'General', priority: 'Low', status: 'Resolved', assigned_to: 'Support', sla: '72h', created_at: '25 May 2026' }
  ];

  const [tickets, setTickets] = useState(defaultTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const [tktForm, setTktForm] = useState({
    ticket_code: 'TKT-012',
    customer: '',
    subject: '',
    priority: 'Medium',
    type: 'General',
    assigned_to: 'Support'
  });

  const metrics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const escalated = tickets.filter(t => t.status === 'Escalated').length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    return { total, open, escalated, resolved };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const q = searchTerm.toLowerCase();
      const matchSearch = (t.customer || '').toLowerCase().includes(q) || (t.subject || '').toLowerCase().includes(q) || (t.ticket_code || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  const handleAddTicket = (e) => {
    e.preventDefault();
    const newTkt = {
      id: Date.now(),
      created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Open',
      sla: '24h',
      ...tktForm
    };
    setTickets([newTkt, ...tickets]);
    setShowModal(false);
    setTktForm({
      ticket_code: `TKT-0${Math.floor(12 + Math.random() * 80)}`,
      customer: '',
      subject: '',
      priority: 'Medium',
      type: 'General',
      assigned_to: 'Support'
    });
  };

  const handleToggleResolve = (id) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: t.status === 'Resolved' ? 'In Progress' : 'Resolved' } : t));
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
    <div className="theme-support container-fluid px-4 py-4" style={{
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
        .hover-btn-lux { transition: all 0.2s ease !important; }
        .hover-btn-lux:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(255, 122, 69, 0.28) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 6px;
        }

        /* TICKET REGISTER TABLE — MATCHES MaterialsPage.js */
        .theme-support table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-support th {
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
        .theme-support td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-support tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-support tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-support tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-support tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
          background-color: #ffffff !important;
        }

        /* ── ACTION BUTTON STRUCTURAL OVERRIDES — MATCHES MaterialsPage.js ── */
        .theme-support td .btn-action-resolve {
          background-color: ${COLORS.emerald}22 !important;
          color: #059669 !important;
          border: none !important;
          padding: 5px 14px !important;
          border-radius: 20px !important;
          font-size: 0.78rem !important;
          font-weight: 700 !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          box-shadow: none !important;
        }
        .theme-support td .btn-action-done {
          background-color: #ecfdf5 !important;
          color: #047857 !important;
          border: none !important;
          padding: 5px 14px !important;
          border-radius: 20px !important;
          font-size: 0.78rem !important;
          font-weight: 700 !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          box-shadow: none !important;
        }
        .theme-support td .btn-action-resolve:hover,
        .theme-support td .btn-action-done:hover {
          filter: brightness(0.95) !important;
        }

        .filter-pill {
          transition: all 0.2s ease !important;
          border: 1px solid #e5e0f5 !important;
        }
      `}</style>

      {/* MATCHED HEADER — icon + title left, + New Ticket button top-right (like OrderManagementPage) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.messageSquare}
          </div>
          <div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Support & Service Desk</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Monitor customer tickets, resolutions, and service performance</p>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-end">
          <button
            className="btn px-4 py-2 rounded-3 fw-bold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus}
            <span> New Ticket</span>
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Tickets', value: metrics.total, sub: '↑ 5% vs last month', icon: THIN_ICONS.messageSquare, color: COLORS.indigo },
          { label: 'Open', value: metrics.open, sub: '↓ 12% vs last month', icon: THIN_ICONS.alertCircle, color: COLORS.rose },
          { label: 'Escalated', value: metrics.escalated, sub: '↓ 8% vs last month', icon: THIN_ICONS.bell, color: COLORS.violet },
          { label: 'Resolved', value: metrics.resolved, sub: '↑ 20% vs last month', icon: THIN_ICONS.checkCircle, color: COLORS.emerald }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* TICKET REGISTER TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Support Ticket Register</h5>
            <p className="small mb-0" style={{ color: '#94a3b8' }}>Track, assign and resolve customer issues · SLA monitoring</p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="position-relative" style={{ minWidth: '240px' }}>
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 small"
                placeholder="Search ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
              />
            </div>
            {['All', 'Open', 'In Progress', 'Escalated', 'Resolved'].map(st => (
              <button
                key={st}
                className={`btn btn-sm rounded-pill px-3 fw-bold ${statusFilter === st ? 'text-white' : 'bg-white text-dark'}`}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : undefined,
                  border: statusFilter === st ? '1px solid transparent' : '1px solid #cbd5e1'
                }}
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
                <th>TICKET ID</th>
                <th>CUSTOMER</th>
                <th>SUBJECT</th>
                <th>TYPE</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>ASSIGNED TO</th>
                <th>SLA</th>
                <th>CREATED</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(t => {
                const statusStyle = STATUS_STYLES[t.status] || STATUS_STYLES.Open;
                const priorityStyle = PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.Medium;
                return (
                  <tr key={t.id}>
                    <td className="fw-bold" style={{ color: COLORS.indigo }}>{t.ticket_code}</td>
                    <td className="fw-bold" style={{ color: '#1e293b' }}>{t.customer}</td>
                    <td className="small">{t.subject}</td>
                    <td>
                      <span className="badge rounded-pill px-3" style={{ background: `${COLORS.indigo}14`, color: COLORS.indigo }}>
                        {t.type}
                      </span>
                    </td>
                    <td>
                      <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: priorityStyle.bg, color: priorityStyle.color }}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                        {t.status}
                      </span>
                    </td>
                    <td className="fw-semibold">{t.assigned_to}</td>
                    <td className="fw-bold" style={{ color: t.priority === 'High' ? COLORS.alert : '#1e293b' }}>{t.sla}</td>
                    <td>{t.created_at}</td>
                    <td>
                      <button
                        className={t.status === 'Resolved' ? 'btn-action-done' : 'btn-action-resolve'}
                        onClick={() => handleToggleResolve(t.id)}
                      >
                        {t.status === 'Resolved' ? <>{THIN_ICONS.check} Done</> : 'Resolve'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center" style={{ color: '#94a3b8' }}>No tickets match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE SUPPORT TICKET MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg" style={{ borderLeft: `4px solid ${COLORS.primary}` }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  🎫 Create Support Ticket
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddTicket}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      TICKET ID (AUTO-GENERATED — YOU CAN EDIT IT)
                    </label>
                    <input
                      type="text"
                      className="form-control rounded-3 fw-bold"
                      value={tktForm.ticket_code}
                      onChange={(e) => setTktForm({ ...tktForm, ticket_code: e.target.value })}
                      style={{ background: '#F0F7FF', border: '1px solid #CCE5FF', color: COLORS.indigo }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>CUSTOMER NAME *</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="e.g. ABC Corporation"
                      value={tktForm.customer}
                      onChange={(e) => setTktForm({ ...tktForm, customer: e.target.value })}
                      required
                      style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>SUBJECT *</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="Brief description of the issue"
                      value={tktForm.subject}
                      onChange={(e) => setTktForm({ ...tktForm, subject: e.target.value })}
                      required
                      style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>PRIORITY</label>
                      <select
                        className="form-select rounded-3"
                        value={tktForm.priority}
                        onChange={(e) => setTktForm({ ...tktForm, priority: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>TYPE</label>
                      <select
                        className="form-select rounded-3"
                        value={tktForm.type}
                        onChange={(e) => setTktForm({ ...tktForm, type: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      >
                        <option value="General">General</option>
                        <option value="Fulfillment">Fulfillment</option>
                        <option value="Quality">Quality</option>
                        <option value="Billing">Billing</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>ASSIGN TO</label>
                    <select
                      className="form-select rounded-3"
                      value={tktForm.assigned_to}
                      onChange={(e) => setTktForm({ ...tktForm, assigned_to: e.target.value })}
                      style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                    >
                      <option value="Support">Support</option>
                      <option value="Finance">Finance</option>
                      <option value="QA Team">QA Team</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer border-0 d-flex gap-2">
                  <button type="submit" className="btn flex-grow-1 rounded-3 py-2 border-0 text-white fw-bold shadow-sm hover-btn-lux" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                    Create Ticket
                  </button>
                  <button type="button" className="btn flex-grow-1 rounded-3 py-2 bg-light border fw-bold text-secondary" onClick={() => setShowModal(false)}>
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

export default SupportDeskPage;