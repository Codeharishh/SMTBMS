// src/pages/EmployeeProjectsPage.js
import React, { useState, useEffect } from 'react';
import { fetchProjects } from '../services/managerService';

const COLORS = {
  indigo: '#5B8DEF',
  sky: '#4FC3F7',
  violet: '#9B7EDE',
  emerald: '#2ED9C3',
  slate: '#64748B',
  primary: '#FF7A45',
  amber: '#FFC542'
};

const THIN_ICONS = {
  folder: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  arrowLeft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
};

const DEFAULT_PROJECTS = [
  {
    id: 1,
    name: 'Billing System v2',
    category: 'Engineering',
    status: 'Active',
    description: 'Redesign of the billing and invoicing module with new payment gateway integration.',
    progress: 72,
    dueDate: '30 Jun 2026',
    startDate: '01 Apr 2026',
    manager: 'Arjun Mehta',
    role: 'Jr. Engineer',
    priority: 'High',
    tasksDone: 13,
    totalTasks: 18,
    color: '#3b82f6',
    members: [
      { initials: 'RA', name: 'Ritu Agarwal', bg: '#10b981' },
      { initials: 'DJ', name: 'Deepak Joshi', bg: '#06b6d4' },
      { initials: 'MI', name: 'Meera Iyer', bg: '#f59e0b' }
    ]
  },
  {
    id: 2,
    name: 'Auth Service Overhaul',
    category: 'IT',
    status: 'Active',
    description: 'OAuth 2.0 + SSO implementation across all SMTBMS modules.',
    progress: 45,
    dueDate: '15 Jul 2026',
    startDate: '10 May 2026',
    manager: 'Arjun Mehta',
    role: 'Backend Dev',
    priority: 'Medium',
    tasksDone: 9,
    totalTasks: 20,
    color: '#8b5cf6',
    members: [
      { initials: 'RA', name: 'Ritu Agarwal', bg: '#10b981' },
      { initials: 'KP', name: 'Karan Patel', bg: '#ec4899' }
    ]
  },
  {
    id: 3,
    name: 'Dashboard Revamp',
    category: 'Engineering',
    status: 'Active',
    description: 'Full UX overhaul of the employee and manager dashboards with modern data viz.',
    progress: 30,
    dueDate: '31 Jul 2026',
    startDate: '01 Jun 2026',
    manager: 'Pooja Gupta',
    role: 'UI Designer',
    priority: 'High',
    tasksDone: 6,
    totalTasks: 20,
    color: '#06b6d4',
    members: [
      { initials: 'RA', name: 'Ritu Agarwal', bg: '#10b981' },
      { initials: 'DJ', name: 'Deepak Joshi', bg: '#06b6d4' }
    ]
  },
  {
    id: 4,
    name: 'Legacy Migration',
    category: 'Infrastructure',
    status: 'Completed',
    description: 'Cloud server migration from local VMs to scalable cloud nodes.',
    progress: 100,
    dueDate: '15 May 2026',
    startDate: '01 Jan 2026',
    manager: 'Devansh Verma',
    role: 'DevOps Tech',
    priority: 'Low',
    tasksDone: 25,
    totalTasks: 25,
    color: '#10b981',
    members: [
      { initials: 'RA', name: 'Ritu Agarwal', bg: '#10b981' }
    ]
  }
];

