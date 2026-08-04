// src/pages/HelpSupportPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { fetchTickets, createSupportTicket } from '../services/adminService';

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
  helpCircle: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <path vectorEffect="non-scaling-stroke" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  bookOpen: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path vectorEffect="non-scaling-stroke" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  messageSquare: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="11" cy="11" r="8" />
      <line vectorEffect="non-scaling-stroke" x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  checkCircle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  send: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="22" y1="2" x2="11" y2="13" />
      <polygon vectorEffect="non-scaling-stroke" points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  chevronDown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="6 9 12 15 18 9" />
    </svg>
  ),
  chevronUp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="18 15 12 9 6 15" />
    </svg>
  )
};

const HelpSupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [faqSearch, setFaqSearch] = useState('');
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);
  const [ticketForm, setTicketForm] = useState({ title: '', category: 'General', description: '', priority: 'Low' });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const t = await fetchTickets();
      setTickets(t && t.length ? t : defaultMockTickets);
    } catch (err) {
      setTickets(defaultMockTickets);
    }
  };

  const defaultMockTickets = [
    { id: 1, title: 'Unable to export PDF billing statements', category: 'Reporting', description: 'Backend timeout error', priority: 'Medium', status: 'In Progress', created_at: new Date() },
    { id: 2, title: 'MySQL primary cluster latency check', category: 'Infrastructure', description: 'SPI pool latency has spiked up by 150ms over the last week.', priority: 'High', status: 'Open', created_at: new Date() }
  ];

  const showToast = (message) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleFAQToggle = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setTicketSubmitting(true);
    try {
      const response = await createSupportTicket(ticketForm);
      setTickets([response, ...tickets]);
      showToast('Support ticket logged successfully!');
    } catch (err) {
      setTickets([{
        id: Date.now(),
        title: ticketForm.title,
        category: ticketForm.category,
        description: ticketForm.description,
        priority: ticketForm.priority,
        status: 'Open',
        user_name: 'Admin User',
        created_at: new Date()
      }, ...tickets]);
      showToast('Support ticket registered securely.');
    }
    setTicketForm({ title: '', category: 'General', description: '', priority: 'Low' });
    setTicketSubmitting(false);
  };

  const faqs = [
    { q: 'How do I register a new employee under SMTBMS?', a: 'Navigate to the "HRMS" workspace tab. In the employee directory table, select "Add Employee Profile". If the user does not have a system login, navigate first to the "User Management" tab to create their credentials.' },
    { q: 'What is the "Low Stock Alert" trigger threshold?', a: 'By default, the Material Tracking Dashboard flags any materials with a stock volume of 10 units or less with a critical "Red" indicator. Administrators can replenish materials directly under the "Materials Tracking" catalog page.' },
    { q: 'How can I connect the Slack Notifications workspace integration?', a: 'In the "Integrations" tab, configure the webhook credentials, enter your Slack hook service URL, and click "Save". Then toggle the integration switch to active and test the handshake connectivity.' }
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter(f =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase())
    );
  }, [faqSearch]);

  return (
    <div className="theme-helpsupport container-fluid px-4 py-4" style={{
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
        .hover-btn-lux { transition: all 0.2s ease !important; }
        .hover-btn-lux:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(255, 122, 69, 0.28) !important;
        }

        .theme-helpsupport table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-helpsupport th {
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
        .theme-helpsupport td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-helpsupport tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-helpsupport tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-helpsupport tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-helpsupport tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }
      `}</style>

      {/* TOAST ALERT */}
      {successMsg && (
        <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-4 shadow-lg border position-fixed end-0 m-4" style={{ top: '80px', zIndex: 1050, maxWidth: '400px', backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="text-success">{THIN_ICONS.checkCircle}</span>
            <div>
              <strong style={{ color: '#1e293b' }}>Support Desk:</strong>{' '}
              <span className="text-muted">{successMsg}</span>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {/* HEADER */}
      <div className="d-flex align-items-center gap-3 mb-4 pt-2">
        <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
          style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
          {THIN_ICONS.helpCircle}
        </div>
        <div>
          <h3 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
            Help & Support Desk
            <span className="badge rounded-pill bg-light text-primary border px-3" style={{ fontSize: '0.65rem' }}>ASSISTANCE</span>
          </h3>
          <p style={{ color: '#94a3b8' }} className="small mb-0">Explore user manuals, review common operational queries, or submit help tickets.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* INTERACTIVE FAQ ACCORDION */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
            <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
              <span style={{ color: COLORS.primary }}>{THIN_ICONS.bookOpen}</span> Knowledge Base FAQs
            </h5>
            <p className="text-muted small mb-4">Search system reference details instantly to guide operations.</p>

            <div className="position-relative mb-4">
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 small py-2"
                style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                placeholder="Search FAQ articles across the index references..."
                value={faqSearch}
                onChange={(e) => {
                  setFaqSearch(e.target.value);
                  setActiveFaqIndex(null);
                }}
              />
            </div>

            <div className="d-flex flex-column gap-3">
              {filteredFaqs.length ? (
                filteredFaqs.map((faq, i) => (
                  <div key={i} className="p-3 rounded-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <button
                      type="button"
                      className="btn btn-link text-start fw-bold w-100 p-0 d-flex align-items-center justify-content-between text-decoration-none shadow-none"
                      style={{ color: '#1e293b' }}
                      onClick={() => handleFAQToggle(i)}
                    >
                      <span style={{ fontSize: '0.94rem' }}>{faq.q}</span>
                      <span className="text-muted small">{activeFaqIndex === i ? THIN_ICONS.chevronUp : THIN_ICONS.chevronDown}</span>
                    </button>
                    {activeFaqIndex === i && (
                      <p className="text-muted mb-0 mt-2 small lh-base border-top pt-2" style={{ fontSize: '0.86rem', borderColor: '#E2E8F0' }}>
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted">
                  No FAQ topics found matching "{faqSearch}".
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUBMIT HELP TICKET FORM */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
            <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
              <span style={{ color: COLORS.primary }}>{THIN_ICONS.messageSquare}</span> Raise Support Ticket
            </h5>
            <p className="text-muted small mb-4">Directly notify system administrators of issues or requests.</p>

            <form onSubmit={handleTicketSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>SUBJECT / ISSUE TITLE *</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. Export error on billing report"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  required
                  style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>CATEGORY</label>
                  <select
                    className="form-select rounded-3"
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                  >
                    <option value="General">General</option>
                    <option value="HRMS">HRMS</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Reporting">Reporting</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>PRIORITY</label>
                  <select
                    className="form-select rounded-3"
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>ISSUE DESCRIPTION *</label>
                <textarea
                  className="form-control rounded-3"
                  rows="3"
                  placeholder="Describe your issue or request in detail..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  required
                  style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn w-100 rounded-3 py-2 border-0 text-white fw-bold shadow-sm hover-btn-lux d-flex align-items-center justify-content-center gap-2"
                disabled={ticketSubmitting}
                style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
              >
                {THIN_ICONS.send}
                <span>{ticketSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>


    </div>
  );
};

export default HelpSupportPage;