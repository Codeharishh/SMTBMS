// src/pages/SalesQuotationsPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchQuotations, createQuotation } from '../services/salesService';

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
  fileText: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline vectorEffect="non-scaling-stroke" points="14 2 14 8 20 8" />
    </svg>
  ),
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
  refresh: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 4 23 10 17 10" />
      <polyline vectorEffect="non-scaling-stroke" points="1 20 1 14 7 14" />
      <path vectorEffect="non-scaling-stroke" d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  // ── FIXED: matched exactly to MaterialTable.js edit icon (no vectorEffect / overflow override,
  // so the stroke scales down with the 24→15 viewBox the same way it does on the Materials page) ──
  edit: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

const STATUS_STYLES = {
  Draft: { bg: '#F1F5F9', color: '#64748B' },
  Pending: { bg: '#FEF3C7', color: '#B45309' },
  Accepted: { bg: '#D1FAE5', color: '#047857' },
  Delivered: { bg: '#D1FAE5', color: '#047857' },
  Expired: { bg: '#FEE2E2', color: '#DC2626' }
};

const SalesQuotationsPage = () => {
  const user = getCurrentUser();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);

  const defaultQuotes = [
    { id: 1, quote_id: 'QT-004', customer: 'Apex Constructions', items: 2, amount: 43000, status: 'Delivered', date: '2026-05-28', expiry: '2026-06-27' },
    { id: 2, quote_id: 'QT-005', customer: 'Greenfield Infra', items: 3, amount: 184000, status: 'Accepted', date: '2026-06-01', expiry: '2026-06-30' },
    { id: 3, quote_id: 'QT-006', customer: 'Metro Projects', items: 1, amount: 65000, status: 'Pending', date: '2026-06-05', expiry: '2026-07-05' }
  ];

  const emptyForm = { customer: '', items: 1, amount: 45000, status: 'Draft', date: '', expiry: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const data = await fetchQuotations().catch(() => defaultQuotes);
      const list = data && data.length ? data.map((q, idx) => ({
        id: q.id || q._id || idx + 1,
        quote_id: q.quote_id || q.order_code || `QT-00${idx + 4}`,
        customer: q.customer || q.customer_name || 'Valued Client',
        items: q.items ? (Array.isArray(q.items) ? q.items.length : q.items) : 1,
        amount: Number(q.amount) || Number(q.total_amount) || 45000,
        status: q.status || 'Draft',
        date: q.date || '2026-05-28',
        expiry: q.expiry || '2026-06-27'
      })) : defaultQuotes;
      setQuotations(list);
    } catch (err) {
      setQuotations(defaultQuotes);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const total = quotations.length;
    const accepted = quotations.filter(q => q.status === 'Accepted' || q.status === 'Delivered').length;
    const pending = quotations.filter(q => q.status === 'Pending' || q.status === 'Sent' || q.status === 'Draft').length;
    const expired = quotations.filter(q => q.status === 'Expired').length;
    return { total, accepted, pending, expired };
  }, [quotations]);

  const filtered = useMemo(() => {
    return quotations.filter(q => {
      const query = searchTerm.toLowerCase();
      return (q.customer || '').toLowerCase().includes(query) || (q.quote_id || '').toLowerCase().includes(query);
    });
  }, [quotations, searchTerm]);

  const handleOpenCreateModal = () => {
    setEditingQuote(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleOpenEditModal = (q) => {
    setEditingQuote(q);
    setForm({
      customer: q.customer,
      items: q.items,
      amount: q.amount,
      status: q.status,
      date: q.date || '',
      expiry: q.expiry || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingQuote) {
      const updated = { ...editingQuote, ...form };
      setQuotations(quotations.map(q => q.id === editingQuote.id ? updated : q));
    } else {
      const newQuote = {
        id: Date.now(),
        quote_id: `QT-00${quotations.length + 4}`,
        ...form
      };
      try {
        await createQuotation(newQuote).catch(() => { });
      } catch (err) { }
      setQuotations([newQuote, ...quotations]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this quotation record?')) return;
    setQuotations(quotations.filter(q => q.id !== id));
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
    <div className="theme-quotations container-fluid px-4 py-4" style={{
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

        /* QUOTATIONS REGISTER TABLE — MATCHES MaterialsPage.js */
        .theme-quotations table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-quotations th {
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
        .theme-quotations td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-quotations tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-quotations tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-quotations tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-quotations tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
          background-color: #ffffff !important;
        }

        /* ── ACTION BUTTON STRUCTURAL OVERRIDES — MATCHES MaterialsPage.js ── */
        .theme-quotations td .btn-action-edit {
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
        .theme-quotations td .btn-action-del {
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
        .theme-quotations td .btn-action-edit:hover,
        .theme-quotations td .btn-action-del:hover {
          filter: brightness(0.95) !important;
          transform: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* MATCHED MODERN NAVIGATION HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.fileText}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Quotations</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Create, manage, and dispatch commercial sales quotes</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn px-3 py-2 rounded-3 fw-semibold shadow-sm d-flex align-items-center gap-2 bg-white border"
            onClick={loadQuotations}
            style={{ borderColor: '#e5e0f5', color: '#475569' }}
          >
            {THIN_ICONS.refresh} Refresh
          </button>
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={handleOpenCreateModal}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus} New Quotation
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Quotations', value: metrics.total, sub: 'All quote records', icon: THIN_ICONS.fileText, color: COLORS.indigo },
          { label: 'Accepted', value: metrics.accepted, sub: 'Won or delivered', icon: THIN_ICONS.checkCircle, color: COLORS.emerald },
          { label: 'Pending', value: metrics.pending, sub: 'Draft or awaiting reply', icon: THIN_ICONS.clock, color: COLORS.amber },
          { label: 'Expired', value: metrics.expired, sub: 'Needs follow-up', icon: THIN_ICONS.xCircle, color: COLORS.rose }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* QUOTATIONS TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="position-relative" style={{ minWidth: '280px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
            <input
              type="text"
              className="form-control rounded-pill ps-5 small"
              placeholder="Search by customer / ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
            Synchronizing live quotation registries...
          </div>
        ) : (
          <div className="table-responsive p-4 pt-2">
            <table>
              <thead>
                <tr>
                  <th>QUOTE ID</th>
                  <th>CUSTOMER</th>
                  <th>ITEMS</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th>EXPIRY</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(q => {
                  const statusStyle = STATUS_STYLES[q.status] || STATUS_STYLES.Draft;
                  return (
                    <tr key={q.id}>
                      <td className="fw-bold" style={{ color: COLORS.indigo }}>{q.quote_id}</td>
                      <td className="fw-bold" style={{ color: '#1e293b' }}>{q.customer}</td>
                      <td>{q.items} items</td>
                      <td className="fw-bold" style={{ color: COLORS.emerald }}>₹{(Number(q.amount) || 0).toLocaleString()}</td>
                      <td>
                        <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                          {q.status}
                        </span>
                      </td>
                      <td>{q.date}</td>
                      <td>{q.expiry}</td>
                      <td>
                        <button className="btn-action-edit" onClick={() => handleOpenEditModal(q)}>
                          {THIN_ICONS.edit}
                        </button>
                        <button className="btn-action-del" onClick={() => handleDelete(q.id)}>
                          {THIN_ICONS.trash}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center" style={{ color: '#94a3b8' }}>No quotations match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT QUOTATION MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg p-3" style={{ borderLeft: `4px solid ${COLORS.primary}` }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  {editingQuote ? (
                    <><span style={{ color: COLORS.indigo }}>{THIN_ICONS.edit}</span> Modify Quotation</>
                  ) : (
                    <><span style={{ color: COLORS.indigo }}>{THIN_ICONS.fileText}</span> Register New Quotation</>
                  )}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body py-3">
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>QUOTE ID</label>
                      <input type="text" className="form-control rounded-3 bg-light" value={editingQuote ? editingQuote.quote_id : 'Auto-generated'} disabled />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>CUSTOMER *</label>
                      <input type="text" className="form-control rounded-3" placeholder="Customer name" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>ITEMS COUNT</label>
                      <input type="number" className="form-control rounded-3" min={1} value={form.items} onChange={(e) => setForm({ ...form, items: Number(e.target.value) })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>AMOUNT</label>
                      <input type="number" className="form-control rounded-3" placeholder="e.g. 45000" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>STATUS</label>
                      <select className="form-select rounded-3" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="Draft">Draft</option>
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>QUOTE DATE</label>
                      <input type="date" className="form-control rounded-3" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>EXPIRY DATE</label>
                      <input type="date" className="form-control rounded-3" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 gap-2">
                  <button type="submit" className="btn rounded-3 px-4 py-2 border-0 text-white fw-bold hover-btn-lux" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)`, flex: 1 }}>
                    {editingQuote ? 'Save Changes' : 'Create Quotation'}
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

export default SalesQuotationsPage;