const EmployeeProjectsPage = () => {
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectsList, setProjectsList] = useState(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((p, idx) => ({
          id: p.id || idx + 1,
          name: p.name || 'Enterprise Contributor Node',
          category: p.code || 'Operations',
          status: p.status || 'Active',
          description: p.description || 'Assigned active module project under manager tracking.',
          progress: Number(p.progress) || 0,
          dueDate: p.end_date ? p.end_date.split('T')[0] : '30 Jun 2026',
          startDate: p.start_date ? p.start_date.split('T')[0] : '01 Apr 2026',
          manager: p.manager || 'Arjun Sharma',
          role: 'Contributor',
          priority: p.progress > 80 ? 'High' : 'Normal',
          tasksDone: Math.round((Number(p.progress) || 0) * 0.2),
          totalTasks: 20,
          color: p.status === 'Completed' ? '#10b981' : p.status === 'Nearing' ? '#8b5cf6' : '#3b82f6',
          members: [
            { initials: 'RA', name: 'Ritu Agarwal', bg: '#10b981' },
            { initials: 'AS', name: p.manager || 'Arjun Sharma', bg: '#3b82f6' }
          ]
        }));
        setProjectsList(formatted);
      }
    } catch (err) {
      console.warn('Syncing live manager projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projectsList.filter(p => {
    if (filter === 'All') return true;
    return p.status === filter;
  });

  const activeCount = projectsList.filter(p => p.status === 'Active').length;
  const completedCount = projectsList.filter(p => p.status === 'Completed').length;
  const avgProgress = projectsList.length > 0
    ? Math.round(projectsList.reduce((acc, p) => acc + p.progress, 0) / projectsList.length)
    : 0;

  return (
    <div className="container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', fontFamily: '"Inter", sans-serif', color: '#1e293b'
    }}>

      {/* MATCHED MATERIALS PAGE STANDARD BLUE GRADIENT HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.folder}
          </div>
          <div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Project Contributor Hub</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Assigned enterprise project workflows synced with Manager Workspace</p>
          </div>
        </div>
      </div>

      {/* DETAILED PROJECT VIEW */}
      {selectedProject ? (
        <div>
          <button
            className="btn btn-sm btn-light fw-bold px-3 py-2 rounded-3 shadow-sm mb-4 border d-inline-flex align-items-center gap-2 text-primary"
            onClick={() => setSelectedProject(null)}
          >
            {THIN_ICONS.arrowLeft} Back to Projects
          </button>

          <div className="card border-0 shadow-sm p-4 hover-premium-card" style={{ borderRadius: '22px', backgroundColor: '#ffffff' }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 border-bottom pb-4 mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge px-3 py-1.5 rounded-pill fw-semibold" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                    {selectedProject.category}
                  </span>
                  <span className="badge px-3 py-1.5 rounded-pill fw-semibold" style={{ background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0' }}>
                    ● {selectedProject.status}
                  </span>
                </div>
                <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>{selectedProject.name}</h3>
                <p className="text-muted mb-0 small">{selectedProject.description}</p>
              </div>
              <div className="text-md-end">
                <span className="fw-extrabold display-6 text-primary" style={{ letterSpacing: '-1px' }}>{selectedProject.progress}%</span>
                <span className="d-block text-muted small fw-semibold">Overall Progress</span>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="progress mb-4" style={{ height: '8px', borderRadius: '10px', backgroundColor: '#f1f5f9' }}>
              <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${selectedProject.progress}%`, backgroundColor: selectedProject.color }}></div>
            </div>

            {/* METRICS GRID */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-md">
                <div className="p-3 rounded-4" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <small className="d-block text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '0.65rem' }}>Project Manager</small>
                  <strong className="text-dark d-block">{selectedProject.manager}</strong>
                </div>
              </div>
              <div className="col-6 col-md">
                <div className="p-3 rounded-4" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <small className="d-block text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '0.65rem' }}>My Role</small>
                  <strong className="text-dark d-block">{selectedProject.role}</strong>
                </div>
              </div>
              <div className="col-6 col-md">
                <div className="p-3 rounded-4" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <small className="d-block text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '0.65rem' }}>Start Date</small>
                  <strong className="text-dark d-block">{selectedProject.startDate}</strong>
                </div>
              </div>
              <div className="col-6 col-md">
                <div className="p-3 rounded-4" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <small className="d-block text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '0.65rem' }}>End Date</small>
                  <strong className="text-dark d-block">{selectedProject.dueDate}</strong>
                </div>
              </div>
              <div className="col-6 col-md">
                <div className="p-3 rounded-4" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <small className="d-block text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '0.65rem' }}>Tasks Done</small>
                  <strong className="text-dark d-block">{selectedProject.tasksDone} / {selectedProject.totalTasks}</strong>
                </div>
              </div>
            </div>

            {/* TEAM MEMBERS LIST */}
            <div>
              <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>Team Members</h6>
              <div className="d-flex flex-wrap gap-2">
                {selectedProject.members.map((m, i) => (
                  <div key={i} className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill border bg-white shadow-sm">
                    <span className="d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '26px', height: '26px', borderRadius: '50%', background: m.bg, fontSize: '0.7rem' }}>
                      {m.initials}
                    </span>
                    <span className="small fw-semibold text-dark">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* OVERVIEW DASHBOARD LIST VIEW */
        <div>
          {/* FILTER PILLS MATRIX */}
          <div className="d-flex align-items-center gap-2 mb-4">
            {['All', 'Active', 'Completed', 'On Hold'].map(tab => (
              <button
                key={tab}
                className={`btn btn-sm px-4 py-2 rounded-pill fw-semibold ${filter === tab ? 'btn-primary text-white shadow-sm' : 'btn-light border text-muted'}`}
                style={filter === tab ? { background: '#2563eb', borderColor: '#2563eb' } : { backgroundColor: '#ffffff' }}
                onClick={() => setFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* PROJECT CARDS GRID */}
          <div className="row g-4">
            {filteredProjects.map(p => (
              <div key={p.id} className="col-12 col-md-6 col-xl-4">
                <div
                  className="card border-0 shadow-sm p-4 h-100 hover-premium-card"
                  style={{ borderRadius: '22px', backgroundColor: '#ffffff', cursor: 'pointer' }}
                  onClick={() => setSelectedProject(p)}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge px-3 py-1 rounded-pill small fw-semibold" style={{ background: '#eff6ff', color: '#2563eb' }}>{p.category}</span>
                      <span className="badge px-2.5 py-1 rounded-pill small fw-semibold" style={{ background: '#ecfdf5', color: '#10b981' }}>● {p.status}</span>
                    </div>
                    <span className="d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', borderRadius: '12px', background: `${p.color}15`, color: p.color }}>
                      {THIN_ICONS.folder}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{p.name}</h5>
                  <p className="text-muted small mb-4 flex-grow-1" style={{ minHeight: '40px', lineHeight: 1.4 }}>{p.description}</p>

                  {/* PROGRESS BAR */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>Progress</span>
                      <span style={{ color: p.color }}>{p.progress}%</span>
                    </div>
                    <div className="progress" style={{ height: '6px', borderRadius: '10px', backgroundColor: '#f1f5f9' }}>
                      <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${p.progress}%`, backgroundColor: p.color }}></div>
                    </div>
                  </div>

                  {/* FOOTER MEMBERS & DUE DATE */}
                  <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                    <div className="d-flex align-items-center gap-1">
                      {p.members.map((m, i) => (
                        <span key={i} className="d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '24px', height: '24px', borderRadius: '50%', background: m.bg, fontSize: '0.65rem', border: '2px solid #fff' }}>
                          {m.initials}
                        </span>
                      ))}
                    </div>
                    <span className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                      {THIN_ICONS.clock} {p.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProjectsPage;
