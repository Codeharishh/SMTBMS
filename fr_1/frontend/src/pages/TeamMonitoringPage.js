// src/pages/TeamMonitoringPage.js
import React, { useState, useMemo } from 'react';
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
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="7" r="4" />
      <path vectorEffect="non-scaling-stroke" d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path vectorEffect="non-scaling-stroke" d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  wifi: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path vectorEffect="non-scaling-stroke" d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path vectorEffect="non-scaling-stroke" d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  ),
  activity: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="22 12 18 12 15 21 9 3 6 12 2 12" />
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
  mapPin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="10" r="3" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <polyline vectorEffect="non-scaling-stroke" points="12 6 12 12 16 14" />
    </svg>
  )
};

const TeamMonitoringPage = () => {
  const user = getCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const teamMembers = [
    { id: 1, name: 'Arjun Sharma', role: 'Site Engineer', location: 'Site A - Block 3', status: 'Online', lastActive: 'Just now', tasksDone: 8, totalTasks: 10, initials: 'AS', color: '#3B82F6' },
    { id: 2, name: 'Priya Nair', role: 'Procurement Officer', location: 'Office', status: 'Online', lastActive: '2 min ago', tasksDone: 5, totalTasks: 7, initials: 'PN', color: '#8B5CF6' },
    { id: 3, name: 'Ravi Kumar', role: 'Warehouse Supervisor', location: 'Warehouse B', status: 'Idle', lastActive: '15 min ago', tasksDone: 3, totalTasks: 6, initials: 'RK', color: '#10B981' },
    { id: 4, name: 'Suresh Patel', role: 'Quality Inspector', location: 'Site C', status: 'Online', lastActive: 'Just now', tasksDone: 6, totalTasks: 8, initials: 'SP', color: '#F59E0B' },
    { id: 5, name: 'Deepa Verma', role: 'HR Coordinator', location: 'Office', status: 'Online', lastActive: '5 min ago', tasksDone: 9, totalTasks: 10, initials: 'DV', color: '#EC4899' },
    { id: 6, name: 'Vikram Singh', role: 'Logistics Lead', location: 'In Transit', status: 'Offline', lastActive: '2 hours ago', tasksDone: 2, totalTasks: 5, initials: 'VS', color: '#64748B' }
  ];

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(m => {
      const q = searchTerm.toLowerCase();
      const matchSearch = m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.location.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchTerm, statusFilter]);

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
    <div className="theme-team-monitoring container-fluid px-4 py-4" style={{
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
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 6px;
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex align-items-center gap-3 mb-4 pt-2">
        <div className="d-flex align-items-center justify-content-center fw-bold text-white rounded-3 shadow-sm"
          style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', borderRadius: '14px' }}>
          {THIN_ICONS.users}
        </div>
        <div>
          <h3 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
            Team Monitoring
            <span className="badge rounded-pill bg-success-subtle text-success px-3" style={{ fontSize: '0.65rem' }}>● Live Tracking</span>
          </h3>
          <p style={{ color: '#94a3b8' }} className="small mb-0">Real-time overview of your team's activity and performance.</p>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* TOP METRIC CARDS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'TOTAL MEMBERS', value: '6', sub: '4 Online · 1 Offline', icon: THIN_ICONS.users, color: COLORS.indigo },
          { label: 'ONLINE NOW', value: '4', sub: '1 Idle · 1 Offline', icon: THIN_ICONS.wifi, color: COLORS.emerald },
          { label: 'TASKS IN PROGRESS', value: '12', sub: '31 Completed · 7 Avg/Member', icon: THIN_ICONS.activity, color: COLORS.amber },
          { label: 'AVG. EFFICIENCY', value: '83%', sub: '100% Top Performer · 2 Need Attention', icon: THIN_ICONS.trendingUp, color: COLORS.violet }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTER CONTROL */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div className="position-relative flex-grow-1" style={{ maxWidth: '480px' }}>
          <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
          <input
            type="text"
            className="form-control rounded-pill ps-5 small py-2"
            placeholder="Search by name, role or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: '#ffffff', border: '1px solid #e5e0f5' }}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          {['All', 'Online', 'Idle', 'Offline'].map(st => (
            <button
              key={st}
              className={`btn btn-sm rounded-pill px-3 fw-bold ${statusFilter === st ? 'text-white' : 'bg-white text-dark border'}`}
              onClick={() => setStatusFilter(st)}
              style={{ background: statusFilter === st ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : undefined }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TEAM MEMBERS GRID CARDS */}
      <div className="row g-4">
        {filteredMembers.map(member => (
          <div key={member.id} className="col-12 col-md-6 col-xl-4">
            <div className="card border-0 p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                    style={{ width: '48px', height: '48px', borderRadius: '50%', background: member.color, fontSize: '1rem' }}>
                    {member.initials}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.05rem' }}>{member.name}</h6>
                    <small className="text-muted" style={{ fontSize: '0.8rem' }}>{member.role}</small>
                  </div>
                </div>
                <span className={`badge rounded-pill px-3 py-1 fw-bold ${member.status === 'Online' ? 'bg-success-subtle text-success' : member.status === 'Idle' ? 'bg-warning-subtle text-warning' : 'bg-secondary-subtle text-secondary'}`}>
                  ● {member.status}
                </span>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-3 text-muted small" style={{ fontSize: '0.8rem' }}>
                <span className="d-flex align-items-center gap-1">
                  {THIN_ICONS.mapPin} {member.location}
                </span>
                <span className="d-flex align-items-center gap-1">
                  {THIN_ICONS.clock} {member.lastActive}
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.78rem' }}>
                  <span className="fw-bold text-muted">Tasks Completion</span>
                  <span className="fw-bold text-primary">{member.tasksDone}/{member.totalTasks}</span>
                </div>
                <div className="progress" style={{ height: '7px', borderRadius: '10px', background: '#F1F5F9' }}>
                  <div className="progress-bar" role="progressbar"
                    style={{ width: `${(member.tasksDone / member.totalTasks) * 100}%`, background: `linear-gradient(90deg, ${member.color} 0%, #4FC3F7 100%)`, borderRadius: '10px' }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMonitoringPage;
