// src/pages/ProjectTrackingPage.js
import React, { useState, useMemo, useEffect } from 'react';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchProjects, createProject, updateProject, deleteProject } from '../services/managerService';

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
  building: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="4" y="9" width="7" height="12" />
      <rect vectorEffect="non-scaling-stroke" x="13" y="3" width="7" height="18" />
      <line vectorEffect="non-scaling-stroke" x1="7" y1="13" x2="7" y2="13.01" />
      <line vectorEffect="non-scaling-stroke" x1="7" y1="17" x2="7" y2="17.01" />
    </svg>
  ),
  activity: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  flag: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line vectorEffect="non-scaling-stroke" x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  trendingUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline vectorEffect="non-scaling-stroke" points="17 6 23 6 23 12" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="11" cy="11" r="8" />
      <line vectorEffect="non-scaling-stroke" x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  calendar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="2" x2="16" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="2" x2="8" y2="6" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="12" y1="5" x2="12" y2="19" />
      <line vectorEffect="non-scaling-stroke" x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  pencil: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path vectorEffect="non-scaling-stroke" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="3 6 5 6 21 6" />
      <path vectorEffect="non-scaling-stroke" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
};

const STATUS_STYLES = {
  Active: { bg: '#EFF6FF', color: '#3B82F6' },
  Nearing: { bg: '#F5F0FF', color: '#8B5CF6' },
  Planning: { bg: '#FEF3C7', color: '#B45309' },
  Completed: { bg: '#ECFDF5', color: '#047857' }
};

const defaultInitialProjects = [
  { id: 1, code: 'PRJ-001', name: 'Site A – Foundation Work', manager: 'Arjun Sharma', progress: 68, dates: 'Apr 1, 2026 – Jul 30, 2026', start_date: '2026-04-01', end_date: '2026-07-30', daysLeft: '7d left', status: 'Active', budget: '₹14.5L', badgeColor: '#3B82F6', description: 'Deep excavation, rebar framework and foundation concrete pour for Block 3.' },
  { id: 2, code: 'PRJ-002', name: 'Site B – Commercial Complex Structural Framing', manager: 'Priya Nair', progress: 85, dates: 'Feb 15, 2026 – Aug 15, 2026', start_date: '2026-02-15', end_date: '2026-08-15', daysLeft: '22d left', status: 'Active', budget: '₹42.0L', badgeColor: '#10B981', description: 'Structural steel columns erection and multi-floor slab casting.' },
  { id: 3, code: 'PRJ-003', name: 'Warehouse B – Roofing & Flooring Expansion', manager: 'Ravi Kumar', progress: 92, dates: 'Jan 10, 2026 – Jun 30, 2026', start_date: '2026-01-10', end_date: '2026-06-30', daysLeft: 'Nearing Completion', status: 'Nearing', budget: '₹18.2L', badgeColor: '#8B5CF6', description: 'Heavy duty epoxy flooring and thermal insulated roof sheeting.' },
  { id: 4, code: 'PRJ-004', name: 'Site C – Residential Tower Electrical Layout', manager: 'Suresh Patel', progress: 45, dates: 'May 1, 2026 – Nov 30, 2026', start_date: '2026-05-01', end_date: '2026-11-30', daysLeft: '128d left', status: 'Active', budget: '₹28.8L', badgeColor: '#F59E0B', description: 'Conduit piping, main distribution panels and sub-meter wiring.' }
];

