// src/pages/PerformanceReviewsPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchPerformanceReviews, createPerformanceReview, updatePerformanceReview, deletePerformanceReview } from '../services/hrService';
import { fetchEmployees } from '../services/employeeService';
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
  trendingUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline vectorEffect="non-scaling-stroke" points="17 6 23 6 23 12" />
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polygon vectorEffect="non-scaling-stroke" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  thumbsUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  ),
  thumbsDown: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
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
  edit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path vectorEffect="non-scaling-stroke" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="3 6 5 6 21 6" />
      <path vectorEffect="non-scaling-stroke" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  eye: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="3" />
    </svg>
  )
};

const PerformanceReviewsPage = () => {
  const user = getCurrentUser();
  const canManageHR = user?.role && ['Admin', 'HR', 'Manager'].includes(user.role);

  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: null, employee_id: '', kpi_score: '', attendance_score: '', targets_met: '', teamwork: '', rating: 'Excellent', appraisal: '' });
  const [viewingReview, setViewingReview] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const revs = await fetchPerformanceReviews().catch(() => []);
      setReviews(revs || []);
      const emps = await fetchEmployees().catch(() => []);
      setEmployees(emps || []);
    } catch (err) {
      console.error('Error loading performance reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    let excellent = 0;
    let good = 0;
    let average = 0;
    let totalScore = 0;
    let count = 0;

    reviews.forEach(r => {
      const rating = r.rating || 'Excellent';
      if (rating === 'Excellent' || Number(r.rating) >= 5) excellent++;
      else if (rating === 'Good' || Number(r.rating) === 4) good++;
      else average++;

      const kpi = Number(r.kpi_score || 0);
      const att = Number(r.attendance_score || 0);
      const tgt = Number(r.targets_met || 0);
      const team = Number(r.teamwork || 0);
      const overall = Math.round((kpi + att + tgt + team) / 4);
      totalScore += overall;
      count++;
    });

    const finalAvg = count > 0 ? Math.round(totalScore / count) : 0;

    return {
      avgScore: `${finalAvg}/100`,
      excellent: excellent || (reviews.length ? 0 : 4),
      good: good || (reviews.length ? 0 : 5),
      belowAvg: average
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const query = searchTerm.toLowerCase();
      const nameMatch = (r.employee_name || `EMP-${r.employee_id}`).toLowerCase().includes(query);
      const deptMatch = (r.department || '').toLowerCase().includes(query);
      let ratingMatch = true;
      if (ratingFilter === 'Excellent') ratingMatch = Number(r.rating) >= 5;
      else if (ratingFilter === 'Good') ratingMatch = Number(r.rating) === 4;
      else if (ratingFilter === 'Needs Improvement') ratingMatch = Number(r.rating) < 4;

      return (nameMatch || deptMatch) && ratingMatch;
    });
  }, [reviews, searchTerm, ratingFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        // Edit mode
        await updatePerformanceReview(form.id, form);
      } else {
        // Create mode
        await createPerformanceReview(form);
      }
      await loadData();
      setShowModal(false);
      setForm({ id: null, employee_id: '', kpi_score: '', attendance_score: '', targets_met: '', teamwork: '', rating: 'Excellent', appraisal: '' });
    } catch (err) {
      alert('Failed to log review.');
    }
  };

  const handleEdit = (r) => {
    setForm({
      id: r.id,
      employee_id: r.employee_id || '',
      kpi_score: r.kpi_score || 0,
      attendance_score: r.attendance_score || 0,
      targets_met: r.targets_met || 0,
      teamwork: r.teamwork || 0,
      rating: r.rating || 'Excellent',
      appraisal: r.appraisal || '0%'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this performance review?')) {
      try {
        await deletePerformanceReview(id);
        await loadData();
      } catch (err) {
        alert('Failed to delete review');
      }
    }
  };

  const handleView = (r) => {
    setViewingReview(r);
  };

  const getInitials = (name) => {
    if (!name) return 'PR';
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
    <div className="theme-performance container-fluid px-4 py-4" style={{
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

        /* FLOATING-ROW PERFORMANCE TABLE */
        .theme-performance table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-performance th {
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
        .theme-performance td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-performance tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-performance tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-performance tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-performance tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }

        .btn-action-icon {
          width: 32px !important; height: 32px !important; border-radius: 10px !important;
          border: none !important; display: inline-flex !important; align-items: center !important;
          justify-content: center !important; transition: all 0.2s ease !important; cursor: pointer !important;
        }
        .view-icon-btn { background-color: #ECFDF5 !important; color: #10B981 !important; }
        .view-icon-btn:hover { background-color: #10B981 !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important; transform: translateY(-1px); }
        .edit-icon-btn { background-color: #EFF6FF !important; color: #3B82F6 !important; }
        .edit-icon-btn:hover { background-color: #3B82F6 !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25) !important; transform: translateY(-1px); }
        .del-icon-btn { background-color: #FFF1F2 !important; color: #F43F5E !important; }
        .del-icon-btn:hover { background-color: #F43F5E !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25) !important; transform: translateY(-1px); }

        .emp-avatar-badge {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FFA36C 0%, #FF7A45 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)`, borderRadius: '14px' }}>
            {THIN_ICONS.trendingUp}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Performance Reviews</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">KPI scores, targets, ratings, and quarterly appraisal tracking.</p>
          </div>
        </div>
        {canManageHR && (
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus}
            <span>New Performance Review</span>
          </button>
        )}
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Team Avg Score', value: metrics.avgScore, sub: 'vs last quarter', icon: THIN_ICONS.trendingUp, color: COLORS.indigo },
          { label: 'Excellent', value: metrics.excellent, sub: 'Top performers', icon: THIN_ICONS.star, color: COLORS.emerald },
          { label: 'Good', value: metrics.good, sub: 'Meeting targets', icon: THIN_ICONS.thumbsUp, color: COLORS.amber },
          { label: 'Below Average', value: metrics.belowAvg, sub: 'Needs improvement', icon: THIN_ICONS.thumbsDown, color: COLORS.rose }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* REVIEWS TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative" style={{ minWidth: '260px' }}>
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 small"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
              />
            </div>
            <select
              className="form-select rounded-pill small px-3 text-muted"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              style={{ backgroundColor: '#FAF8FF', border: '1px solid #e5e0f5', width: '160px' }}
            >
              <option value="All">All Ratings</option>
              <option value="Excellent">5 Stars (Excellent)</option>
              <option value="Good">4 Stars (Good)</option>
              <option value="Needs Improvement">&lt; 4 Stars</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
            Loading performance reviews...
          </div>
        ) : (
          <div className="table-responsive p-4 pt-2">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>KPI Score</th>
                  <th>Attendance</th>
                  <th>Targets</th>
                  <th>Teamwork</th>
                  <th>Overall</th>
                  <th>Rating</th>
                  <th>Appraisal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-4" style={{ color: '#94a3b8' }}>No review records logged.</td></tr>
                ) : (
                  filteredReviews.map(r => {
                    const empName = r.employee_name || `Employee ${r.employee_id}`;
                    const ratingText = r.rating || 'Excellent';
                    let badge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.emerald}1A`, color: '#0f9488' }}>• Excellent</span>;
                    if (ratingText === 'Good') {
                      badge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.indigo}1A`, color: '#2563eb' }}>• Good</span>;
                    } else if (ratingText === 'Average' || ratingText === 'Needs Improvement') {
                      badge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.amber}22`, color: '#b45309' }}>• Average</span>;
                    }

                    const overallScore = Math.round((Number(r.kpi_score || 0) + Number(r.attendance_score || 0) + Number(r.targets_met || 0) + Number(r.teamwork || 0)) / 4);

                    return (
                      <tr key={r.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="emp-avatar-badge">{getInitials(empName)}</div>
                            <div className="fw-bold" style={{ color: '#1e293b' }}>{empName}</div>
                          </div>
                        </td>
                        <td>{r.department || 'Sales'}</td>
                        <td className="fw-bold">{r.kpi_score || 0}/100</td>
                        <td className="fw-bold text-success">{r.attendance_score || 0}%</td>
                        <td className="fw-bold">{r.targets_met || 0}%</td>
                        <td className="fw-bold text-primary">{r.teamwork || 0}/100</td>
                        <td>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${COLORS.emerald}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem' }}>
                            {overallScore}
                          </div>
                        </td>
                        <td>{badge}</td>
                        <td className="fw-bold" style={{ color: COLORS.emerald }}>{r.appraisal || '0%'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn-action-icon view-icon-btn" onClick={() => handleView(r)} title="View Review">{THIN_ICONS.eye}</button>
                            <button className="btn-action-icon edit-icon-btn" onClick={() => handleEdit(r)} title="Edit Review">{THIN_ICONS.edit}</button>
                            <button className="btn-action-icon del-icon-btn" onClick={() => handleDelete(r.id)} title="Delete Review">{THIN_ICONS.trash}</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL FOR NEW REVIEW */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title" style={{ color: '#1e293b' }}>Log Performance Review</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted">Select Employee</label>
                    <select className="form-select rounded-3" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required>
                      <option value="">Choose employee...</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.name || `EMP-${e.id}`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-uppercase text-muted">KPI SCORE (0-100)</label>
                      <input type="number" className="form-control rounded-3" value={form.kpi_score} onChange={e => setForm({...form, kpi_score: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-uppercase text-muted">ATTENDANCE SCORE</label>
                      <input type="number" className="form-control rounded-3" value={form.attendance_score} onChange={e => setForm({...form, attendance_score: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-uppercase text-muted">TARGETS MET</label>
                      <input type="number" className="form-control rounded-3" value={form.targets_met} onChange={e => setForm({...form, targets_met: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-uppercase text-muted">TEAMWORK</label>
                      <input type="number" className="form-control rounded-3" value={form.teamwork} onChange={e => setForm({...form, teamwork: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-uppercase text-muted">RATING</label>
                      <select className="form-select rounded-3" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})}>
                        <option>Excellent</option>
                        <option>Good</option>
                        <option>Average</option>
                        <option>Needs Improvement</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-uppercase text-muted">APPRAISAL %</label>
                      <input type="text" className="form-control rounded-3" value={form.appraisal} onChange={e => setForm({...form, appraisal: e.target.value})} />
                    </div>
                    <div className="col-12 mt-3">
                      <input type="text" className="form-control rounded-3 bg-light" readOnly value={`Overall Score = ${Math.round((Number(form.kpi_score || 0) + Number(form.attendance_score || 0) + Number(form.targets_met || 0) + Number(form.teamwork || 0)) / 4) || 0} / 100`} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn rounded-pill px-4 bg-white border" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn rounded-pill px-4 border-0 text-white fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                    Save Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOR VIEWING REVIEW */}
      {viewingReview && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title" style={{ color: '#1e293b' }}>Performance Review Details</h5>
                <button type="button" className="btn-close" onClick={() => setViewingReview(null)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="emp-avatar-badge" style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                    {getInitials(viewingReview.employee_name || `EMP-${viewingReview.employee_id}`)}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{viewingReview.employee_name || `Employee ${viewingReview.employee_id}`}</h5>
                    <div className="text-muted small">{viewingReview.department || 'Sales'}</div>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="text-muted small fw-bold text-uppercase mb-1">KPI Score</div>
                      <div className="fw-bold fs-5">{viewingReview.kpi_score || 85}/100</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="text-muted small fw-bold text-uppercase mb-1">Attendance</div>
                      <div className="fw-bold fs-5 text-success">{viewingReview.attendance_score || 96}%</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="text-muted small fw-bold text-uppercase mb-1">Targets Met</div>
                      <div className="fw-bold fs-5">{viewingReview.targets_met || 88}%</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="text-muted small fw-bold text-uppercase mb-1">Teamwork</div>
                      <div className="fw-bold fs-5">{viewingReview.teamwork || 84}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="text-muted small fw-bold text-uppercase mb-1">Rating</div>
                      <div className="fw-bold fs-5" style={{ color: COLORS.primary }}>{viewingReview.rating || 'Excellent'}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="text-muted small fw-bold text-uppercase mb-1">Appraisal</div>
                      <div className="fw-bold fs-5" style={{ color: COLORS.emerald }}>{viewingReview.appraisal || '10%'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceReviewsPage;