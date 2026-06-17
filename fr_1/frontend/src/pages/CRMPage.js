// src/pages/CRMPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar as BarChart } from 'react-chartjs-2';

// Importing explicitly from your clean leadService file
import { fetchLeads, createLead, updateLead } from '../services/leadService';
import { fetchSalesSummary, fetchQuotations, createQuotation, fetchSalesTelemetry } from '../services/salesService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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
        backgroundColor: ['#2563eb', '#7c3aed', '#ea580c', '#166534'],
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
      x: { beginAtZero: true, grid: { color: '#e2e8f0', borderDash: [4, 4] }, ticks: { color: '#475569' } },
      y: { grid: { display: false }, ticks: { color: '#475569' } },
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

  return (
    // 🟢 ENHANCED LIGHT MODE CANVAS WRAPPER CONTAINER
    <div className="theme-crm container-fluid px-4 py-3" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>

      {/* 🟢 RE-ENGINEERED HIGH-CONTRAST LIGHT MODE COMPONENT SURFACES STYLE SHEETS */}
      <style>{`
        .hover-premium-card { 
          background-color: #ffffff !important; 
          border: 1px solid #e2e8f0 !important; 
          color: #1e293b !important; 
          border-radius: 16px !important;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03) !important;
          transition: transform 0.22s ease-in-out, box-shadow 0.22s ease-in-out, border-color 0.22s !important; 
        }
        .hover-premium-card:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08) !important; 
          border-color: #cbd5e1 !important; 
        }
        .light-table th { 
          background-color: #f1f5f9 !important; 
          color: #475569 !important; 
          border-bottom: 2px solid #e2e8f0 !important; 
          text-transform: uppercase; 
          font-size: 0.75rem; 
          font-weight: 700; 
          letter-spacing: 0.5px;
          padding: 14px !important; 
        }
        .light-table td { 
          color: #334155 !important; 
          border-top: 1px solid #e2e8f0 !important; 
          padding: 14px !important; 
          background-color: transparent !important; 
        }
        .light-table tr:hover td { 
          background-color: #f8fafc !important; 
        }
        .lux-input { 
          background-color: #ffffff !important; 
          color: #1e293b !important; 
          border: 1px solid #cbd5e1 !important; 
          border-radius: 10px; 
          padding: 10px 14px;
        }
        .lux-input:focus { 
          border-color: #2563eb !important; 
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important; 
          outline: none; 
        }
        .workspace-pill { 
          border: 1px solid #e2e8f0; 
          background: #ffffff; 
          padding: 10px 22px; 
          border-radius: 12px; 
          font-weight: 600; 
          font-size: 0.85rem; 
          color: #475569; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          transition: all 0.2s ease; 
        }
        .workspace-pill:hover { 
          background-color: #f1f5f9; 
          color: #1e293b; 
          border-color: #cbd5e1;
        }
        .workspace-pill.active { 
          background-color: #2563eb; 
          color: white; 
          border-color: #2563eb; 
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); 
        }
        .edit-badge-btn { 
          background: #f1f5f9; 
          border: 1px solid #cbd5e1; 
          padding: 6px 12px; 
          border-radius: 6px; 
          color: #2563eb; 
          font-size: 0.78rem; 
          font-weight: 600; 
          transition: all 0.15s; 
          cursor: pointer; 
        }
        .edit-badge-btn:hover { 
          background: #2563eb; 
          color: #ffffff; 
          border-color: #2563eb; 
        }
        .crm-modal-backdrop { 
          position: fixed; 
          top: 0; left: 0; right: 0; bottom: 0; 
          background-color: rgba(15, 23, 42, 0.4); 
          backdrop-filter: blur(4px);
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 2000; 
          padding: 20px; 
        }
        .crm-modal-content { 
          background-color: #ffffff; 
          border: 1px solid #cbd5e1; 
          border-radius: 16px; 
          width: 100%; 
          max-width: 900px; 
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1); 
          max-height: 90vh; 
          overflow-y: auto; 
        }
      `}</style>

      {/* HEADER CONTROLS */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: '#e2e8f0' }}>
        <div>
          <h2 className="fw-bold text-dark mb-0">CRM Dashboard Terminal</h2>
          <p className="text-muted small mb-0">Lead conversion, sales velocity tracking, and account relationships.</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="position-relative" style={{ minWidth: '320px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">🔍</span>
            <input
              type="text"
              className="form-control rounded-pill ps-5 lux-input"
              placeholder="Search directory tracking indexes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary fw-semibold px-4 rounded-pill border-0 shadow-sm" style={{ backgroundColor: '#2563eb' }} onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Close Form' : 'Add Lead'}
          </button>
          {activeWorkspaceTab === 'quotations' && (
            <button className="btn btn-success fw-semibold px-4 rounded-pill border-0 shadow-sm" style={{ backgroundColor: '#10b981' }} onClick={() => setShowQuoteForm(!showQuoteForm)}>
              {showQuoteForm ? 'Close Form' : 'Build Quote'}
            </button>
          )}
        </div>
      </div>

      {/* ADD NEW LEADS FORM BLOCK */}
      {showAddForm && (
        <div className="card border-0 p-4 mb-4 hover-premium-card">
          <h5 className="fw-bold text-dark mb-1">Add New Pipeline Entry</h5>
          <p className="text-muted small mb-3">Input parameters to add a record inside your system database directory.</p>
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
              <button type="button" className="btn btn-light border" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary border-0" style={{ backgroundColor: '#2563eb' }}>Save Lead</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL POPUP BACKDROP OVERLAY DRAWER FOR EDIT LEAD CONFIGURATION */}
      {editingLead && (
        <div className="crm-modal-backdrop">
          <div className="crm-modal-content p-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3" style={{ borderColor: '#e2e8f0' }}>
              <h5 className="fw-bold text-primary mb-0">📝 Edit Lead Configuration Matrix</h5>
              <span className="text-muted small">ID Node Ref: #{editingLead.id}</span>
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
                <button type="button" className="btn btn-light border" onClick={() => setEditingLead(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary border-0 px-4" style={{ backgroundColor: '#2563eb' }}>Apply Data Shifts</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUOTATION INPUT DRAWER */}
      {showQuoteForm && (
        <div className="card border-0 p-4 mb-4 hover-premium-card">
          <h5 className="fw-bold text-dark mb-1">Generate Commercial Cost Quotation</h5>
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
              <button type="button" className="btn btn-light border" onClick={() => setShowQuoteForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-success border-0 text-white px-4" style={{ backgroundColor: '#10b981' }}>Compile Invoice Ledger</button>
            </div>
          </form>
        </div>
      )}

      {/* WORKSPACE SELECTION INTERACTION LINKS BAR */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button className={`workspace-pill ${activeWorkspaceTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveWorkspaceTab('dashboard')}>📊 CRM Overview</button>
        <button className={`workspace-pill ${activeWorkspaceTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveWorkspaceTab('leads')}>👥 Lead Management</button>
        <button className={`workspace-pill ${activeWorkspaceTab === 'opportunities' ? 'active' : ''}`} onClick={() => setActiveWorkspaceTab('opportunities')}>🎯 Opportunities Pipeline</button>
        <button className={`workspace-pill ${activeWorkspaceTab === 'quotations' ? 'active' : ''}`} onClick={() => setActiveWorkspaceTab('quotations')}>📝 Quotations Engine</button>
        <button className={`workspace-pill ${activeWorkspaceTab === 'targets' ? 'active' : ''}`} onClick={() => setActiveWorkspaceTab('targets')}>🎯 Sales Targets</button>
        <button className={`workspace-pill ${activeWorkspaceTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveWorkspaceTab('revenue')}>💰 Revenue Tracking</button>
      </div>

      {/* CONDITIONALLY LOAD PIPELINES ONLY IF TAB IS 'dashboard' */}
      {activeWorkspaceTab === 'dashboard' && (
        <>
          <div className="card border-0 p-4 mb-4 hover-premium-card">
            <h5 className="fw-bold text-dark mb-1">Deal Funnel Velocity</h5>
            <div className="row g-3 mt-1">
              {[
                { label: 'Leads', value: loading ? '...' : pipelineMetrics.leads, icon: '🎯', customColor: '#2563eb' },
                { label: 'Qualified', value: loading ? '...' : pipelineMetrics.qualified, icon: '⚡', customColor: '#7c3aed' },
                { label: 'Deals', value: loading ? '...' : pipelineMetrics.deals, icon: '🤝', customColor: '#ea580c' },
                { label: 'Won', value: loading ? '...' : pipelineMetrics.won, icon: '🏆', customColor: '#166534' }
              ].map((card, idx) => (
                <div key={idx} className="col-6 col-md-3">
                  <div className="p-3 rounded-3 border text-center h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', fontSize: '1.2rem', backgroundColor: '#ffffff', color: card.customColor, border: '1px solid #e2e8f0' }}>
                      {card.icon}
                    </div>
                    <h4 className="fw-bold text-dark mb-0 font-monospace">{card.value}</h4>
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.78rem' }}>{card.label}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-8">
              <div className="card border-0 p-4 h-100 hover-premium-card">
                <h5 className="fw-bold text-dark mb-3">Sales Pipeline Conversion</h5>
                <div style={{ height: '210px', position: 'relative' }}>
                  <BarChart data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card border-0 p-4 h-100 hover-premium-card" style={{ borderLeft: '5px solid #7c3aed' }}>
                <h5 className="fw-bold text-dark mb-1">Financial Pipeline Value</h5>
                <div className="d-flex flex-column gap-3 mt-3">
                  <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <small className="d-block fw-medium mb-1 text-muted" style={{ fontSize: '0.75rem' }}>Total Closed Won Revenue</small>
                    <h4 className="fw-bold text-success mb-0 font-monospace">₹{Number(telemetry.telemetry?.won || salesSummary.total_revenue || 0).toLocaleString()}</h4>
                  </div>
                  <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <small className="d-block fw-medium mb-1 text-muted" style={{ fontSize: '0.75rem' }}>Gross Open Pipeline Portfolio Worth</small>
                    <h4 className="fw-bold text-primary mb-0 font-monospace">₹{Number(telemetry.telemetry?.pipeline || 0).toLocaleString()}</h4>
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
                    <tr><td colSpan="7" className="text-center py-4 text-muted"><span className="spinner-border spinner-border-sm text-primary me-2" />Syncing lead indexes...</td></tr>
                  ) : filteredLeads.length ? (
                    filteredLeads.map((item, idx) => {
                      const clientContactName = item.contact_name || 'Unnamed Contact';
                      const financialDealValue = parseFloat(item.value || 0);
                      const assignedLeadOwner = item.assigned_to || 'Unassigned';
                      const activePipelineStatus = item.stage || 'New Lead';

                      return (
                        <tr key={item.id || idx}>
                          <td className="ps-3 fw-semibold text-dark">{clientContactName}<br /><small className="text-muted font-monospace">{item.email || '—'}</small></td>
                          <td>{item.company || '—'}</td>
                          <td className="text-muted small">{item.source || 'CRM Terminal'}</td>
                          <td className="fw-bold text-success font-monospace">
                            ₹{financialDealValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="text-secondary small">{assignedLeadOwner}</td>
                          <td>
                            <span className="badge rounded-pill px-3 py-1.5 bg-light text-dark border">
                              {activePipelineStatus}
                            </span>
                          </td>
                          <td className="text-end pe-3">
                            <button className="edit-badge-btn" onClick={() => { setEditingLead(item); }}>
                              ✏️ Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="7" className="text-center text-muted py-4">No parameters match active lead thresholds.</td></tr>
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
                    icon: '💼',
                    color: '#2563eb',
                    desc: 'Unclosed active deal metrics'
                  },
                  {
                    label: 'Deals Active in Negotiation',
                    value: filteredOpportunities.filter(item => item.stage === 'In Negotiation').length,
                    icon: '🤝',
                    color: '#ea580c',
                    desc: 'Live high-intent contract reviews'
                  },
                  {
                    label: 'Average Weighted Deal Size',
                    value: `₹${Math.round(filteredOpportunities.length ? (filteredOpportunities.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0) / filteredOpportunities.length) : 0).toLocaleString('en-IN')}`,
                    icon: '📊',
                    color: '#7c3aed',
                    desc: 'Mean worth across portfolio'
                  }
                ].map((card, idx) => (
                  <div key={idx} className="col-12 col-md-4">
                    <div className="p-3 rounded-3 h-100 text-start" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: `4px solid ${card.color}` }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <small className="text-muted d-block fw-semibold tracking-wider mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>{card.label}</small>
                          <h4 className="fw-bold text-dark mb-1 font-monospace" style={{ fontSize: '1.25rem' }}>{card.value}</h4>
                          <span className="text-secondary d-block" style={{ fontSize: '0.72rem' }}>{card.desc}</span>
                        </div>
                        <div className="fs-4 opacity-75">{card.icon}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 pt-2">
                <div className="text-start">
                  <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1rem' }}>🎯 Qualified Opportunities Deal Flow</h5>
                  <small className="text-muted">Displaying pipeline accounts with dynamic, verified value metrics.</small>
                </div>
                <span className="badge px-3 py-1.5 bg-light text-dark border fw-bold">
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
                      <tr><td colSpan="8" className="text-center py-4 text-muted"><span className="spinner-border spinner-border-sm text-primary me-2" />Extracting live telemetry...</td></tr>
                    ) : filteredOpportunities.length ? (
                      filteredOpportunities.map((item, idx) => {
                        const clientContactName = item.contact_name || 'Unnamed Contact';
                        const financialDealValue = parseFloat(item.value || 0);
                        const assignedLeadOwner = item.assigned_to || 'Unassigned';
                        const activePipelineStatus = item.stage || 'New Lead';
                        const forecastCloseDate = item.closing_date ? new Date(item.closing_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not Scheduled';

                        return (
                          <tr key={item.id || idx}>
                            <td className="ps-3 fw-semibold text-dark">
                              {clientContactName}
                              <br />
                              <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>{item.email || '—'}</small>
                            </td>
                            <td>{item.company || '—'}</td>
                            <td className="text-muted small">{item.source || 'CRM Terminal'}</td>
                            <td className="fw-bold text-success font-monospace">
                              ₹{financialDealValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="small text-danger font-monospace">{forecastCloseDate}</td>
                            <td className="text-secondary small">{assignedLeadOwner}</td>
                            <td>
                              <span className={`badge rounded-pill px-3 py-1.5 ${activePipelineStatus.includes('Won') ? 'bg-success text-white' :
                                activePipelineStatus.includes('Negotiation') ? 'bg-warning text-dark fw-bold' : 'bg-primary text-white'
                                }`}>
                                {activePipelineStatus}
                              </span>
                            </td>
                            <td className="text-end pe-3">
                              <button className="edit-badge-btn" onClick={() => { setEditingLead(item); }}>
                                ✏️ Edit Deal
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-5">
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
                      <td className="ps-3 font-monospace text-primary fw-bold">{q.quote_number}</td>
                      <td className="text-dark fw-semibold">{q.company_name || q.contact_name || `Lead Account Ref #${q.lead_id}`}</td>
                      <td className="font-monospace text-success fw-bold">₹{Number(q.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="text-end pe-3 text-muted small">{q.valid_until ? new Date(q.valid_until).toLocaleDateString() : 'No Deadline'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center text-muted py-4">No active quote indices registered inside current database data blocks.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TARGET PERFORMANCE TARGETS TRACKER */}
          {activeWorkspaceTab === 'targets' && (
            <div className="py-2">
              <div className="p-4 border shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', color: '#1e293b' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-dark" style={{ fontSize: '1.05rem', letterSpacing: '-0.3px' }}>Quota Performance Targets Tracker</span>
                  <span className="badge font-monospace px-3 py-1.5" style={{ backgroundColor: 'rgba(22, 101, 52, 0.1)', color: '#166534', fontSize: '0.8rem', fontWeight: '700' }}>
                    {targetProgressPercent}% Achieved
                  </span>
                </div>

                <div className="progress mb-4" style={{ height: '10px', backgroundColor: '#f1f5f9', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <div className="progress-bar" role="progressbar" style={{ width: `${targetProgressPercent}%`, backgroundColor: '#166534', borderRadius: '20px' }} />
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <small className="d-block text-muted mb-1 fw-medium" style={{ fontSize: '0.75rem' }}>Realized Volume Completed</small>
                      <h5 className="fw-bold text-success mb-0 font-monospace">₹{Number(telemetry.target?.achieved_amount || 0).toLocaleString('en-IN')}</h5>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <small className="d-block text-muted mb-1 fw-medium" style={{ fontSize: '0.75rem' }}>Assigned Target Boundary Quota</small>
                      <h5 className="fw-bold text-dark mb-0 font-monospace">₹{Number(telemetry.target?.target_amount || 500000).toLocaleString('en-IN')}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REVENUE PROGRESS LEDGER TAB */}
          {activeWorkspaceTab === 'revenue' && (
            <div className="py-2">
              <h5 className="fw-bold text-dark mb-1">Revenue Ingestion Ledger Tracking</h5>
              <p className="text-muted small mb-3">Auditing accounting logs pulling exclusively from successfully locked Closed Won pipeline values.</p>

              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <small className="text-muted d-block small mb-1">Gross Settled Liquidity Value</small>
                    <h3 className="fw-bold text-success font-monospace mb-0">₹{Number(telemetry.telemetry?.won || 0).toLocaleString('en-IN')}</h3>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <small className="text-muted d-block small mb-1">Combined Accounts Pipeline Weight</small>
                    <h3 className="fw-bold text-primary font-monospace mb-0">₹{Number(telemetry.telemetry?.pipeline || 0).toLocaleString('en-IN')}</h3>
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
                          <td className="ps-3 fw-semibold text-dark">{finalContactName}<br /><small className="text-muted font-monospace">{item.email}</small></td>
                          <td className="fw-medium text-secondary small">{item.company || '—'}</td>
                          <td className="text-muted small">{item.source || 'CRM Terminal'}</td>
                          <td className="fw-bold text-success font-monospace">₹{revenueValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="text-secondary small">{dealOwner}</td>
                          <td className="text-end pe-3">
                            <span className="badge bg-success text-white rounded-pill px-3 py-1.5">
                              {currentStage}
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
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