// src/pages/StockMonitoringPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { fetchMaterials } from '../services/materialService';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

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
  layers: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polygon vectorEffect="non-scaling-stroke" points="12 2 2 7 12 12 22 7 12 2" />
      <polyline vectorEffect="non-scaling-stroke" points="2 17 12 22 22 17" />
      <polyline vectorEffect="non-scaling-stroke" points="2 12 12 17 22 12" />
    </svg>
  ),
  trendingUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline vectorEffect="non-scaling-stroke" points="17 6 23 6 23 12" />
    </svg>
  ),
  alertTriangle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="9" x2="12" y2="13" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  xCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <line vectorEffect="non-scaling-stroke" x1="15" y1="9" x2="9" y2="15" />
      <line vectorEffect="non-scaling-stroke" x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="11" cy="11" r="8" />
      <line vectorEffect="non-scaling-stroke" x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  refresh: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 4 23 10 17 10" />
      <polyline vectorEffect="non-scaling-stroke" points="1 20 1 14 7 14" />
      <path vectorEffect="non-scaling-stroke" d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
};

const StockMonitoringPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await fetchMaterials();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching materials for stock monitoring:', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    let totalSKUs = materials.length;
    let healthy = 0;
    let lowStock = 0;
    let critical = 0;

    materials.forEach(item => {
      const q = Number(item.quantity || 0);
      if (q === 0) critical++;
      else if (q <= 10) lowStock++;
      else healthy++;
    });

    return { totalSKUs, healthy, lowStock, critical };
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(item => {
      const query = search.toLowerCase();
      return (
        (item.material_name || '').toLowerCase().includes(query) ||
        (item.category || '').toLowerCase().includes(query) ||
        (item.location || '').toLowerCase().includes(query)
      );
    });
  }, [materials, search]);

  // TREND CHART CONFIG
  const trendData = {
    labels: ['Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026'],
    datasets: [
      {
        label: 'In Stock',
        data: [680, 720, 700, 750, 690, 710],
        borderColor: COLORS.indigo,
        backgroundColor: 'rgba(91, 141, 239, 0.08)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Low Stock',
        data: [15, 12, 18, 10, 14, metrics.lowStock],
        borderColor: COLORS.amber,
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4
      },
      {
        label: 'Out of Stock',
        data: [5, 4, 6, 2, 3, metrics.critical],
        borderColor: COLORS.alert,
        backgroundColor: 'transparent',
        borderDash: [2, 2],
        tension: 0.4
      }
    ]
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 11 } } }
    },
    scales: {
      y: { grid: { color: 'rgba(15,23,42,0.04)' } },
      x: { grid: { display: false } }
    }
  };

  // DISTRIBUTION DONUT CHART
  const doughnutData = {
    labels: ['Healthy', 'Low Stock', 'Critical (Out)'],
    datasets: [
      {
        data: [metrics.healthy, metrics.lowStock, metrics.critical],
        backgroundColor: [COLORS.emerald, COLORS.amber, COLORS.alert],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }
    ]
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
    <div className="theme-stock container-fluid px-4 py-4" style={{
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

        /* STOCK HEALTH TABLE — SAME FLOATING-ROW REGISTER STYLE AS MaterialsPage */
        .theme-stock table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-stock th {
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
        .theme-stock td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-stock tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-stock tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-stock tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-stock tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.layers}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Stock Monitoring</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Live stock health alerts, trend analysis, and distribution overview across all locations</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn px-3 py-2 rounded-3 fw-semibold shadow-sm d-flex align-items-center gap-2 bg-white border"
            onClick={loadMaterials}
            style={{ borderColor: '#e5e0f5', color: '#475569' }}
          >
            {THIN_ICONS.refresh}
            <span>Refresh Stock</span>
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total SKUs', value: metrics.totalSKUs, sub: 'Unique ledger SKUs', icon: THIN_ICONS.layers, color: COLORS.indigo },
          { label: 'Healthy', value: metrics.healthy, sub: 'Comfortably stocked', icon: THIN_ICONS.trendingUp, color: COLORS.emerald },
          { label: 'Low Stock', value: metrics.lowStock, sub: 'Requires replenishment', icon: THIN_ICONS.alertTriangle, color: COLORS.amber },
          { label: 'Critical / Out', value: metrics.critical, sub: 'Zero stock on hand', icon: THIN_ICONS.xCircle, color: COLORS.rose }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4 h-100 hover-premium-card" style={{ borderRadius: '22px' }}>
            <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Stock Level Trend</h5>
            <p className="text-muted small mb-3" style={{ color: '#94a3b8' }}>Dec 2025 – May 2026</p>
            <div style={{ height: '260px', position: 'relative' }}>
              <Line data={trendData} options={trendOptions} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100 hover-premium-card text-center" style={{ borderRadius: '22px' }}>
            <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Current Stock Distribution</h5>
            <p className="text-muted small mb-3" style={{ color: '#94a3b8' }}>Health status share</p>
            <div style={{ height: '200px', position: 'relative' }}>
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              <div style={{ position: 'absolute', top: '48%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <h3 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{metrics.totalSKUs}</h3>
                <span className="small fw-bold" style={{ color: '#94a3b8' }}>TOTAL</span>
              </div>
            </div>
            <div className="d-flex justify-content-around mt-3 flex-wrap gap-2">
              <div><span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.emerald, display: 'inline-block', marginRight: 6 }}></span><span className="small fw-bold">Healthy: {metrics.healthy}</span></div>
              <div><span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.amber, display: 'inline-block', marginRight: 6 }}></span><span className="small fw-bold">Low: {metrics.lowStock}</span></div>
              <div><span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.alert, display: 'inline-block', marginRight: 6 }}></span><span className="small fw-bold">Out: {metrics.critical}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* STOCK HEALTH AUDIT TABLE */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Stock Health Audit Table</h5>
            <p className="small mb-0" style={{ color: '#94a3b8' }}>Real-time inventory levels across warehouse bins</p>
          </div>
          <div className="position-relative" style={{ minWidth: '260px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
            <input
              type="text"
              className="form-control rounded-pill ps-5 small"
              placeholder="Search stock..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
            Synchronizing live stock registries...
          </div>
        ) : (
          <div className="table-responsive p-4 pt-2">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Material Name</th>
                  <th>Category</th>
                  <th>On-Hand Qty</th>
                  <th>Location</th>
                  <th>Health Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4" style={{ color: '#94a3b8' }}>No matching stock items found.</td></tr>
                ) : (
                  filteredMaterials.map(item => {
                    const qty = Number(item.quantity || 0);
                    let statusBadge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.emerald}1A`, color: '#0f9488' }}>Healthy Stock</span>;
                    if (qty === 0) {
                      statusBadge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.alert}1A`, color: '#dc2626' }}>Critical (Out of Stock)</span>;
                    } else if (qty <= 10) {
                      statusBadge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.amber}22`, color: '#b45309' }}>Low Stock Alert</span>;
                    }

                    return (
                      <tr key={item.id}>
                        <td className="fw-bold" style={{ color: COLORS.primary }}>{item.material_code || `MAT-${String(item.id).padStart(3, '0')}`}</td>
                        <td className="fw-semibold" style={{ color: '#1e293b' }}>{item.material_name}</td>
                        <td>{item.category || 'General'}</td>
                        <td className="fw-medium">{qty} units</td>
                        <td>{item.location || 'Warehouse Main'}</td>
                        <td>{statusBadge}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockMonitoringPage;