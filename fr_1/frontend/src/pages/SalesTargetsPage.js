// src/pages/SalesTargetsPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchEmployees } from '../services/employeeService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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
  target: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="6" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="2" />
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  trendingUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline vectorEffect="non-scaling-stroke" points="17 6 23 6 23 12" />
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

const SalesTargetsPage = () => {
  const user = getCurrentUser();
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);

  const defaultTargets = [
    { id: 1, name: 'Divya Pillai', role: 'Business Dev. Executive', target: 40, achieved: 31, unit: 'L', period: 'Q2 2026', pct: 78 },
    { id: 2, name: 'Kavya Menon', role: 'Sales Lead', target: 20, achieved: 20, unit: 'L', period: 'Q2 2026', pct: 100 },
    { id: 3, name: 'Arjun Sharma', role: 'Sales Executive', target: 35, achieved: 28, unit: 'L', period: 'Q2 2026', pct: 80 }
  ];

  const [targetsList, setTargetsList] = useState(defaultTargets);

  const emptyForm = { sales_person: '', name: '', role: 'Sr. Sales Executive', target: 50, achieved: 38, unit: 'L', period: 'Q2 2026' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchEmployees().then(res => {
      if (res && res.length) setEmployees(res);
    }).catch(() => { });
  }, []);

  const teamMetrics = useMemo(() => {
    const totalTarget = targetsList.reduce((acc, t) => acc + (Number(t.target) || 0), 0);
    const totalAchieved = targetsList.reduce((acc, t) => acc + (Number(t.achieved) || 0), 0);
    const onTrack = targetsList.filter(t => t.pct >= 70).length;
    return { totalTarget, totalAchieved, onTrack, total: targetsList.length };
  }, [targetsList]);

  const chartData = {
    labels: targetsList.map(t => t.name.split(' ')[0]),
    datasets: [
      {
        label: 'Target (₹ Lakhs)',
        data: targetsList.map(t => t.target),
        backgroundColor: COLORS.rose,
        borderRadius: 8
      },
      {
        label: 'Achieved (₹ Lakhs)',
        data: targetsList.map(t => t.achieved),
        backgroundColor: COLORS.emerald,
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } }
  };

  const handleOpenCreateModal = () => {
    setEditingTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleOpenEditModal = (t) => {
    setEditingTarget(t);
    setForm({
      sales_person: t.name,
      name: t.name,
      role: t.role || 'Sr. Sales Executive',
      target: t.target,
      achieved: t.achieved,
      unit: t.unit || 'L',
      period: t.period || 'Q2 2026'
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const displayName = form.name || form.sales_person || 'Sales Rep';
    const pct = Math.round((form.achieved / form.target) * 100);

    if (editingTarget) {
      const updated = {
        ...editingTarget,
        name: displayName,
        role: form.role,
        target: form.target,
        achieved: form.achieved,
        unit: form.unit,
        period: form.period,
        pct: pct
      };
      setTargetsList(targetsList.map(t => t.id === editingTarget.id ? updated : t));
    } else {
      const newT = {
        id: Date.now(),
        name: displayName,
        role: form.role,
        target: form.target,
        achieved: form.achieved,
        unit: form.unit,
        period: form.period,
        pct: pct
      };
      setTargetsList([...targetsList, newT]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this target record?')) return;
    setTargetsList(targetsList.filter(t => t.id !== id));
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
    <div className="theme-targets container-fluid px-4 py-4" style={{
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

        /* ── ACTION BUTTON STRUCTURAL OVERRIDES — MATCHES MaterialsPage.js ── */
        .theme-targets .btn-action-edit {
          background-color: #eff6ff !important;
          color: #3b82f6 !important;
          border: none !important;
          padding: 4px 8px !important;
          border-radius: 6px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .theme-targets .btn-action-del {
          background-color: #fff1f2 !important;
          color: #f43f5e !important;
          border: none !important;
          padding: 4px 8px !important;
          border-radius: 6px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .theme-targets .btn-action-edit:hover,
        .theme-targets .btn-action-del:hover {
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
            {THIN_ICONS.target}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Sales Targets</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Track quarterly sales goals and individual rep performance</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={handleOpenCreateModal}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus} Set Target
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Team Target', value: `${teamMetrics.totalTarget}L`, sub: 'Combined quarterly goal', icon: THIN_ICONS.target, color: COLORS.rose },
          { label: 'Team Achieved', value: `${teamMetrics.totalAchieved}L`, sub: 'Booked so far', icon: THIN_ICONS.checkCircle, color: COLORS.emerald },
          { label: `On Track (≥70%)`, value: `${teamMetrics.onTrack}/${teamMetrics.total}`, sub: 'Reps meeting pace', icon: THIN_ICONS.trendingUp, color: COLORS.indigo },
          { label: 'HRMS Employees', value: employees.length || 7, sub: 'Cross-linked records', icon: THIN_ICONS.users, color: COLORS.violet }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* CHART & REPS GRID */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
            <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>Target vs Achieved</h5>
            <div style={{ height: '300px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4 hover-premium-card h-100" style={{ borderRadius: '22px' }}>
            <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>Individual Rep Targets</h5>

            <div className="d-flex flex-column gap-3">
              {targetsList.map(item => (
                <div key={item.id} className="p-3 rounded-4 border" style={{ background: '#FAF8FF', borderColor: '#E5E0F5' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{item.name}</h6>
                      <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{item.role}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-extrabold" style={{ color: COLORS.emerald }}>{item.achieved}{item.unit || 'L'} / {item.target}{item.unit || 'L'}</span>
                      {/* EDIT AND DELETE ACTIONS */}
                      <button className="btn-action-edit" onClick={() => handleOpenEditModal(item)}>
                        {THIN_ICONS.edit}
                      </button>
                      <button className="btn-action-del" onClick={() => handleDelete(item.id)}>
                        {THIN_ICONS.trash}
                      </button>
                    </div>
                  </div>
                  <div className="progress" style={{ height: '7px', borderRadius: '10px', background: '#F1F5F9' }}>
                    <div className="progress-bar" role="progressbar" style={{ width: `${item.pct}%`, background: COLORS.emerald, borderRadius: '10px' }}></div>
                  </div>
                </div>
              ))}
              {targetsList.length === 0 && (
                <div className="text-center p-4" style={{ color: '#94a3b8' }}>No targets set yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT SALES TARGET MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg p-3" style={{ borderLeft: `4px solid ${COLORS.primary}` }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  {editingTarget ? (
                    <><span style={{ color: COLORS.indigo }}>{THIN_ICONS.edit}</span> Modify Sales Target</>
                  ) : (
                    <><span style={{ color: COLORS.indigo }}>{THIN_ICONS.target}</span> Set New Sales Target</>
                  )}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body py-3">
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>SALES PERSON *</label>
                      <select className="form-select rounded-3" value={form.sales_person} onChange={(e) => setForm({ ...form, sales_person: e.target.value, name: e.target.value })}>
                        <option value="">— Select —</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.name || emp.full_name}>{emp.name || emp.full_name}</option>
                        ))}
                        <option value="Divya Pillai">Divya Pillai</option>
                        <option value="Kavya Menon">Kavya Menon</option>
                        <option value="Arjun Sharma">Arjun Sharma</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>NAME</label>
                      <input type="text" className="form-control rounded-3" placeholder="Sales person name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>ROLE</label>
                      <input type="text" className="form-control rounded-3" placeholder="e.g. Sr. Sales Executive" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>TARGET AMOUNT</label>
                      <input type="number" className="form-control rounded-3" placeholder="e.g. 50" value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} required />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>ACHIEVED SO FAR</label>
                      <input type="number" className="form-control rounded-3" placeholder="e.g. 38" value={form.achieved} onChange={(e) => setForm({ ...form, achieved: Number(e.target.value) })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>UNIT</label>
                      <select className="form-select rounded-3" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                        <option value="L">L</option>
                        <option value="Cr">Cr</option>
                        <option value="K">K</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>PERIOD</label>
                      <input type="text" className="form-control rounded-3" placeholder="Q2 2026" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 gap-2">
                  <button type="submit" className="btn rounded-3 px-4 py-2 border-0 text-white fw-bold hover-btn-lux" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)`, flex: 1 }}>
                    {editingTarget ? 'Save Changes' : 'Set Target'}
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

export default SalesTargetsPage;