// src/pages/CRMPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar as BarChart } from 'react-chartjs-2';

// Importing explicitly from your clean leadService file
import { fetchLeads, createLead, updateLead } from '../services/leadService';
import { fetchSalesSummary, fetchQuotations, createQuotation, fetchSalesTelemetry } from '../services/salesService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// ── WARM ORANGISH & AMBER PALETTE FOR VISUAL CONSISTENCY WITH HRMSPAGE & ERPPAGE ──
const COLORS = {
  orange: '#FF8A48',     // Primary accent
  amber: '#FFC542',      // Secondary / Warning
  coral: '#FF6B6B',      // Danger / Alert
  emerald: '#2ED9C3',    // Success
  sky: '#4FC3F7',        // Info / Secondary nodes
  violet: '#9B7EDE',
  slate: '#64748B',
  primary: '#FF8A48',
  alert: '#FF6B6B'
};

// Shared UI Theme Token Constants — mirrors HRMSPage exactly so status badges,
// borders and surfaces read as one consistent design system across modules.
const THEME = {
  primary: COLORS.orange,
  primaryLight: 'rgba(255, 138, 72, 0.12)',
  slateDark: '#2c2520',
  slateMuted: '#a0938a',
  slateBorder: '#FCEFEA',
  slateBg: '#FFF9F6',
  white: '#ffffff',
  success: '#0f9488',
  successBg: `${COLORS.emerald}14`,
  danger: '#dc2626',
  dangerBg: `${COLORS.alert}14`,
  pending: '#b45309',
  pendingBg: `${COLORS.amber}18`,
  info: '#b45309',
  infoBg: `${COLORS.amber}14`
};

// ── CRISP-OPTIMIZED VECTOR ICON MATRIX (styled to match HRMSPage's THIN_ICONS) ──
// Each entry is a function so the same glyph can be rendered at any size while
// still inheriting color via `currentColor` from its parent element.
const CRM_ICONS = {
  search: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="11" cy="11" r="7" />
      <line vectorEffect="non-scaling-stroke" x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  chart: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M3 3v18h18" />
      <rect vectorEffect="non-scaling-stroke" x="7" y="13" width="3" height="5" rx="0.5" />
      <rect vectorEffect="non-scaling-stroke" x="12" y="9" width="3" height="9" rx="0.5" />
      <rect vectorEffect="non-scaling-stroke" x="17" y="5" width="3" height="13" rx="0.5" />
    </svg>
  ),
  users: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="7" r="4" />
      <path vectorEffect="non-scaling-stroke" d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path vectorEffect="non-scaling-stroke" d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  target: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="6" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="2" />
    </svg>
  ),
  zap: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  handshake: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M2 14h4l3-3 3 3 3-3 3 3h4" />
      <path vectorEffect="non-scaling-stroke" d="M9 8l3 3 3-3" />
    </svg>
  ),
  trophy: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path vectorEffect="non-scaling-stroke" d="M5 4H3a2 2 0 0 0 0 4h2" />
      <path vectorEffect="non-scaling-stroke" d="M19 4h2a2 2 0 0 1 0 4h-2" />
      <path vectorEffect="non-scaling-stroke" d="M12 14v4" />
      <path vectorEffect="non-scaling-stroke" d="M8 21h8" />
    </svg>
  ),
  briefcase: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="2" y="7" width="20" height="14" rx="2" />
      <path vectorEffect="non-scaling-stroke" d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line vectorEffect="non-scaling-stroke" x1="2" y1="12" x2="22" y2="12" />
    </svg>
  ),
  wallet: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path vectorEffect="non-scaling-stroke" d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path vectorEffect="non-scaling-stroke" d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </svg>
  ),
  fileText: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path vectorEffect="non-scaling-stroke" d="M14 2v6h6" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="13" x2="16" y2="13" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="17" x2="16" y2="17" />
    </svg>
  ),
  edit: (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M12 20h9" />
      <path vectorEffect="non-scaling-stroke" d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  plus: (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
};

const CRMPage = () => {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [salesSummary, setSalesSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // CRM Workspace Specific Data State Vectors
  const [quotations, setQuotations] = useState([]);
  const [telemetry, setTelemetry] = useState({ target: { target_amount: 500000, achieved_amount: 0 }, telemetry: { won: 0, pipeline: 0 } });
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [newQuote, setNewQuote] = useState({ lead_id: '', total_amount: '', valid_until: '' });

  const [newLead, setNewLead] = useState({
    contact_name: '',
    company: '',
    email: '',
    phone: '',
    stage: 'New Lead',
    source: 'CRM Terminal',
    value: '',
    assigned_to: '',
    notes: '',
    closing_date: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsData, salesData, quoteData, telemetryData] = await Promise.all([
        fetchLeads().catch(() => []),
        fetchSalesSummary().catch(() => ({})),
        fetchQuotations().catch(() => []),
        fetchSalesTelemetry().catch(() => ({ target: { target_amount: 500000, achieved_amount: 0 }, telemetry: { won: 0, pipeline: 0 } }))
      ]);
      setLeads(leadsData || []);
      setSalesSummary(salesData || {});
      setQuotations(quoteData || []);
      setTelemetry(telemetryData || { target: { target_amount: 500000, achieved_amount: 0 }, telemetry: { won: 0, pipeline: 0 } });
    } catch (error) {
      console.error('CRM load failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuoteInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuote((prev) => ({ ...prev, [name]: value }));
  };

  const pipelineMetrics = useMemo(() => {
    const addedLeads = leads.filter(c => (c.stage || '') === 'New Lead').length;
    const addedWon = leads.filter(c => (c.stage || '').includes('Won')).length;

    const baseLeads = (salesSummary.leads_count || Math.max(leads.length * 2.5, 48)) + addedLeads;
    const baseQualified = salesSummary.qualified_count || Math.max(Math.round(baseLeads * 0.6), 28);
    const baseDeals = salesSummary.deals_count || Math.max((salesSummary.topCustomers?.length || 0) * 2 || 18);
    const baseWon = (salesSummary.won_count || salesSummary.total_orders || 14) + addedWon;

    return {
      leads: Math.round(baseLeads),
      qualified: Math.round(baseQualified),
      deals: Math.round(baseDeals),
      won: Math.round(baseWon),
    };
  }, [leads, salesSummary]);

  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      if (!item) return false;
      const name = (item.contact_name || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const company = (item.company || '').toLowerCase();
      const stage = (item.stage || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || email.includes(term) || company.includes(term) || stage.includes(term);
    });
  }, [leads, searchTerm]);

  const filteredOpportunities = useMemo(() => {
    return filteredLeads.filter(c => parseFloat(c.value || 0) > 0);
  }, [filteredLeads]);

  const revenueTransactionsList = useMemo(() => {
    return filteredLeads.filter(c => (c.stage || '').includes('Won'));
  }, [filteredLeads]);

  const targetProgressPercent = useMemo(() => {
    const ta = Number(telemetry.target?.target_amount) || 1;
    const aa = Number(telemetry.target?.achieved_amount) || 0;
    return Math.min(Math.round((aa / ta) * 100), 100);
  }, [telemetry]);

  const chartData = {
    labels: ['Leads Generated', 'Marketing Qualified', 'Deals in Negotiation', 'Closed Won'],
    datasets: [
      {
        label: 'Active Pipeline Stage Count',
        data: [pipelineMetrics.leads, pipelineMetrics.qualified, pipelineMetrics.deals, pipelineMetrics.won],
        backgroundColor: [COLORS.orange, COLORS.violet, COLORS.sky, COLORS.emerald],
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, grid: { color: THEME.slateBorder, borderDash: [4, 4] }, ticks: { color: THEME.slateMuted } },
      y: { grid: { display: false }, ticks: { color: THEME.slateMuted } },
    },
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    if (!newLead.contact_name || !newLead.email) {
      alert('Please fill out the required Name and Email fields.');
      return;
    }

    const runtimePayload = {
      contact_name: newLead.contact_name.trim(),
      company: newLead.company.trim(),
      email: newLead.email.trim(),
      phone: newLead.phone.trim(),
      stage: newLead.stage,
      source: newLead.source || 'CRM Terminal',
      value: parseFloat(newLead.value) || 0.00,
      assigned_to: newLead.assigned_to.trim(),
      notes: newLead.notes.trim(),
      closing_date: newLead.closing_date && newLead.closing_date.trim() !== '' ? newLead.closing_date : null,
    };

    try {
      await createLead(runtimePayload);
      setNewLead({
        contact_name: '', company: '', email: '', phone: '',
        stage: 'New Lead', source: 'CRM Terminal', value: '',
        assigned_to: '', notes: '', closing_date: ''
      });
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      const serverMessage = error?.response?.data?.message || error?.response?.data?.detail || error?.message || 'Unknown error';
      alert(`Failed to save lead: ${serverMessage}`);
    }
  };

  const handleUpdateLeadSubmit = async (e) => {
    e.preventDefault();
    if (!editingLead.contact_name || !editingLead.email) return;

    const updatedPayload = {
      ...editingLead,
      value: parseFloat(editingLead.value) || 0.00,
      closing_date: editingLead.closing_date ? editingLead.closing_date.split('T')[0] : null
    };

    try {
      await updateLead(editingLead.id, updatedPayload);
      setEditingLead(null);
      await loadData();
    } catch (error) {
      console.error('Failed to commit modifications:', error);
      alert('Unable to process records update operations.');
    }
  };

  const handleSaveQuotation = async (e) => {
    e.preventDefault();
    if (!newQuote.lead_id || !newQuote.total_amount) {
      alert('Please map a valid account and specify item validation amounts.');
      return;
    }
    try {
      await createQuotation(newQuote);
      setShowQuoteForm(false);
      setNewQuote({ lead_id: '', total_amount: '', valid_until: '' });
      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  // Reusable status-badge style resolver — same three-state (success/pending/info)
  // token mapping used across HRMSPage's leave, candidate and training badges.
  const stageBadgeStyle = (stage) => {
    const s = stage || '';
    if (s.includes('Won')) return { backgroundColor: THEME.successBg, color: THEME.success, border: `1px solid ${COLORS.emerald}44` };
    if (s.includes('Negotiation')) return { backgroundColor: THEME.pendingBg, color: THEME.pending, border: `1px solid ${COLORS.amber}44` };
    if (s.includes('Qualified')) return { backgroundColor: THEME.infoBg, color: THEME.primary, border: `1px solid ${COLORS.orange}33` };
    return { backgroundColor: THEME.slateBg, color: '#5c524a', border: `1px solid ${THEME.slateBorder}` };
  };

  return (
    // WARM CANVAS WRAPPER — matches HRMSPage's gradient direction and tones
    <div className="theme-crm container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #FFF6F0 0%, #FFFBF9 50%, #FFFFFF 100%)',
      minHeight: '100vh', color: THEME.slateDark, fontFamily: '"Inter", sans-serif'
    }}>

      {/* RE-ENGINEERED LIGHT MODE COMPONENT SURFACES — reusing HRMSPage's THEME tokens */}
      <style>{`
        .hover-premium-card { 
          background-color: ${THEME.white} !important; 
          border: none !important; 
          color: ${THEME.slateDark} !important; 
          border-radius: 22px !important;
          box-shadow: 0 8px 24px rgba(95,58,30,0.04) !important;
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease !important; 
        }
        .hover-premium-card:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 14px 28px rgba(95,58,30,0.07) !important; 
        }
        .light-table th { 
          background-color: ${THEME.slateBg} !important; 
          color: ${THEME.slateMuted} !important; 
          border-bottom: 2px solid ${THEME.slateBorder} !important; 
          text-transform: uppercase; 
          font-size: 0.78rem; 
          font-weight: 700; 
          letter-spacing: 0.05em;
          padding: 14px 20px !important; 
        }
        .light-table td { 
          color: #5c524a !important; 
          border-bottom: 1px solid #FDF6F2 !important; 
          padding: 16px 20px !important; 
          background-color: transparent !important; 
          font-size: 0.92rem;
        }
        .light-table tr:hover td { 
          background-color: #FFFBF9 !important; 
        }
        .lux-input { 
          background-color: ${THEME.white} !important; 
          color: ${THEME.slateDark} !important; 
          border: 1px solid ${THEME.slateBorder} !important; 
          border-radius: 12px; 
          padding: 10px 14px;
          transition: all 0.2s ease !important;
        }
        .lux-input:focus { 
          border-color: ${COLORS.orange} !important; 
          box-shadow: 0 0 0 4px rgba(255, 138, 72, 0.12) !important; 
          outline: none; 
        }
        .workspace-pill { 
          border: 1px solid ${THEME.slateBorder}; 
          background: ${THEME.white}; 
          padding: 10px 22px; 
          border-radius: 12px; 
          font-weight: 600; 
          font-size: 0.85rem; 
          color: #5c524a; 
          box-shadow: 0 2px 4px rgba(95,58,30,0.02);
          transition: all 0.2s ease; 
          display: inline-flex;
        }
        .workspace-pill:hover { 
          background-color: ${THEME.slateBg}; 
          color: ${THEME.slateDark}; 
          border-color: ${COLORS.orange}55;
        }
        .workspace-pill.active { 
          background: linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%) !important; 
          color: white !important; 
          border-color: ${COLORS.orange} !important; 
          box-shadow: 0 4px 12px rgba(255, 138, 72, 0.25) !important; 
        }
        .edit-badge-btn { 
          background-color: ${THEME.primaryLight} !important; 
          border: none !important; 
          padding: 6px 14px !important; 
          border-radius: 8px !important; 
          color: ${THEME.primary} !important; 
          font-size: 0.8rem !important; 
          font-weight: 700 !important; 
          transition: all 0.15s; 
          cursor: pointer; 
        }
        .edit-badge-btn:hover { 
          background-color: ${COLORS.orange} !important; 
          color: #ffffff !important; 
        }
        .crm-modal-backdrop { 
          position: fixed; 
          top: 0; left: 0; right: 0; bottom: 0; 
          background-color: rgba(44, 37, 32, 0.35); 
          backdrop-filter: blur(4px);
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 2000; 
          padding: 20px; 
        }
        .crm-modal-content { 
          background-color: ${THEME.white}; 
          border: 1px solid ${THEME.slateBorder}; 
          border-radius: 22px; 
          width: 100%; 
          max-width: 900px; 
          box-shadow: 0 20px 40px rgba(95,58,30,0.12); 
          max-height: 90vh; 
          overflow-y: auto; 
        }
      `}</style>

      {/* HEADER CONTROLS */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: THEME.slateBorder }}>
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#2c2520', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>CRM Dashboard Terminal</h3>
          <p style={{ color: THEME.slateMuted }} className="small mb-0">Lead conversion, sales velocity tracking, and account relationships.</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="position-relative" style={{ minWidth: '320px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3 d-flex align-items-center" style={{ zIndex: 10, color: THEME.slateMuted }}>
              {CRM_ICONS.search(16)}
            </span>
            <input
              type="text"
              className="form-control rounded-pill ps-5 lux-input"
              placeholder="Search directory tracking indexes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="btn fw-semibold px-4 py-2 rounded-pill border-0 shadow-sm text-white d-inline-flex align-items-center gap-2"
            style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {!showAddForm && CRM_ICONS.plus(14)} {showAddForm ? 'Close Form' : 'Add Lead'}
          </button>
          {activeWorkspaceTab === 'quotations' && (
            <button
              className="btn fw-semibold px-4 py-2 rounded-pill border-0 shadow-sm text-white d-inline-flex align-items-center gap-2"
              style={{ background: `linear-gradient(135deg, ${COLORS.emerald} 0%, #5EEAD4 100%)` }}
              onClick={() => setShowQuoteForm(!showQuoteForm)}
            >
              {!showQuoteForm && CRM_ICONS.plus(14)} {showQuoteForm ? 'Close Form' : 'Build Quote'}
            </button>
          )}
        </div>
      </div>

      {/* ADD NEW LEADS FORM BLOCK */}
      {showAddForm && (
        <div className="card border-0 p-4 mb-4 hover-premium-card">
          <h5 className="fw-bold mb-1" style={{ color: THEME.slateDark }}>Add New Pipeline Entry</h5>
          <p className="small mb-3" style={{ color: THEME.slateMuted }}>Input parameters to add a record inside your system database directory.</p>
          <form onSubmit={handleSaveLead} className="row g-3 mt-1">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Contact Name *</label>
              <input type="text" name="contact_name" required className="form-control lux-input" value={newLead.contact_name} onChange={handleInputChange} placeholder="Jane Doe" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Email Channel *</label>
              <input type="email" name="email" required className="form-control lux-input" value={newLead.email} onChange={handleInputChange} placeholder="jane@domain.com" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Phone Route</label>
              <input type="text" name="phone" className="form-control lux-input" value={newLead.phone} onChange={handleInputChange} placeholder="(555) 0199-231" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Company Account</label>
              <input type="text" name="company" className="form-control lux-input" value={newLead.company} onChange={handleInputChange} placeholder="Acme Enterprise Inc" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Deal Value Potential (₹)</label>
              <input type="number" name="value" step="0.01" className="form-control lux-input" value={newLead.value} onChange={handleInputChange} placeholder="0.00" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Pipeline Status Stage</label>
              <select name="stage" className="form-select lux-input" value={newLead.stage} onChange={handleInputChange}>
                <option value="New Lead">New Lead</option>
                <option value="Marketing Qualified">Marketing Qualified</option>
                <option value="In Negotiation">In Negotiation</option>
                <option value="Closed Won">Closed Won</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Lead Acquired Source</label>
              <input type="text" name="source" className="form-control lux-input" value={newLead.source} onChange={handleInputChange} placeholder="CRM Terminal" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Assigned Account Owner</label>
              <input type="text" name="assigned_to" className="form-control lux-input" value={newLead.assigned_to} onChange={handleInputChange} placeholder="Agent Representative Name" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Expected Closing Date</label>
              <input type="date" name="closing_date" className="form-control lux-input" value={newLead.closing_date} onChange={handleInputChange} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold text-secondary">Internal Notes Log</label>
              <textarea name="notes" rows="2" className="form-control lux-input" value={newLead.notes} onChange={handleInputChange} />
            </div>
            <div className="col-12 d-flex justify-content-end gap-2 mt-3">
              <button type="button" className="btn rounded-3 border bg-white" style={{ borderColor: THEME.slateBorder }} onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn border-0 text-white rounded-3 fw-semibold px-4" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }}>Save Lead</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL POPUP BACKDROP OVERLAY DRAWER FOR EDIT LEAD CONFIGURATION */}
      {editingLead && (
        <div className="crm-modal-backdrop">
          <div className="crm-modal-content p-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3" style={{ borderColor: THEME.slateBorder }}>
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: THEME.primary }}>
                {CRM_ICONS.edit(18)} Edit Lead Configuration Matrix
              </h5>
              <span className="small" style={{ color: THEME.slateMuted }}>ID Node Ref: #{editingLead.id}</span>
            </div>
            <form onSubmit={handleUpdateLeadSubmit} className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Client Contact Name</label>
                <input type="text" name="contact_name" required className="form-control lux-input" value={editingLead.contact_name || ''} onChange={handleEditInputChange} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Email Routing Link</label>
                <input type="email" name="email" required className="form-control lux-input" value={editingLead.email || ''} onChange={handleEditInputChange} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Phone Channel</label>
                <input type="text" name="phone" className="form-control lux-input" value={editingLead.phone || ''} onChange={handleEditInputChange} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Company Corporate Account</label>
                <input type="text" name="company" className="form-control lux-input" value={editingLead.company || ''} onChange={handleEditInputChange} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Deal Potential Value (₹)</label>
                <input type="number" name="value" step="0.01" className="form-control lux-input" value={editingLead.value || ''} onChange={handleEditInputChange} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Active Funnel Stage</label>
                <select name="stage" className="form-select lux-input" value={editingLead.stage || 'New Lead'} onChange={handleEditInputChange}>
                  <option value="New Lead">New Lead</option>
                  <option value="Marketing Qualified">Marketing Qualified</option>
                  <option value="In Negotiation">In Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Assigned Account Representative</label>
                <input type="text" name="assigned_to" className="form-control lux-input" value={editingLead.assigned_to || ''} onChange={handleEditInputChange} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Lead Acquired Source</label>
                <input type="text" name="source" className="form-control lux-input" value={editingLead.source || ''} onChange={handleEditInputChange} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Expected Closing Date</label>
                <input type="date" name="closing_date" className="form-control lux-input" value={editingLead.closing_date ? editingLead.closing_date.split('T')[0] : ''} onChange={handleEditInputChange} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold text-secondary">Internal Notes Log</label>
                <textarea name="notes" rows="2" className="form-control lux-input" value={editingLead.notes || ''} onChange={handleEditInputChange} />
              </div>
              <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn rounded-3 border bg-white" style={{ borderColor: THEME.slateBorder }} onClick={() => setEditingLead(null)}>Cancel</button>
                <button type="submit" className="btn border-0 text-white rounded-3 px-4 fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.amber} 100%)` }}>Apply Data Shifts</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUOTATION INPUT DRAWER */}
      {showQuoteForm && (
        <div className="card border-0 p-4 mb-4 hover-premium-card">
          <h5 className="fw-bold mb-1" style={{ color: THEME.slateDark }}>Generate Commercial Cost Quotation</h5>
          <form onSubmit={handleSaveQuotation} className="row g-3 mt-1">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Target Account Profile</label>
              <select name="lead_id" className="form-select lux-input" required value={newQuote.lead_id} onChange={handleQuoteInputChange}>
                <option value="">Select Company Target...</option>
                {leads.map(c => <option key={c.id} value={c.id}>{c.company || c.contact_name}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-4"><label className="form-label small fw-semibold text-secondary">Total Amount Value (₹)</label><input type="number" name="total_amount" required className="form-control lux-input" value={newQuote.total_amount} onChange={handleQuoteInputChange} /></div>
            <div className="col-12 col-md-4"><label className="form-label small fw-semibold text-secondary">Validation Expiry Date</label><input type="date" name="valid_until" required className="form-control lux-input" value={newQuote.valid_until} onChange={handleQuoteInputChange} /></div>
            <div className="col-12 d-flex justify-content-end gap-2">
              <button type="button" className="btn rounded-3 border bg-white" style={{ borderColor: THEME.slateBorder }} onClick={() => setShowQuoteForm(false)}>Cancel</button>
              <button type="submit" className="btn border-0 text-white rounded-3 px-4 fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.emerald} 0%, #5EEAD4 100%)` }}>Compile Invoice Ledger</button>
            </div>
          </form>
        </div>
      )}

      {/* WORKSPACE SELECTION INTERACTION LINKS BAR */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button className={`workspace-pill align-items-center gap-2 ${activeWorkspaceTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveWorkspaceTab('dashboard')}>{CRM_ICONS.chart(16)} CRM Overview</button>
        <button className={`workspace-pill align-items-center gap-2 ${activeWorkspaceTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveWorkspaceTab('leads')}>{CRM_ICONS.users(16)} Lead Management</button>
        <button className={`workspace-pill align-items-center gap-2 ${activeWorkspaceTab === 'opportunities' ? 'active' : ''}`} onClick={() => setActiveWorkspaceTab('opportunities')}>{CRM_ICONS.briefcase(16)} Opportunities Pipeline</button>
        <button className={`workspace-pill align-items-center gap-2 ${activeWorkspaceTab === 'quotations' ? 'active' : ''}`} onClick={() => setActiveWorkspaceTab('quotations')}>{CRM_ICONS.fileText(16)} Quotations Engine</button>
        <button className={`workspace-pill align-items-center gap-2 ${activeWorkspaceTab === 'targets' ? 'active' : ''}`} onClick={() => setActiveWorkspaceTab('targets')}>{CRM_ICONS.target(16)} Sales Targets</button>
        <button className={`workspace-pill align-items-center gap-2 ${activeWorkspaceTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveWorkspaceTab('revenue')}>{CRM_ICONS.wallet(16)} Revenue Tracking</button>
      </div>

      {/* CONDITIONALLY LOAD PIPELINES ONLY IF TAB IS 'dashboard' */}
      {activeWorkspaceTab === 'dashboard' && (
        <>
          <div className="card border-0 p-4 mb-4 hover-premium-card">
            <h5 className="fw-bold mb-1" style={{ color: THEME.slateDark }}>Deal Funnel Velocity</h5>
            <div className="row g-3 mt-1">
              {[
                { label: 'Leads', value: loading ? '...' : pipelineMetrics.leads, icon: CRM_ICONS.target(20), customColor: COLORS.orange },
                { label: 'Qualified', value: loading ? '...' : pipelineMetrics.qualified, icon: CRM_ICONS.zap(20), customColor: COLORS.violet },
                { label: 'Deals', value: loading ? '...' : pipelineMetrics.deals, icon: CRM_ICONS.handshake(20), customColor: COLORS.sky },
                { label: 'Won', value: loading ? '...' : pipelineMetrics.won, icon: CRM_ICONS.trophy(20), customColor: COLORS.emerald }
              ].map((card, idx) => (
                <div key={idx} className="col-6 col-md-3">
                  <div className="p-3 rounded-3 text-center h-100" style={{ backgroundColor: THEME.slateBg, border: `1px solid ${THEME.slateBorder}` }}>
                    <div className="mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', fontSize: '1.2rem', backgroundColor: THEME.white, color: card.customColor, border: `2px solid ${card.customColor}35` }}>
                      {card.icon}
                    </div>
                    <h4 className="fw-bold mb-0 font-monospace" style={{ color: THEME.slateDark }}>{card.value}</h4>
                    <small className="d-block mt-1" style={{ fontSize: '0.78rem', color: THEME.slateMuted }}>{card.label}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-8">
              <div className="card border-0 p-4 h-100 hover-premium-card">
                <h5 className="fw-bold mb-3" style={{ color: THEME.slateDark }}>Sales Pipeline Conversion</h5>
                <div style={{ height: '210px', position: 'relative' }}>
                  <BarChart data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderLeft: `5px solid ${COLORS.violet}` }}>
                <h5 className="fw-bold mb-1" style={{ color: THEME.slateDark }}>Financial Pipeline Value</h5>
                <div className="d-flex flex-column gap-3 mt-3">
                  <div className="p-3 rounded-3" style={{ backgroundColor: THEME.slateBg, border: `1px solid ${THEME.slateBorder}` }}>
                    <small className="d-block fw-medium mb-1" style={{ fontSize: '0.75rem', color: THEME.slateMuted }}>Total Closed Won Revenue</small>
                    <h4 className="fw-bold mb-0 font-monospace" style={{ color: THEME.success }}>₹{Number(telemetry.telemetry?.won || salesSummary.total_revenue || 0).toLocaleString()}</h4>
                  </div>
                  <div className="p-3 rounded-3" style={{ backgroundColor: THEME.slateBg, border: `1px solid ${THEME.slateBorder}` }}>
                    <small className="d-block fw-medium mb-1" style={{ fontSize: '0.75rem', color: THEME.slateMuted }}>Gross Open Pipeline Portfolio Worth</small>
                    <h4 className="fw-bold mb-0 font-monospace" style={{ color: THEME.primary }}>₹{Number(telemetry.telemetry?.pipeline || 0).toLocaleString()}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CORE DISPLAY DATA PLATFORMS */}
      {activeWorkspaceTab !== 'dashboard' && (
        <div className="card border-0 p-4 hover-premium-card">

          {/* WORKSPACE VIEW BLOCK 1: LEAD MANAGEMENT TABLE */}
          {activeWorkspaceTab === 'leads' && (
            <div className="table-responsive">
              <table className="table align-middle light-table mb-0">
                <thead>
                  <tr>
                    <th className="ps-3">Client Contact</th>
                    <th>Company Account</th>
                    <th>Source</th>
                    <th>Deal Value</th>
                    <th>Owner Assigned</th>
                    <th>Pipeline Status</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-4" style={{ color: THEME.slateMuted }}><span className="spinner-border spinner-border-sm me-2" style={{ color: THEME.primary }} />Syncing lead indexes...</td></tr>
                  ) : filteredLeads.length ? (
                    filteredLeads.map((item, idx) => {
                      const clientContactName = item.contact_name || 'Unnamed Contact';
                      const financialDealValue = parseFloat(item.value || 0);
                      const assignedLeadOwner = item.assigned_to || 'Unassigned';
                      const activePipelineStatus = item.stage || 'New Lead';

                      return (
                        <tr key={item.id || idx}>
                          <td className="ps-3 fw-semibold" style={{ color: THEME.slateDark }}>{clientContactName}<br /><small className="font-monospace" style={{ color: THEME.slateMuted }}>{item.email || '—'}</small></td>
                          <td>{item.company || '—'}</td>
                          <td className="small" style={{ color: THEME.slateMuted }}>{item.source || 'CRM Terminal'}</td>
                          <td className="fw-bold font-monospace" style={{ color: THEME.success }}>
                            ₹{financialDealValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="small text-secondary">{assignedLeadOwner}</td>
                          <td>
                            <span className="badge rounded-pill px-3 py-1.5" style={stageBadgeStyle(activePipelineStatus)}>
                              {activePipelineStatus}
                            </span>
                          </td>
                          <td className="text-end pe-3">
                            <button className="edit-badge-btn d-inline-flex align-items-center gap-1" onClick={() => { setEditingLead(item); }}>
                              {CRM_ICONS.edit(13)} Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="7" className="text-center py-4" style={{ color: THEME.slateMuted }}>No parameters match active lead thresholds.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* OPPORTUNITIES PIPELINE */}
          {activeWorkspaceTab === 'opportunities' && (
            <div className="animate-fade-in mt-2">
              <div className="row g-3 mb-4 text-start">
                {[
                  {
                    label: 'Gross Open Opportunity Worth',
                    value: `₹${leads.reduce((acc, curr) => curr.stage !== 'Closed Won' ? acc + parseFloat(curr.value || 0) : acc, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                    icon: CRM_ICONS.briefcase(20),
                    color: COLORS.orange,
                    desc: 'Unclosed active deal metrics'
                  },
                  {
                    label: 'Deals Active in Negotiation',
                    value: filteredOpportunities.filter(item => item.stage === 'In Negotiation').length,
                    icon: CRM_ICONS.handshake(20),
                    color: COLORS.amber,
                    desc: 'Live high-intent contract reviews'
                  },
                  {
                    label: 'Average Weighted Deal Size',
                    value: `₹${Math.round(filteredOpportunities.length ? (filteredOpportunities.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0) / filteredOpportunities.length) : 0).toLocaleString('en-IN')}`,
                    icon: CRM_ICONS.chart(20),
                    color: COLORS.violet,
                    desc: 'Mean worth across portfolio'
                  }
                ].map((card, idx) => (
                  <div key={idx} className="col-12 col-md-4">
                    <div className="p-3 rounded-3 h-100 text-start" style={{ backgroundColor: THEME.slateBg, border: `1px solid ${THEME.slateBorder}`, borderLeft: `4px solid ${card.color}` }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <small className="d-block fw-semibold tracking-wider mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: THEME.slateMuted }}>{card.label}</small>
                          <h4 className="fw-bold mb-1 font-monospace" style={{ fontSize: '1.25rem', color: THEME.slateDark }}>{card.value}</h4>
                          <span className="d-block" style={{ fontSize: '0.72rem', color: '#5c524a' }}>{card.desc}</span>
                        </div>
                        <div className="opacity-75" style={{ color: card.color }}>{card.icon}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 pt-2">
                <div className="text-start">
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1rem', color: THEME.slateDark }}>{CRM_ICONS.target(16)} Qualified Opportunities Deal Flow</h5>
                  <small style={{ color: THEME.slateMuted }}>Displaying pipeline accounts with dynamic, verified value metrics.</small>
                </div>
                <span className="badge px-3 py-1.5 fw-bold" style={{ backgroundColor: THEME.slateBg, color: '#5c524a', border: `1px solid ${THEME.slateBorder}` }}>
                  Pipeline Portfolio: {filteredOpportunities.length} Deals
                </span>
              </div>

              <div className="table-responsive">
                <table className="table align-middle light-table mb-0">
                  <thead>
                    <tr>
                      <th className="ps-3">Client Contact</th>
                      <th>Company Account</th>
                      <th>Source</th>
                      <th>Deal Value</th>
                      <th>Forecast Close</th>
                      <th>Owner Assigned</th>
                      <th>Funnel Status</th>
                      <th className="text-end pe-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="8" className="text-center py-4" style={{ color: THEME.slateMuted }}><span className="spinner-border spinner-border-sm me-2" style={{ color: THEME.primary }} />Extracting live telemetry...</td></tr>
                    ) : filteredOpportunities.length ? (
                      filteredOpportunities.map((item, idx) => {
                        const clientContactName = item.contact_name || 'Unnamed Contact';
                        const financialDealValue = parseFloat(item.value || 0);
                        const assignedLeadOwner = item.assigned_to || 'Unassigned';
                        const activePipelineStatus = item.stage || 'New Lead';
                        const forecastCloseDate = item.closing_date ? new Date(item.closing_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not Scheduled';

                        return (
                          <tr key={item.id || idx}>
                            <td className="ps-3 fw-semibold" style={{ color: THEME.slateDark }}>
                              {clientContactName}
                              <br />
                              <small className="font-monospace" style={{ fontSize: '0.75rem', color: THEME.slateMuted }}>{item.email || '—'}</small>
                            </td>
                            <td>{item.company || '—'}</td>
                            <td className="small" style={{ color: THEME.slateMuted }}>{item.source || 'CRM Terminal'}</td>
                            <td className="fw-bold font-monospace" style={{ color: THEME.success }}>
                              ₹{financialDealValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="small font-monospace" style={{ color: THEME.danger }}>{forecastCloseDate}</td>
                            <td className="small text-secondary">{assignedLeadOwner}</td>
                            <td>
                              <span className="badge rounded-pill px-3 py-1.5" style={stageBadgeStyle(activePipelineStatus)}>
                                {activePipelineStatus}
                              </span>
                            </td>
                            <td className="text-end pe-3">
                              <button className="edit-badge-btn d-inline-flex align-items-center gap-1" onClick={() => { setEditingLead(item); }}>
                                {CRM_ICONS.edit(13)} Edit Deal
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-5" style={{ color: THEME.slateMuted }}>
                          No leads have progressed to the opportunity stage. Assign a value &gt; ₹0 or adjust the status to "In Negotiation" to see them track here!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* QUOTATIONS LIST TABLE */}
          {activeWorkspaceTab === 'quotations' && (
            <div className="table-responsive">
              <table className="table align-middle light-table mb-0">
                <thead>
                  <tr>
                    <th className="ps-3">Quote Number ID</th>
                    <th>Linked Corporate Account</th>
                    <th>Valuation Amount</th>
                    <th className="text-end pe-3">Deadline Valid Until</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations && quotations.length ? quotations.map((q, i) => (
                    <tr key={q.id || i}>
                      <td className="ps-3 font-monospace fw-bold" style={{ color: THEME.primary }}>{q.quote_number}</td>
                      <td className="fw-semibold" style={{ color: THEME.slateDark }}>{q.company_name || q.contact_name || `Lead Account Ref #${q.lead_id}`}</td>
                      <td className="font-monospace fw-bold" style={{ color: THEME.success }}>₹{Number(q.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="text-end pe-3 small" style={{ color: THEME.slateMuted }}>{q.valid_until ? new Date(q.valid_until).toLocaleDateString() : 'No Deadline'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center py-4" style={{ color: THEME.slateMuted }}>No active quote indices registered inside current database data blocks.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TARGET PERFORMANCE TARGETS TRACKER */}
          {activeWorkspaceTab === 'targets' && (
            <div className="py-2">
              <div className="p-4" style={{ backgroundColor: THEME.white, border: `1px solid ${THEME.slateBorder}`, borderRadius: '16px', color: THEME.slateDark }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: '1.05rem', letterSpacing: '-0.3px', color: THEME.slateDark }}>
                    {CRM_ICONS.target(18)} Quota Performance Targets Tracker
                  </span>
                  <span className="badge font-monospace px-3 py-1.5" style={{ backgroundColor: THEME.successBg, color: THEME.success, fontSize: '0.8rem', fontWeight: '700' }}>
                    {targetProgressPercent}% Achieved
                  </span>
                </div>

                <div className="progress mb-4" style={{ height: '10px', backgroundColor: THEME.slateBg, borderRadius: '20px', border: `1px solid ${THEME.slateBorder}` }}>
                  <div className="progress-bar" role="progressbar" style={{ width: `${targetProgressPercent}%`, backgroundColor: COLORS.emerald, borderRadius: '20px' }} />
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: THEME.slateBg, border: `1px solid ${THEME.slateBorder}` }}>
                      <small className="d-block mb-1 fw-medium" style={{ fontSize: '0.75rem', color: THEME.slateMuted }}>Realized Volume Completed</small>
                      <h5 className="fw-bold mb-0 font-monospace" style={{ color: THEME.success }}>₹{Number(telemetry.target?.achieved_amount || 0).toLocaleString('en-IN')}</h5>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: THEME.slateBg, border: `1px solid ${THEME.slateBorder}` }}>
                      <small className="d-block mb-1 fw-medium" style={{ fontSize: '0.75rem', color: THEME.slateMuted }}>Assigned Target Boundary Quota</small>
                      <h5 className="fw-bold mb-0 font-monospace" style={{ color: THEME.slateDark }}>₹{Number(telemetry.target?.target_amount || 500000).toLocaleString('en-IN')}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REVENUE PROGRESS LEDGER TAB */}
          {activeWorkspaceTab === 'revenue' && (
            <div className="py-2">
              <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: THEME.slateDark }}>{CRM_ICONS.wallet(18)} Revenue Ingestion Ledger Tracking</h5>
              <p className="small mb-3" style={{ color: THEME.slateMuted }}>Auditing accounting logs pulling exclusively from successfully locked Closed Won pipeline values.</p>

              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3" style={{ backgroundColor: THEME.slateBg, border: `1px solid ${THEME.slateBorder}` }}>
                    <small className="d-block small mb-1" style={{ color: THEME.slateMuted }}>Gross Settled Liquidity Value</small>
                    <h3 className="fw-bold font-monospace mb-0" style={{ color: THEME.success }}>₹{Number(telemetry.telemetry?.won || 0).toLocaleString('en-IN')}</h3>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3" style={{ backgroundColor: THEME.slateBg, border: `1px solid ${THEME.slateBorder}` }}>
                    <small className="d-block small mb-1" style={{ color: THEME.slateMuted }}>Combined Accounts Pipeline Weight</small>
                    <h3 className="fw-bold font-monospace mb-0" style={{ color: THEME.primary }}>₹{Number(telemetry.telemetry?.pipeline || 0).toLocaleString('en-IN')}</h3>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle light-table mb-0">
                  <thead>
                    <tr>
                      <th className="ps-3">Client Contact</th>
                      <th>Company Account</th>
                      <th>Source</th>
                      <th>Deal Value</th>
                      <th>Owner Assigned</th>
                      <th className="text-end pe-3">Pipeline Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueTransactionsList.length ? revenueTransactionsList.map((item, idx) => {
                      const finalContactName = item.contact_name || 'Unnamed Contact';
                      const revenueValue = parseFloat(item.value || 0);
                      const dealOwner = item.assigned_to || 'Unassigned';
                      const currentStage = item.stage || 'Closed Won';

                      return (
                        <tr key={item.id || idx}>
                          <td className="ps-3 fw-semibold" style={{ color: THEME.slateDark }}>{finalContactName}<br /><small className="font-monospace" style={{ color: THEME.slateMuted }}>{item.email}</small></td>
                          <td className="fw-medium small text-secondary">{item.company || '—'}</td>
                          <td className="small" style={{ color: THEME.slateMuted }}>{item.source || 'CRM Terminal'}</td>
                          <td className="fw-bold font-monospace" style={{ color: THEME.success }}>₹{revenueValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="small text-secondary">{dealOwner}</td>
                          <td className="text-end pe-3">
                            <span className="badge rounded-pill px-3 py-1.5" style={{ backgroundColor: THEME.successBg, color: THEME.success, border: `1px solid ${COLORS.emerald}44` }}>
                              {currentStage}
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4" style={{ color: THEME.slateMuted }}>
                          No deals have transitioned into a 'Closed Won' state within this system period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default CRMPage;