// src/pages/SalesPipelineOverviewPage.js
import React, { useMemo } from 'react';

// ── SAME PALETTE AS MaterialsPage.js FOR VISUAL CONSISTENCY ────────────────
const COLORS = {
  indigo: '#5B8DEF',
  emerald: '#2ED9C3',
  amber: '#FFC542',
  rose: '#FF6B9D',
  sky: '#4FC3F7',
  violet: '#9B7EDE',
  slate: '#64748B',
  primary: '#FF7A45'
};

// ── CRISP-OPTIMIZED VECTOR SVG MATRIX FOR METRIC CARDS ────────────────────
const THIN_ICONS = {
  barChart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="12" y1="20" x2="12" y2="10" />
      <line vectorEffect="non-scaling-stroke" x1="18" y1="20" x2="18" y2="4" />
      <line vectorEffect="non-scaling-stroke" x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  trendingUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline vectorEffect="non-scaling-stroke" points="17 6 23 6 23 12" />
    </svg>
  ),
  rupee: (
    <span style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>₹</span>
  ),
  award: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="8" r="7" />
      <polyline vectorEffect="non-scaling-stroke" points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  target: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="6" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="2" />
    </svg>
  )
};

const STAGE_STYLES = {
  Negotiation: { bg: '#F5F0FF', color: '#8B5CF6' },
  'Proposal Sent': { bg: '#FEF3C7', color: '#B45309' },
  Contacted: { bg: '#E0F2FE', color: '#0369A1' },
  Qualified: { bg: '#D1FAE5', color: '#047857' },
  New: { bg: '#EFF6FF', color: '#3B82F6' },
  'Closed Won': { bg: '#D1FAE5', color: '#047857' }
};

