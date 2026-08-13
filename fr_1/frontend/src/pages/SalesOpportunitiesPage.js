// src/pages/SalesOpportunitiesPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchLeads, createLead, updateLead, deleteLead } from '../services/leadService';

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
  briefcase: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path vectorEffect="non-scaling-stroke" d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  trendingUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline vectorEffect="non-scaling-stroke" points="17 6 23 6 23 12" />
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

const SalesOpportunitiesPage = () => {
  const user = getCurrentUser();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);

  const defaultOpportunities = [
    { id: 1, code: 'OPP-001', company: 'InfraCore Solutions', contact_person: 'Vivek Bhat', stage: 'Closed Won', deal_value: 95000, win_probability: 50, close_date: '', owner: 'Sales Team' },
    { id: 2, code: 'OPP-002', company: 'Apex Constructions', contact_person: 'Rohan Sharma', stage: 'Qualified', deal_value: 43000, win_probability: 50, close_date: '', owner: 'Sales Team' },
    { id: 3, code: 'OPP-003', company: 'Greenfield Infra', contact_person: 'Deepa Rao', stage: 'Proposal / Negotiation', deal_value: 310000, win_probability: 60, close_date: '', owner: 'Sales Team' },
    { id: 4, code: 'OPP-004', company: 'Metro Projects', contact_person: 'Kavya Menon', stage: 'New / Contacted', deal_value: 200000, win_probability: 40, close_date: '', owner: 'Sales Team' }
  ];

  const emptyForm = { company: '', deal_value: 50000, stage: 'New / Contacted', win_probability: 50, close_date: '', owner: 'Sales Team' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads().catch(() => defaultOpportunities);
      const list = data && data.length ? data.map((item, index) => ({
        id: item.id || item._id || index + 1,
        code: item.code || `OPP-00${index + 1}`,
        company: item.company || item.name || 'Prospect Client',
        contact_person: item.contact_person || item.contact || 'Contact Person',
        stage: item.stage || item.status || 'New / Contacted',
        deal_value: Number(item.deal_value) || Number(item.est_value) || 50000,
        win_probability: item.win_probability || 50,
        close_date: item.close_date || '',
        owner: item.owner || item.assigned_to || 'Sales Team'
      })) : defaultOpportunities;
      setOpportunities(list);
    } catch (err) {
      setOpportunities(defaultOpportunities);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const total = opportunities.length;
    const open = opportunities.filter(o => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost').length;
    const negotiation = opportunities.filter(o => o.stage.includes('Negotiation')).length;
    const won = opportunities.filter(o => o.stage === 'Closed Won').length;
    return { total, open, negotiation, won };
  }, [opportunities]);

  const filtered = useMemo(() => {
    return opportunities.filter(o => {
      const q = searchTerm.toLowerCase();
      return (o.company || '').toLowerCase().includes(q) || (o.code || '').toLowerCase().includes(q);
    });
  }, [opportunities, searchTerm]);

  const handleOpenCreateModal = () => {
    setEditingOpp(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleOpenEditModal = (opp) => {
    setEditingOpp(opp);
    setForm({
      company: opp.company,
      deal_value: opp.deal_value,
      stage: opp.stage,
      win_probability: opp.win_probability || 50,
      close_date: opp.close_date || '',
      owner: opp.owner || 'Sales Team'
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingOpp) {
      // EDIT EXISTING
      const updatedOpp = {
        ...editingOpp,
        ...form
      };
      try {
        await updateLead(editingOpp.id, updatedOpp).catch(() => { });
      } catch (err) { }
      setOpportunities(opportunities.map(o => o.id === editingOpp.id ? updatedOpp : o));
    } else {
      // CREATE NEW
      const newOpp = {
        id: Date.now(),
        code: `OPP-00${opportunities.length + 1}`,
        contact_person: 'Sales Contact',
        ...form
      };
      try {
        await createLead(newOpp).catch(() => { });
      } catch (err) { }
      setOpportunities([newOpp, ...opportunities]);
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this opportunity record?')) return;
    try {
      await deleteLead(id).catch(() => { });
    } catch (err) { }
    setOpportunities(opportunities.filter(o => o.id !== id));
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
    <div className="theme-opportunities container-fluid px-4 py-4" style={{
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

        /* DEAL ROW — MATCHES REGISTER ROW STYLE FROM MaterialsPage.js */
        .theme-opportunities .deal-row {
          background-color: #ffffff !important;
          border: 1px solid rgba(165, 175, 200, 0.14) !important;
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-opportunities .deal-row:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }

        /* ── ACTION BUTTON STRUCTURAL OVERRIDES — MATCHES MaterialsPage.js ── */
        .theme-opportunities .btn-action-edit {
          background-color: #eff6ff !important;
          color: #3b82f6 !important;
          border: none !important;
          padding: 6px 10px !important;
          border-radius: 8px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .theme-opportunities .btn-action-del {
          background-color: #fff1f2 !important;
          color: #f43f5e !important;
          border: none !important;
          padding: 6px 10px !important;
          border-radius: 8px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .theme-opportunities .btn-action-edit:hover,
        .theme-opportunities .btn-action-del:hover {
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
            {THIN_ICONS.briefcase}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Opportunities</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Cross-fetched from CRM active deal pipeline roster</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn px-3 py-2 rounded-3 fw-semibold shadow-sm d-flex align-items-center gap-2 bg-white border"
            onClick={loadOpportunities}
            style={{ borderColor: '#e5e0f5', color: '#475569' }}
          >
            {THIN_ICONS.refresh} Refresh
          </button>
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={handleOpenCreateModal}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus} New Opportunity
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Open Pipeline', value: metrics.open, sub: 'Active, uncommitted deals', icon: THIN_ICONS.briefcase, color: COLORS.indigo },
          { label: 'In Negotiation', value: metrics.negotiation, sub: 'Deals nearing close', icon: THIN_ICONS.trendingUp, color: COLORS.sky },
          { label: 'Closed Won', value: metrics.won, sub: 'Converted this cycle', icon: THIN_ICONS.checkCircle, color: COLORS.emerald },
          { label: 'Total Records', value: metrics.total, sub: 'All pipeline entries', icon: THIN_ICONS.users, color: COLORS.violet }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* PIPELINE & FUNNEL LAYOUT */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
            <div className="p-4 pb-0">
              <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>Active Pipeline Deals</h5>

              <div className="position-relative mb-3">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
                <input
                  type="text"
                  className="form-control rounded-pill ps-5 small"
                  placeholder="Search deals, company or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
                />
              </div>
            </div>

            <div className="px-4 pb-4">
              {loading ? (
                <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
                  <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
                  Synchronizing live opportunity pipeline...
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {filtered.map(opp => (
                    <div key={opp.id} className="deal-row p-3 rounded-4 d-flex align-items-center justify-content-between">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-light text-primary border" style={{ fontSize: '0.7rem' }}>{opp.code}</span>
                          <span className={`badge rounded-pill px-3 py-1 fw-bold ${opp.stage === 'Closed Won' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`}>
                            {opp.stage}
                          </span>
                        </div>
                        <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{opp.company}</h6>
                        <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{opp.contact_person} · {opp.owner}</small>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <h5 className="fw-extrabold mb-0" style={{ color: COLORS.emerald }}>₹{(Number(opp.deal_value) || 0).toLocaleString()}</h5>
                        {/* ACTIONS: EDIT & DELETE */}
                        <div className="d-flex align-items-center gap-1">
                          <button className="btn-action-edit" onClick={() => handleOpenEditModal(opp)}>
                            {THIN_ICONS.edit}
                          </button>
                          <button className="btn-action-del" onClick={() => handleDelete(opp.id)}>
                            {THIN_ICONS.trash}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="p-4 text-center" style={{ color: '#94a3b8' }}>No opportunities match your search.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDE PIPELINE FUNNEL */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 hover-premium-card h-100" style={{ borderRadius: '22px' }}>
            <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>Pipeline Funnel</h5>

            {[
              { name: 'New / Contacted', count: '1 deals', pct: 90, color: COLORS.indigo },
              { name: 'Qualified', count: '1 deals', pct: 65, color: COLORS.sky },
              { name: 'Proposal / Negotiation', count: '1 deals', pct: 40, color: COLORS.violet },
              { name: 'Closed Won', count: '2 deals', pct: 25, color: COLORS.emerald }
            ].map((f, i) => (
              <div key={i} className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.82rem' }}>
                  <span className="fw-bold text-dark">{f.name}</span>
                  <span className="fw-bold" style={{ color: '#94a3b8' }}>{f.count}</span>
                </div>
                <div className="progress" style={{ height: '7px', borderRadius: '10px', background: '#F1F5F9' }}>
                  <div className="progress-bar" role="progressbar" style={{ width: `${f.pct}%`, background: f.color, borderRadius: '10px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE / EDIT OPPORTUNITY MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg p-3" style={{ borderLeft: `4px solid ${COLORS.primary}` }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  {editingOpp ? (
                    <><span style={{ color: COLORS.indigo }}>{THIN_ICONS.edit}</span> Modify Opportunity</>
                  ) : (
                    <><span style={{ color: COLORS.indigo }}>{THIN_ICONS.briefcase}</span> Register New Opportunity</>
                  )}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body py-3">
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>NAME *</label>
                      <input type="text" className="form-control rounded-3" placeholder="e.g. ABC Corp — Steel Supply" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>DEAL VALUE</label>
                      <input type="number" className="form-control rounded-3" placeholder="e.g. 95000" value={form.deal_value} onChange={(e) => setForm({ ...form, deal_value: Number(e.target.value) })} required />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>STAGE</label>
                      <select className="form-select rounded-3" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                        <option value="New / Contacted">New</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Proposal / Negotiation">Proposal / Negotiation</option>
                        <option value="Closed Won">Closed Won</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>WIN PROBABILITY (%)</label>
                      <input type="number" className="form-control rounded-3" placeholder="50" value={form.win_probability} onChange={(e) => setForm({ ...form, win_probability: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>CLOSE DATE</label>
                      <input type="date" className="form-control rounded-3" value={form.close_date} onChange={(e) => setForm({ ...form, close_date: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>OWNER</label>
                      <input type="text" className="form-control rounded-3" placeholder="Sales rep name" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 gap-2">
                  <button type="submit" className="btn rounded-3 px-4 py-2 border-0 text-white fw-bold hover-btn-lux" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)`, flex: 1 }}>
                    {editingOpp ? 'Save Changes' : 'Create'}
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

export default SalesOpportunitiesPage;