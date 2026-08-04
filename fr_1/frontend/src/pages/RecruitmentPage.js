// src/pages/RecruitmentPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchCandidates, createCandidate, updateCandidateStatus } from '../services/hrService';
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
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="11" cy="11" r="8" />
      <line vectorEffect="non-scaling-stroke" x1="21" y1="21" x2="16.65" y2="16.65" />
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
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="2" x2="16" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="2" x2="8" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="12" y1="5" x2="12" y2="19" />
      <line vectorEffect="non-scaling-stroke" x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  trash: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline points="3 6 5 6 21 6" vectorEffect="non-scaling-stroke"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" vectorEffect="non-scaling-stroke"></path>
    </svg>
  )
};

const getStageStyle = (status) => {
  switch (status) {
    case 'Shortlisted': return { color: COLORS.indigo, backgroundColor: `${COLORS.indigo}15`, border: `1px solid ${COLORS.indigo}40` };
    case 'Technical Test': return { color: COLORS.slate, backgroundColor: `${COLORS.slate}15`, border: `1px solid ${COLORS.slate}40` };
    case 'Interview': return { color: COLORS.amber, backgroundColor: `${COLORS.amber}15`, border: `1px solid ${COLORS.amber}40` };
    case 'HR Round': return { color: COLORS.violet, backgroundColor: `${COLORS.violet}15`, border: `1px solid ${COLORS.violet}40` };
    case 'Offer Sent': return { color: COLORS.emerald, backgroundColor: `${COLORS.emerald}15`, border: `1px solid ${COLORS.emerald}40` };
    case 'Rejected': return { color: COLORS.alert, backgroundColor: `${COLORS.alert}15`, border: `1px solid ${COLORS.alert}40` };
    default: return { color: COLORS.slate, backgroundColor: `${COLORS.slate}15`, border: `1px solid ${COLORS.slate}40` };
  }
};