const SalesPipelineOverviewPage = () => {
  const funnelStages = [
    { name: 'New', count: '12 deals', val: '₹580K', pct: 95, color: COLORS.indigo },
    { name: 'Contacted', count: '9 deals', val: '₹420K', pct: 75, color: COLORS.sky },
    { name: 'Qualified', count: '7 deals', val: '₹310K', pct: 58, color: COLORS.emerald },
    { name: 'Proposal Sent', count: '5 deals', val: '₹240K', pct: 40, color: COLORS.amber },
    { name: 'Negotiation', count: '3 deals', val: '₹180K', pct: 24, color: COLORS.violet },
    { name: 'Closed Won', count: '2 deals', val: '₹120K', pct: 15, color: COLORS.emerald }
  ];

  const topOpportunities = [
    { initial: 'S', company: 'SkyLine Developers', owner: 'Sales Team', stage: 'Negotiation', val: '₹450K', prob: '90% probability' },
    { initial: 'G', company: 'Greenfield Infra', owner: 'Manager', stage: 'Proposal Sent', val: '₹310K', prob: '75% probability' },
    { initial: 'M', company: 'Metro Projects', owner: 'Sales Team', stage: 'Contacted', val: '₹200K', prob: '45% probability' },
    { initial: 'H', company: 'Horizon Housing', owner: 'Sales Team', stage: 'Qualified', val: '₹120K', prob: '60% probability' }
  ];

  return (
    <div className="theme-pipeline container-fluid px-4 py-4" style={{
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
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 6px;
        }
        .avatar-circle {
          width: 38px; height: 38px; border-radius: 50%;
          background: #EBF4FF; color: #3B82F6; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
      `}</style>

      {/* MATCHED MODERN NAVIGATION HEADER */}
      <div className="d-flex align-items-center gap-3 mb-4 pt-2">
        <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
          style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
          {THIN_ICONS.barChart}
        </div>
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Sales Pipeline Overview</h3>
          <p style={{ color: '#94a3b8' }} className="small mb-0">Track opportunities, deal progress, and revenue forecasts</p>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Pipeline Value', value: '₹1.73M', sub: '↑ 24% vs last month', icon: THIN_ICONS.barChart, color: COLORS.indigo },
          { label: 'Deals in Pipeline', value: '38', sub: '↑ 11% vs last month', icon: THIN_ICONS.trendingUp, color: COLORS.sky },
          { label: 'Avg. Deal Size', value: '₹46K', sub: '↑ 9% vs last month', icon: THIN_ICONS.rupee, color: COLORS.violet },
          { label: 'Win Rate', value: '54%', sub: '↑ 6% vs last month', icon: THIN_ICONS.award, color: COLORS.emerald }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 h-100 metric-card-lux p-3" style={{ borderRadius: '22px', background: '#ffffff' }}>
              <div className="d-flex align-items-start gap-2">
                <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: '#ffffff', color: card.color, fontSize: '1.1rem',
                    border: `2px solid ${card.color}40`
                  }}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="mb-0 fw-bold" style={{ color: '#1e293b', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>{card.value}</h3>
                  <span className="d-block fw-semibold" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{card.label}</span>
                </div>
              </div>
              <div className="pt-2">
                <small className="fw-medium" style={{ fontSize: '0.66rem', color: COLORS.emerald }}>{card.sub}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FUNNEL CARD */}
      <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card" style={{ borderRadius: '22px' }}>
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
          <span style={{ color: COLORS.indigo }}>{THIN_ICONS.barChart}</span> Sales Pipeline — Stage Funnel
        </h5>
        <div className="d-flex flex-column gap-3">
          {funnelStages.map((st, i) => (
            <div key={i}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold small d-flex align-items-center gap-2">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.color }}></span>
                  {st.name} <span className="fw-normal" style={{ color: '#94a3b8' }}>({st.count})</span>
                </span>
                <span className="fw-bold" style={{ color: '#1e293b' }}>{st.val}</span>
              </div>
              <div className="progress" style={{ height: '8px', borderRadius: '10px', background: '#F1F5F9' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${st.pct}%`, background: st.color, borderRadius: '10px' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ROW: CHARTS & OPPORTUNITIES */}
      <div className="row g-4 mb-4">
        {/* REVENUE TREND */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100 hover-premium-card" style={{ borderRadius: '22px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Monthly Revenue Trend</h6>
                <small style={{ color: '#94a3b8' }}>Track revenue and delivered amount</small>
              </div>
              <select className="form-select form-select-sm rounded-pill px-3" style={{ width: '110px' }}>
                <option>This Year</option>
              </select>
            </div>
            <div className="d-flex gap-3 mb-3">
              <div className="p-2 px-3 rounded-3 flex-grow-1" style={{ background: '#EFF6FF' }}>
                <small style={{ color: '#94a3b8' }} className="d-block">Total Revenue</small>
                <span className="fw-bold" style={{ color: COLORS.indigo }}>₹3.62L <small style={{ color: COLORS.emerald }}>▲ 18.5%</small></span>
              </div>
              <div className="p-2 px-3 rounded-3 flex-grow-1" style={{ background: '#ECFDF5' }}>
                <small style={{ color: '#94a3b8' }} className="d-block">Total Delivered</small>
                <span className="fw-bold" style={{ color: COLORS.emerald }}>₹1.24L <small style={{ color: COLORS.emerald }}>▲ 21.3%</small></span>
              </div>
            </div>
            {/* SIMULATED BAR CHART */}
            <div className="d-flex align-items-end justify-content-between h-100 pt-4" style={{ minHeight: '140px' }}>
              {[
                { month: 'Jan', rev: 40, del: 20 },
                { month: 'Feb', rev: 60, del: 35 },
                { month: 'Mar', rev: 50, del: 30 },
                { month: 'Apr', rev: 80, del: 45 },
                { month: 'May', rev: 70, del: 40 },
                { month: 'Jun', rev: 95, del: 60 }
              ].map((m, i) => (
                <div key={i} className="d-flex flex-column align-items-center gap-1">
                  <div className="d-flex align-items-end gap-1" style={{ height: '100px' }}>
                    <div style={{ height: `${m.rev}%`, width: '14px', background: COLORS.indigo, borderRadius: '4px' }}></div>
                    <div style={{ height: `${m.del}%`, width: '14px', background: COLORS.emerald, borderRadius: '4px' }}></div>
                  </div>
                  <small style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{m.month}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LEAD SOURCE DISTRIBUTION */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100 hover-premium-card" style={{ borderRadius: '22px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Lead Source Distribution</h6>
                <small style={{ color: '#94a3b8' }}>Analyze lead channels</small>
              </div>
              <select className="form-select form-select-sm rounded-pill px-3" style={{ width: '120px' }}>
                <option>This Month</option>
              </select>
            </div>
            <div className="d-flex gap-3 mb-3">
              <div className="p-2 px-3 rounded-3 flex-grow-1" style={{ background: '#EFF6FF' }}>
                <small style={{ color: '#94a3b8' }} className="d-block">Total Leads</small>
                <span className="fw-bold" style={{ color: COLORS.indigo }}>95 <small style={{ color: COLORS.emerald }}>▲ 12.6%</small></span>
              </div>
              <div className="p-2 px-3 rounded-3 flex-grow-1" style={{ background: '#ECFDF5' }}>
                <small style={{ color: '#94a3b8' }} className="d-block">Conversion Rate</small>
                <span className="fw-bold" style={{ color: COLORS.emerald }}>24.7% <small style={{ color: COLORS.emerald }}>▲ 6.8%</small></span>
              </div>
            </div>
            {/* SIMULATED BAR CHART */}
            <div className="d-flex align-items-end justify-content-between h-100 pt-4" style={{ minHeight: '140px' }}>
              {[
                { source: 'Website', val: 85, color: COLORS.indigo },
                { source: 'LinkedIn', val: 65, color: COLORS.sky },
                { source: 'Cold Call', val: 45, color: COLORS.violet },
                { source: 'Referral', val: 55, color: COLORS.emerald },
                { source: 'Other', val: 35, color: COLORS.amber }
              ].map((s, i) => (
                <div key={i} className="d-flex flex-column align-items-center gap-1">
                  <div style={{ height: `${s.val}px`, width: '22px', background: s.color, borderRadius: '6px' }}></div>
                  <small style={{ color: '#94a3b8', fontSize: '0.68rem' }}>{s.source}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TOP OPEN OPPORTUNITIES */}
      <div className="card border-0 shadow-sm p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
          <span style={{ color: COLORS.indigo }}>{THIN_ICONS.target}</span> Top Open Opportunities
        </h6>
        <div className="d-flex flex-column gap-2">
          {topOpportunities.map((op, i) => {
            const stageStyle = STAGE_STYLES[op.stage] || STAGE_STYLES.New;
            return (
              <div key={i} className="p-3 rounded-3 d-flex align-items-center justify-content-between" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle">{op.initial}</div>
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{op.company}</h6>
                    <small style={{ color: '#94a3b8' }}>Owner: {op.owner}</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-4">
                  <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: stageStyle.bg, color: stageStyle.color }}>{op.stage}</span>
                  <div className="text-end">
                    <span className="fw-bold d-block" style={{ color: COLORS.emerald }}>{op.val}</span>
                    <small style={{ color: '#94a3b8' }}>{op.prob}</small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SalesPipelineOverviewPage;