const ProjectTrackingPage = () => {
  const user = getCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectsList, setProjectsList] = useState(defaultInitialProjects);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [projectForm, setProjectForm] = useState({
    name: '',
    code: '',
    manager: 'Arjun Sharma',
    progress: 0,
    status: 'Active',
    budget: '₹15.0L',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    description: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((p, idx) => ({
          id: p.id || idx + 1,
          code: p.code || `PRJ-00${p.id || idx + 1}`,
          name: p.name || 'Enterprise Project Node',
          manager: p.manager || 'Arjun Sharma',
          progress: Number(p.progress) || 0,
          dates: p.start_date ? `${p.start_date.split('T')[0]} – ${p.end_date ? p.end_date.split('T')[0] : 'Open'}` : 'Apr 1, 2026 – Jul 30, 2026',
          start_date: (p.start_date || '').split('T')[0] || '',
          end_date: (p.end_date || '').split('T')[0] || '',
          daysLeft: p.status === 'Completed' ? 'Completed' : 'On Track',
          status: p.status || 'Active',
          budget: p.budget || '₹20.0L',
          badgeColor: p.status === 'Nearing' ? '#8B5CF6' : p.status === 'Completed' ? '#10B981' : '#3B82F6',
          description: p.description || ''
        }));
        setProjectsList(formatted);
      }
    } catch (err) {
      console.warn('Using default projects matrix state:', err.message);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setProjectForm({
      name: '',
      code: `PRJ-00${projectsList.length + 1}`,
      manager: user?.name || 'Arjun Sharma',
      progress: 0,
      status: 'Active',
      budget: '₹15.0L',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (proj) => {
    setEditingProject(proj);
    setProjectForm({
      name: proj.name,
      code: proj.code,
      manager: proj.manager,
      progress: proj.progress,
      status: proj.status,
      budget: proj.budget || '₹15.0L',
      start_date: proj.start_date || new Date().toISOString().split('T')[0],
      end_date: proj.end_date || '',
      description: proj.description || ''
    });
    setShowModal(true);
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project entry?')) {
      try {
        await deleteProject(id).catch(() => null);
      } catch (err) {}
      setProjectsList(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    const formattedDates = `${projectForm.start_date || '2026-04-01'} – ${projectForm.end_date || 'Open'}`;
    const badgeColor = projectForm.status === 'Nearing' ? '#8B5CF6' : projectForm.status === 'Completed' ? '#10B981' : '#3B82F6';

    if (editingProject) {
      const updatedItem = {
        ...editingProject,
        ...projectForm,
        dates: formattedDates,
        badgeColor,
        daysLeft: projectForm.status === 'Completed' ? 'Completed' : projectForm.progress >= 90 ? 'Nearing Completion' : 'On Track'
      };
      try {
        await updateProject(editingProject.id, updatedItem).catch(() => null);
      } catch (err) {}
      setProjectsList(prev => prev.map(p => p.id === editingProject.id ? updatedItem : p));
    } else {
      const newItem = {
        id: Date.now(),
        ...projectForm,
        code: projectForm.code || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
        dates: formattedDates,
        badgeColor,
        daysLeft: 'Just Started'
      };
      try {
        await createProject(newItem).catch(() => null);
      } catch (err) {}
      setProjectsList(prev => [newItem, ...prev]);
    }
    setShowModal(false);
  };

  const filteredProjects = useMemo(() => {
    return projectsList.filter(p => {
      const q = searchTerm.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.manager.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projectsList, searchTerm, statusFilter]);

  const metricsSummary = useMemo(() => {
    const total = projectsList.length;
    const active = projectsList.filter(p => p.status === 'Active').length;
    const nearing = projectsList.filter(p => p.status === 'Nearing' || p.progress >= 90).length;
    const avgProgress = total ? Math.round(projectsList.reduce((acc, curr) => acc + (Number(curr.progress) || 0), 0) / total) : 0;
    return { total, active, nearing, avgProgress };
  }, [projectsList]);

  // ── METRIC CARD — MATCHES MaterialsPage.js EXACTLY ──
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
    <div className="theme-projects container-fluid px-4 py-4" style={{
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
          box-shadow: 0 6px 16px rgba(91, 141, 239, 0.28) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 6px;
        }
        .filter-pill {
          transition: all 0.2s ease !important;
          border: 1px solid #e5e0f5 !important;
        }
        .filter-pill:hover {
          filter: brightness(0.98);
        }

        /* Action Icon Buttons for Cards */
        .btn-card-action {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          transition: all 0.2s ease;
        }
        .btn-card-edit {
          background-color: #EFF6FF !important;
          color: #3B82F6 !important;
        }
        .btn-card-edit:hover {
          background-color: #3B82F6 !important;
          color: #ffffff !important;
        }
        .btn-card-delete {
          background-color: #FEF2F2 !important;
          color: #EF4444 !important;
        }
        .btn-card-delete:hover {
          background-color: #EF4444 !important;
          color: #ffffff !important;
        }
      `}</style>

      {/* MATCHED MODERN NAVIGATION HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.building}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
              Project Tracking
              <span className="badge rounded-pill bg-success-subtle text-success px-3" style={{ fontSize: '0.65rem' }}>● Live Updates</span>
            </h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Monitor progress, materials and milestones across all projects</p>
          </div>
        </div>

        <button
          className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2 ms-auto"
          onClick={handleOpenAddModal}
          style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
        >
          {THIN_ICONS.plus}
          <span>Add Project</span>
        </button>
      </div>

      <div className="section-eyebrow">Overview</div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Projects', value: `${metricsSummary.total}`, sub: `${metricsSummary.active} Active · ${metricsSummary.nearing} Nearing`, icon: THIN_ICONS.building, color: COLORS.indigo },
          { label: 'In Progress', value: `${metricsSummary.active}`, sub: 'On Track Projects', icon: THIN_ICONS.activity, color: COLORS.sky },
          { label: 'Nearing Completion', value: `${metricsSummary.nearing}`, sub: '>90% Progress Horizon', icon: THIN_ICONS.flag, color: COLORS.violet },
          { label: 'Avg. Progress', value: `${metricsSummary.avgProgress}%`, sub: 'Calculated Milestone Index', icon: THIN_ICONS.trendingUp, color: COLORS.emerald }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div className="position-relative flex-grow-1" style={{ maxWidth: '480px' }}>
          <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
          <input
            type="text"
            className="form-control rounded-pill ps-5 small py-2"
            placeholder="Search by project, code or manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: '#ffffff', border: '1px solid #e5e0f5' }}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          {['All', 'Active', 'Nearing', 'Planning', 'Completed'].map(st => (
            <button
              key={st}
              className={`filter-pill btn btn-sm rounded-pill px-3 fw-bold ${statusFilter === st ? 'text-white hover-btn-lux' : 'bg-white text-dark'}`}
              onClick={() => setStatusFilter(st)}
              style={{ background: statusFilter === st ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : '#ffffff', borderColor: statusFilter === st ? 'transparent' : '#e5e0f5' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* PROJECT TRACKING CARDS GRID */}
      <div className="row g-4">
        {filteredProjects.map(proj => {
          const statusStyle = STATUS_STYLES[proj.status] || STATUS_STYLES.Active;
          return (
            <div key={proj.id} className="col-12 col-md-6">
              <div className="card border-0 p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
                      style={{ width: '48px', height: '48px', borderRadius: '14px', background: proj.badgeColor || COLORS.indigo, fontSize: '0.9rem' }}>
                      {proj.code ? proj.code.replace('PRJ-', 'P') : 'P'}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.05rem' }}>{proj.name}</h6>
                      <small style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{proj.code} · Manager: {proj.manager}</small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="badge rounded-pill px-3 py-1 fw-bold flex-shrink-0" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                      ● {proj.status}
                    </span>
                    <button className="btn-card-action btn-card-edit ms-1" title="Edit Project" onClick={() => handleOpenEditModal(proj)}>
                      {THIN_ICONS.pencil}
                    </button>
                    <button className="btn-card-action btn-card-delete" title="Delete Project" onClick={() => handleDeleteProject(proj.id)}>
                      {THIN_ICONS.trash}
                    </button>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between mb-3" style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  <span className="d-flex align-items-center gap-1">
                    {THIN_ICONS.calendar} {proj.dates}
                  </span>
                  <span className="badge fw-bold px-2 py-1" style={{ background: '#FEF3C7', color: '#B45309' }}>
                    {proj.daysLeft || 'Active'}
                  </span>
                </div>

                {/* PROGRESS BAR */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.82rem' }}>
                    <span className="fw-bold" style={{ color: '#94a3b8' }}>Overall Progress</span>
                    <span className="fw-bold" style={{ color: COLORS.indigo }}>{proj.progress}%</span>
                  </div>
                  <div className="progress" style={{ height: '8px', borderRadius: '10px', background: '#F1F5F9' }}>
                    <div className="progress-bar" role="progressbar"
                      style={{ width: `${proj.progress}%`, background: `linear-gradient(90deg, ${proj.badgeColor || COLORS.indigo} 0%, ${COLORS.sky} 100%)`, borderRadius: '10px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredProjects.length === 0 && (
          <div className="col-12">
            <div className="card border-0 hover-premium-card p-5 text-center" style={{ borderRadius: '22px', color: '#94a3b8' }}>
              No projects match your search.
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT PROJECT MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  {editingProject ? '✏️ Edit Project Record' : '🏗️ Initialize New Project'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSaveProject}>
                <div className="modal-body py-3">
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>PROJECT NAME *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Site A - Foundation Work"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                        required
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>PROJECT CODE</label>
                      <input
                        type="text"
                        className="form-control rounded-3 fw-bold"
                        value={projectForm.code}
                        onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                        style={{ background: '#F0F7FF', border: '1px solid #CCE5FF', color: COLORS.indigo }}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>PROJECT MANAGER *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Arjun Sharma"
                        value={projectForm.manager}
                        onChange={(e) => setProjectForm({ ...projectForm, manager: e.target.value })}
                        required
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>STATUS</label>
                      <select
                        className="form-select rounded-3"
                        value={projectForm.status}
                        onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      >
                        <option value="Active">Active</option>
                        <option value="Nearing">Nearing Completion</option>
                        <option value="Planning">Planning</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>PROGRESS (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="form-control rounded-3"
                        value={projectForm.progress}
                        onChange={(e) => setProjectForm({ ...projectForm, progress: Number(e.target.value) })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>BUDGET OUTLAY</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. ₹25.0L"
                        value={projectForm.budget}
                        onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>START DATE</label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        value={projectForm.start_date}
                        onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>TARGET COMPLETION DATE</label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        value={projectForm.end_date}
                        onChange={(e) => setProjectForm({ ...projectForm, end_date: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>DESCRIPTION / GOALS</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="Outline project milestones, scope and target deliverables..."
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 d-flex gap-2">
                  <button type="button" className="btn flex-grow-1 rounded-3 py-2 bg-light border fw-bold text-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn flex-grow-1 rounded-3 py-2 border-0 text-white fw-bold shadow-sm hover-btn-lux" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                    {editingProject ? 'Save Changes' : 'Create Project'}
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

export default ProjectTrackingPage;