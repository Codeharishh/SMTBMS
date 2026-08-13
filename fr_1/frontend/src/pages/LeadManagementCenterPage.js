// src/pages/LeadManagementCenterPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from '../utils/authHelpers';
import api from '../services/api';

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
  target: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="6" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="2" />
    </svg>
  ),
  zap: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polygon vectorEffect="non-scaling-stroke" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  message: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  rupee: (
    <span style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1 }}>₹</span>
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

const LeadManagementCenterPage = () => {
  const user = getCurrentUser();
  const canManage = ['Admin', 'Manager', 'Sales'].includes(user?.role);

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const [leadForm, setLeadForm] = useState({
    company: '',
    contact_name: '',
    contact_email: '',
    source: 'LinkedIn',
    stage: 'New',
    score: 85,
    est_value: 95000,
    assigned_to: 'Sales Team'
  });

  const defaultLeads = [
    { id: 7, lead_code: 'LED-007', company: 'InfraCore Solutions', contact_name: 'Vivek Bhat', email: 'vivek@infracore.in', source: 'LinkedIn', stage: 'Closed Won', score: 68, est_value: 95000, assigned_to: 'Sales Team', created_at: '3 Jun 2026' },
    { id: 8, lead_code: 'LED-008', company: 'UrbanVista Realty', contact_name: 'Anjali Mehta', email: 'anjali@urbanvista.co', source: 'Cold Call', stage: 'Proposal Sent', score: 87, est_value: 265000, assigned_to: 'Manager', created_at: '30 May 2026' },
    { id: 9, lead_code: 'LED-009', company: 'Nexus Logistics Hub', contact_name: 'Karan Singhania', email: 'karan@nexuslogistics.com', source: 'Website', stage: 'Qualified', score: 92, est_value: 410000, assigned_to: 'Sales Team', created_at: '28 May 2026' },
    { id: 10, lead_code: 'LED-010', company: 'Quantum Tech Solutions', contact_name: 'Pooja Hegde', email: 'pooja@quantumtech.io', source: 'Referral', stage: 'Negotiation', score: 81, est_value: 327000, assigned_to: 'Admin', created_at: '25 May 2026' }
  ];

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads');
      const data = res?.data || [];
      setLeads(data);
    } catch (err) {
      console.error('Error loading leads from database:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const total = leads.length;
    const hotLeads = leads.filter(l => (l.score || 85) >= 80).length;
    const inNegotiation = leads.filter(l => (l.stage || l.status) === 'Negotiation' || (l.stage || l.status) === 'Proposal Sent').length;
    const pipelineVal = leads.reduce((acc, curr) => acc + (Number(curr.value) || Number(curr.est_value) || 0), 0);
    return { total, hotLeads, inNegotiation, pipelineVal };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const q = searchTerm.toLowerCase();
      const compMatch = (l.company || '').toLowerCase().includes(q);
      const contactMatch = (l.contact_name || l.name || '').toLowerCase().includes(q);
      const codeMatch = (l.lead_code || `LED-00${l.id}`).toLowerCase().includes(q);
      const stage = l.stage || l.status || 'New';
      const stageMatch = stageFilter === 'All' || stage === stageFilter;
      return (compMatch || contactMatch || codeMatch) && stageMatch;
    });
  }, [leads, searchTerm, stageFilter]);

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        contact_name: leadForm.contact_name || leadForm.company,
        company: leadForm.company,
        email: leadForm.contact_email,
        phone: leadForm.phone,
        source: leadForm.source,
        stage: leadForm.stage,
        value: leadForm.est_value,
        assigned_to: leadForm.assigned_to
      };
      await api.post('/leads', payload);
      await loadLeads();
      alert('Lead added to database successfully!');
      setShowModal(false);
    } catch (err) {
      console.error('Add lead error:', err);
      alert('Failed to register lead in database.');
    }
  };

  const handleAdvanceStage = async (id, currentLead) => {
    try {
      const nextStage = (currentLead.stage || currentLead.status) === 'Proposal Sent' ? 'Closed Won' : 'Proposal Sent';
      await api.put(`/leads/${id}`, {
        contact_name: currentLead.contact_name || currentLead.name || currentLead.company,
        company: currentLead.company,
        email: currentLead.email,
        phone: currentLead.phone,
        stage: nextStage,
        source: currentLead.source,
        value: currentLead.value || currentLead.est_value,
        assigned_to: currentLead.assigned_to
      });
      await loadLeads();
    } catch (err) {
      console.error('Update lead stage error:', err);
    }
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
    <div className="theme-leads container-fluid px-4 py-4" style={{
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

        /* FLOATING-ROW LEADS TABLE */
        .theme-leads table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-leads th {
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
        .theme-leads td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-leads tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-leads tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-leads tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-leads tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center fw-bold text-white rounded-3 shadow-sm"
            style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #5B8DEF 0%, #4FC3F7 100%)', borderRadius: '14px' }}>
            {THIN_ICONS.target}
          </div>
          <div>
            <h3 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
              Lead Management Center
              <span className="badge rounded-pill bg-light text-primary border px-3" style={{ fontSize: '0.65rem' }}>LEADS</span>
            </h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Capture, qualify, and convert prospects into valuable customers.</p>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-end">
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus}
            <span> Add Lead</span>
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Leads', value: metrics.total, sub: '↑ 22% vs last month', icon: THIN_ICONS.target, color: COLORS.indigo },
          { label: 'Hot Leads (≥80)', value: metrics.hotLeads, sub: '↑ 15% vs last month', icon: THIN_ICONS.zap, color: COLORS.alert },
          { label: 'In Negotiation', value: metrics.inNegotiation, sub: '↑ 7% vs last month', icon: THIN_ICONS.message, color: COLORS.violet },
          { label: 'Pipeline Value', value: `₹${(metrics.pipelineVal / 1000).toFixed(0)}K`, sub: '↑ 31% vs last month', icon: THIN_ICONS.rupee, color: COLORS.emerald }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* LEAD REGISTER TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Lead Register</h5>
            <p className="small text-muted mb-0">Track and qualify incoming leads</p>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="position-relative" style={{ minWidth: '260px' }}>
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 small"
                placeholder="Search lead..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
              />
            </div>
            <select
              className="form-select rounded-pill px-3 small fw-bold"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              style={{ backgroundColor: '#FAF8FF', border: '1px solid #e5e0f5', width: '130px' }}
            >
              <option value="All">All Stages</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
            </select>
          </div>
        </div>

        <div className="table-responsive p-4 pt-2">
          <table>
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Stage</th>
                <th>Score</th>
                <th>Est. Value</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(l => {
                const currentStage = l.stage || l.status || 'New';
                return (
                  <tr key={l.id}>
                    <td className="fw-bold" style={{ color: COLORS.indigo }}>{l.lead_code || `LED-00${l.id}`}</td>
                    <td className="fw-bold" style={{ color: '#1e293b' }}>{l.company || l.contact_name || l.name || 'Company'}</td>
                    <td>
                      <div><span className="fw-semibold">{l.contact_name || l.name || 'Contact'}</span></div>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>{l.email || '--'}</small>
                    </td>
                    <td>
                      <span className="badge rounded-pill bg-primary-subtle text-primary px-3">
                        {l.source || 'CRM Terminal'}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`form-select form-select-sm rounded-pill px-3 fw-bold ${currentStage === 'Closed Won' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}
                        value={currentStage}
                        onChange={async (e) => {
                          const newStage = e.target.value;
                          try {
                            await api.put(`/leads/${l.id}`, {
                              contact_name: l.contact_name || l.name || l.company,
                              company: l.company,
                              email: l.email,
                              phone: l.phone,
                              stage: newStage,
                              source: l.source,
                              value: l.value || l.est_value,
                              assigned_to: l.assigned_to
                            });
                            await loadLeads();
                          } catch (err) { }
                        }}
                        style={{ width: '140px', border: '1px solid rgba(0,0,0,0.1)' }}
                      >
                        <option value="New">New</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed Won">Closed Won</option>
                      </select>
                    </td>
                    <td>
                      <span className="badge rounded-3 bg-warning-subtle text-warning fw-bold px-2 py-1">
                        {l.score || 85}
                      </span>
                    </td>
                    <td className="fw-bold text-success">₹{(Number(l.value) || Number(l.est_value) || 0).toLocaleString()}</td>
                    <td className="fw-semibold">{l.assigned_to || 'Sales Team'}</td>
                    <td>{l.created_at ? new Date(l.created_at).toLocaleDateString() : 'Today'}</td>
                    <td>
                      {currentStage === 'Closed Won' ? (
                        <button className="btn btn-sm bg-success-subtle text-success rounded-pill px-3 fw-bold border-0" disabled>✓ Won</button>
                      ) : (
                        <button className="btn btn-sm btn-primary rounded-pill px-3 fw-bold shadow-sm" onClick={() => handleAdvanceStage(l.id, l)}>Advance</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD LEAD MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  <span style={{ color: COLORS.indigo }}>{THIN_ICONS.target}</span> Add New Lead
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddLead}>
                <div className="modal-body py-3">
                  {/* AUTO GENERATED LEAD ID */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                      LEAD ID (AUTO-GENERATED — YOU CAN EDIT IT)
                    </label>
                    <input
                      type="text"
                      className="form-control rounded-3 fw-bold"
                      value={leadForm.lead_code || 'LED-012'}
                      onChange={(e) => setLeadForm({ ...leadForm, lead_code: e.target.value })}
                      style={{ background: '#F0F7FF', border: '1px solid #CCE5FF', color: COLORS.indigo }}
                    />
                  </div>

                  {/* COMPANY NAME & CONTACT PERSON */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>COMPANY NAME *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Horizon Housing"
                        value={leadForm.company}
                        onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                        required
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>CONTACT PERSON</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Contact name"
                        value={leadForm.contact_name}
                        onChange={(e) => setLeadForm({ ...leadForm, contact_name: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>

                  {/* EMAIL & PHONE */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>EMAIL</label>
                      <input
                        type="email"
                        className="form-control rounded-3"
                        placeholder="email@company.com"
                        value={leadForm.contact_email}
                        onChange={(e) => setLeadForm({ ...leadForm, contact_email: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>PHONE</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="+91-XXXXX-XXXXX"
                        value={leadForm.phone || ''}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>

                  {/* LEAD SOURCE & STAGE */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>LEAD SOURCE</label>
                      <select
                        className="form-select rounded-3"
                        value={leadForm.source}
                        onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      >
                        <option value="Website">Website</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Referral">Referral</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>STAGE</label>
                      <select
                        className="form-select rounded-3"
                        value={leadForm.stage}
                        onChange={(e) => setLeadForm({ ...leadForm, stage: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      >
                        <option value="New">New</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed Won">Closed Won</option>
                      </select>
                    </div>
                  </div>

                  {/* LEAD SCORE & EST DEAL VALUE */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>LEAD SCORE (0-100)</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        min={0}
                        max={100}
                        placeholder="0-100"
                        value={leadForm.score}
                        onChange={(e) => setLeadForm({ ...leadForm, score: Number(e.target.value) })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>EST. DEAL VALUE (₹)</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        min={0}
                        value={leadForm.est_value}
                        onChange={(e) => setLeadForm({ ...leadForm, est_value: Number(e.target.value) })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>

                  {/* ASSIGNED TO */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>ASSIGNED TO</label>
                    <select
                      className="form-select rounded-3"
                      value={leadForm.assigned_to}
                      onChange={(e) => setLeadForm({ ...leadForm, assigned_to: e.target.value })}
                      style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                    >
                      <option value="Sales Team">Sales Team</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn rounded-pill px-4 bg-white border" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn rounded-pill px-4 border-0 text-white fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                    Submit Lead
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

export default LeadManagementCenterPage;