const RecruitmentPage = () => {
  const user = getCurrentUser();
  const canManage = ['Admin', 'HR'].includes(user?.role);

  const [activeTab, setActiveTab] = useState('openings'); // 'openings' | 'applicants'
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Modals state
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  // Default initial job listings
  const [jobOpenings, setJobOpenings] = useState([
    { id: 1, title: 'HR Business Partner', dept: 'HR', location: 'Mumbai', type: 'Full-time', vacancies: 1, applicants: 11, deadline: '15 Jul 2026', status: 'Active' },
    { id: 2, title: 'Senior DevOps Engineer', dept: 'IT', location: 'Bangalore', type: 'Full-time', vacancies: 2, applicants: 18, deadline: '20 Jul 2026', status: 'Active' },
    { id: 3, title: 'Sales Account Manager', dept: 'Sales', location: 'Delhi', type: 'Full-time', vacancies: 3, applicants: 9, deadline: '25 Jul 2026', status: 'Active' },
    { id: 4, title: 'Financial Analyst', dept: 'Finance', location: 'Mumbai', type: 'Full-time', vacancies: 1, applicants: 6, deadline: '30 Jul 2026', status: 'Active' }
  ]);

  // Job Form
  const [jobForm, setJobForm] = useState({
    title: '', dept: 'HR', location: 'Mumbai', type: 'Full-time', vacancies: 1, deadline: '30 Jul 2026'
  });

  // Candidate Form
  const [candidateForm, setCandidateForm] = useState({
    name: '', email: '', phone: '', position: 'HR Business Partner', experience: '3 yrs', notes: '', applied_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await fetchCandidates().catch(() => []);
      setCandidates(data || []);
    } catch (err) {
      console.error('Error loading candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const openPos = jobOpenings.length;
    const totalApps = candidates.length || 11;
    const interviews = candidates.filter(c => (c.status || c.stage) === 'Interview').length || 1;
    const offers = candidates.filter(c => (c.status || c.stage) === 'Offered' || (c.status || c.stage) === 'Selected').length || 1;
    return { openPos, totalApps, interviews, offers };
  }, [candidates, jobOpenings]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const q = searchTerm.toLowerCase();
      return (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.position || c.job_position || '').toLowerCase().includes(q);
    });
  }, [candidates, searchTerm]);

  const handleStageChange = async (id, status) => {
    try {
      await updateCandidateStatus(id, status);
      loadCandidates();
    } catch (err) {
      alert('Failed to update candidate status.');
    }
  };

  const toggleJobStatus = (id) => {
    setJobOpenings(jobOpenings.map(job =>
      job.id === id ? { ...job, status: job.status === 'Active' ? 'Inactive' : 'Active' } : job
    ));
    setOpenDropdownId(null);
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleRemoveCandidate = (id) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  const handleCreateJob = (e) => {
    e.preventDefault();
    const newJob = {
      id: Date.now(),
      ...jobForm,
      applicants: 0,
      status: 'Active'
    };
    setJobOpenings([newJob, ...jobOpenings]);
    alert('Job opening posted successfully!');
    setShowJobModal(false);
    setJobForm({ title: '', dept: 'HR', location: 'Mumbai', type: 'Full-time', vacancies: 1, deadline: '30 Jul 2026' });
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await createCandidate(candidateForm);
      alert('Applicant registered successfully!');
      setShowCandidateModal(false);
      setCandidateForm({ name: '', email: '', phone: '', position: 'HR Business Partner', experience: '3 yrs', notes: '', applied_date: new Date().toISOString().split('T')[0] });
      loadCandidates();
    } catch (err) {
      alert('Failed to add candidate application.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'RC';
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
    <div className="theme-recruitment container-fluid px-4 py-4" style={{
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

        /* FLOATING-ROW RECRUITMENT TABLE */
        .theme-recruitment table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-recruitment th {
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
        .theme-recruitment td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-recruitment tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-recruitment tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-recruitment tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-recruitment tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }

        .candidate-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF7A45 0%, #FFA36C 100%);
          color: #ffffff; font-weight: 800; font-size: 0.9rem;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── ACTION ICON BUTTONS (matched to MaterialsPage / MaterialTable) ── */
        .btn-action-icon {
          width: 32px !important;
          height: 32px !important;
          border-radius: 10px !important;
          border: none !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
        }
        .del-icon-btn {
          background-color: #FFF1F2 !important;
          color: #F43F5E !important;
        }
        .del-icon-btn:hover {
          background-color: #F43F5E !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25) !important;
          transform: translateY(-1px);
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)`, borderRadius: '14px' }}>
            {THIN_ICONS.users}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Recruitment Portal</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Manage job openings and track applicants end-to-end.</p>
          </div>
        </div>
        {canManage && (
          <div className="d-flex gap-2">
            <button
              className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
              onClick={() => setShowJobModal(true)}
              style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
            >
              {THIN_ICONS.plus}
              <span> Post Job</span>
            </button>
            <button
              className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
              onClick={() => setShowCandidateModal(true)}
              style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
            >
              {THIN_ICONS.plus}
              <span>Register Candidate</span>
            </button>
          </div>
        )}
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRIC CARDS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Open Positions', value: metrics.openPos, sub: 'Active job listings', icon: THIN_ICONS.search, color: COLORS.indigo },
          { label: 'Total Applicants', value: metrics.totalApps, sub: 'Across all openings', icon: THIN_ICONS.users, color: COLORS.violet },
          { label: 'Interviews Scheduled', value: metrics.interviews, sub: 'Pending this week', icon: THIN_ICONS.calendar, color: COLORS.amber },
          { label: 'Offers Sent', value: metrics.offers, sub: 'Awaiting acceptance', icon: THIN_ICONS.checkCircle, color: COLORS.emerald }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* SUB TAB SELECTOR */}
      <div className="d-flex gap-2 mb-4">
        <button
          className={`btn px-4 py-2 rounded-pill fw-semibold ${activeTab === 'openings' ? 'text-white' : 'bg-white text-dark border'}`}
          onClick={() => setActiveTab('openings')}
          style={{ background: activeTab === 'openings' ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : undefined }}
        >
          Job Openings ({jobOpenings.length})
        </button>
        <button
          className={`btn px-4 py-2 rounded-pill fw-semibold ${activeTab === 'applicants' ? 'text-white' : 'bg-white text-dark border'}`}
          onClick={() => setActiveTab('applicants')}
          style={{ background: activeTab === 'applicants' ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : undefined }}
        >
          All Applicants ({candidates.length})
        </button>
      </div>

      {/* RECRUITMENT TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="position-relative" style={{ minWidth: '280px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
            <input
              type="text"
              className="form-control rounded-pill ps-5 small"
              placeholder={activeTab === 'openings' ? 'Search jobs by title or location...' : 'Search applicants...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
            />
          </div>
        </div>

        <div className="table-responsive p-4 pt-2">
          {activeTab === 'openings' ? (
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Vacancies</th>
                  <th>Applicants</th>
                  <th>Deadline</th>
                  <th>STATUS</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {jobOpenings.map(job => (
                  <tr key={job.id}>
                    <td className="fw-bold" style={{ color: '#1e293b' }}>{job.title}</td>
                    <td><span className="badge rounded-pill bg-light text-primary px-3">{job.dept}</span></td>
                    <td>📍 {job.location}</td>
                    <td>{job.type}</td>
                    <td className="fw-bold">{job.vacancies}</td>
                    <td className="fw-bold text-primary">{job.applicants} →</td>
                    <td>{job.deadline}</td>
                    <td>
                      {job.status === 'Inactive' ? (
                        <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.alert}1A`, color: '#dc2626' }}>• Inactive</span>
                      ) : (
                        <span className="badge rounded-pill bg-success-subtle text-success px-3 py-1 fw-bold">• Active</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        {job.status === 'Inactive' ? (
                          <button
                            className="btn btn-sm bg-white border fw-bold rounded-2 px-3 hover-btn-lux"
                            style={{ color: '#1e293b' }}
                            onClick={() => toggleJobStatus(job.id)}
                          >
                            Open
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm bg-white border fw-bold rounded-2 px-3 hover-btn-lux"
                            style={{ color: '#1e293b' }}
                            onClick={() => toggleJobStatus(job.id)}
                          >
                            Close
                          </button>
                        )}
                        <div className="dropdown" style={{ position: 'relative' }}>
                          <button
                            className="btn btn-sm text-muted p-1 border-0 bg-transparent hover-btn-lux"
                            onClick={() => toggleDropdown(job.id)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </button>
                          {openDropdownId === job.id && (
                            <ul className="dropdown-menu border-0 shadow-lg rounded-3 p-2 show" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, minWidth: '160px' }}>
                              <li>
                                <button className="dropdown-item rounded-2 d-flex align-items-center gap-2 fw-semibold" style={{ color: '#1e293b' }} onClick={() => setOpenDropdownId(null)}>
                                  <span>👁</span> View Details
                                </button>
                              </li>
                              <li>
                                <button className="dropdown-item rounded-2 d-flex align-items-center gap-2 fw-semibold" style={{ color: '#1e293b' }} onClick={() => setOpenDropdownId(null)}>
                                  <span>✏️</span> Edit Job
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item rounded-2 d-flex align-items-center gap-2 fw-semibold"
                                  style={{ color: '#1e293b' }}
                                  onClick={() => toggleJobStatus(job.id)}
                                >
                                  <span>🔒</span> {job.status === 'Inactive' ? 'Open Job' : 'Close Job'}
                                </button>
                              </li>
                              <li><hr className="dropdown-divider my-1" /></li>
                              <li>
                                <button className="dropdown-item rounded-2 d-flex align-items-center gap-2 fw-semibold text-danger" onClick={() => setOpenDropdownId(null)}>
                                  <span>🗑️</span> Delete
                                </button>
                              </li>
                            </ul>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Job Applied</th>
                  <th>Experience</th>
                  <th>Applied On</th>
                  <th>STAGE</th>
                  <th className="text-end">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4" style={{ color: '#94a3b8' }}>No applicant records found in database.</td></tr>
                ) : (
                  filteredCandidates.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="candidate-avatar">{getInitials(c.name)}</div>
                          <div>
                            <div className="fw-bold" style={{ color: '#1e293b' }}>{c.name}</div>
                            <div className="small text-muted">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="fw-semibold">{c.position || c.job_position || 'HR Business Partner'}</td>
                      <td>{c.experience || '3 yrs'}</td>
                      <td>{c.applied_date ? new Date(c.applied_date).toLocaleDateString() : '12 May 2026'}</td>
                      <td>
                        <select
                          className="form-select form-select-sm rounded-pill px-3 fw-bold"
                          value={c.status || 'Applied'}
                          onChange={(e) => handleStageChange(c.id, e.target.value)}
                          style={{ width: '140px', ...getStageStyle(c.status || 'Applied') }}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Technical Test">Technical Test</option>
                          <option value="Interview">Interview</option>
                          <option value="HR Round">HR Round</option>
                          <option value="Offer Sent">Offer Sent</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end">
                          <button
                            className="btn btn-sm btn-action-icon del-icon-btn"
                            title="Remove Candidate"
                            onClick={() => handleRemoveCandidate(c.id)}
                          >
                            {THIN_ICONS.trash}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* POST JOB MODAL */}
      {showJobModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title">Post New Job Opening</h5>
                <button type="button" className="btn-close" onClick={() => setShowJobModal(false)}></button>
              </div>
              <form onSubmit={handleCreateJob}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Job Title</label>
                    <input type="text" className="form-control rounded-3" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} required />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Department</label>
                      <select className="form-select rounded-3" value={jobForm.dept} onChange={(e) => setJobForm({ ...jobForm, dept: e.target.value })}>
                        <option value="HR">HR</option>
                        <option value="IT">IT</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Location</label>
                      <input type="text" className="form-control rounded-3" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} required />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Vacancies</label>
                      <input type="number" className="form-control rounded-3" min={1} value={jobForm.vacancies} onChange={(e) => setJobForm({ ...jobForm, vacancies: Number(e.target.value) })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Deadline</label>
                      <input type="text" className="form-control rounded-3" value={jobForm.deadline} onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn rounded-pill px-4 bg-white border" onClick={() => setShowJobModal(false)}>Cancel</button>
                  <button type="submit" className="btn rounded-pill px-4 border-0 text-white fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                    Publish Opening
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER CANDIDATE MODAL */}
      {showCandidateModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title">Register Candidate</h5>
                <button type="button" className="btn-close" onClick={() => setShowCandidateModal(false)}></button>
              </div>
              <form onSubmit={handleAddCandidate}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Candidate Full Name</label>
                    <input type="text" className="form-control rounded-3" value={candidateForm.name} onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })} required />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Email Address</label>
                      <input type="email" className="form-control rounded-3" value={candidateForm.email} onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Phone</label>
                      <input type="text" className="form-control rounded-3" value={candidateForm.phone} onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Job Position</label>
                      <select className="form-select rounded-3" value={candidateForm.position} onChange={(e) => setCandidateForm({ ...candidateForm, position: e.target.value })}>
                        {jobOpenings.map(j => <option key={j.id} value={j.title}>{j.title}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Experience</label>
                      <input type="text" className="form-control rounded-3" value={candidateForm.experience} onChange={(e) => setCandidateForm({ ...candidateForm, experience: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn rounded-pill px-4 bg-white border" onClick={() => setShowCandidateModal(false)}>Cancel</button>
                  <button type="submit" className="btn rounded-pill px-4 border-0 text-white fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                    Submit Candidate
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

export default RecruitmentPage;