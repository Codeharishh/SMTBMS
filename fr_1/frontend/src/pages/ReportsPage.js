// src/pages/ReportsPage.js
import React from 'react';
import { getCurrentUser } from '../utils/authHelpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const ReportsPage = () => {
  const user = getCurrentUser();

  const stats = {
    totalUsers: 31,
    totalEmployees: 13,
    totalCustomers: 4,
    totalMaterials: 14,
    lowStockCount: 5,
    topItem: "Gold",
    revenue: 10000.00,
    retention: 80
  };

  const demographicsData = {
    labels: ['Total Users', 'Staff Workspace', 'Active Clients', 'SKU Materials'],
    datasets: [
      {
        data: [stats.totalUsers, stats.totalEmployees, stats.totalCustomers, stats.totalMaterials],
        backgroundColor: [
          'rgba(54, 162, 235, 0.85)',
          'rgba(75, 192, 192, 0.85)',
          'rgba(255, 206, 86, 0.85)',
          'rgba(153, 102, 255, 0.85)'
        ],
        borderColor: ['#fff', '#fff', '#fff', '#fff'],
        borderWidth: 2,
        hoverOffset: 12,
      },
    ],
  };

  const revenueTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        fill: true,
        label: 'Gross Financial Influx (₹)',
        data: [4000, 5500, 4800, 7200, 8500, stats.revenue],
        borderColor: 'rgb(46, 204, 113)',
        backgroundColor: 'rgba(46, 204, 113, 0.15)',
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointHoverRadius: 8,
      },
    ],
  };

  const materialStockData = {
    labels: ['Gold Plating', 'Silver Alloy', 'Copper Wire', 'Quartz Resins', 'Alum Shells'],
    datasets: [
      {
        label: 'Current On-Hand Stock (Units)',
        data: [85, 42, 12, 64, 9],
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        borderRadius: 8,
        barThickness: 28,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { weight: '600' } } },
    },
  };

  return (
    <div className="theme-admin container-fluid px-4 py-4" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>

      {/* CORE CSS MICRO-SURFACE HOVER INTERACTION HOOKS */}
      <style>{`
        .hover-premium-card {
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease-in-out !important;
        }
        .hover-premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 22px rgba(0,0,0,0.06) !important;
        }
        .hover-btn-lux {
          transition: transform 0.15s ease, filter 0.15s ease !important;
        }
        .hover-btn-lux:hover {
          transform: scale(1.02);
          filter: brightness(1.05);
        }
      `}</style>

      {/* HEADER HERO METRIC STRIP */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h4 className="fw-bold text-dark mb-1">📊 Enterprise Business Intelligence</h4>
          <p className="text-muted small mb-0">Welcome back, <span className="text-primary fw-semibold">{user?.name || 'Admin'}</span> • System Status Tracking Terminal</p>
        </div>
        <button className="btn btn-primary rounded-3 px-3.5 fw-semibold shadow-sm hover-btn-lux" onClick={() => window.print()}>
          📥 Export Executive Report
        </button>
      </div>

      {/* TOP-LEVEL MACRO PERFORMANCE METRIC FLASH CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-primary border-4 hover-premium-card">
            <span className="text-muted small fw-bold text-uppercase tracking-wider">Total System Revenue</span>
            <h3 className="fw-extrabold text-dark mt-1 mb-1">₹{stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            <span className="text-success small fw-medium">▲ Live performance tracking tracking stream</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-success border-4 hover-premium-card">
            <span className="text-muted small fw-bold text-uppercase tracking-wider">Customer Retention</span>
            <h3 className="fw-extrabold text-dark mt-1 mb-1">{stats.retention}%</h3>
            <span className="text-muted small fw-medium">Strength of consecutive engagements</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-danger border-4 hover-premium-card">
            <span className="text-muted small fw-bold text-uppercase tracking-wider">Inventory Low Stock Alerts</span>
            <h3 className="fw-extrabold text-danger mt-1 mb-1">{stats.lowStockCount} Items</h3>
            <span className="text-danger small fw-medium">Requires procurement routing action</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-warning border-4 hover-premium-card">
            <span className="text-muted small fw-bold text-uppercase tracking-wider">Top Inventory Supply Asset</span>
            <h3 className="fw-extrabold text-dark mt-1 mb-1 text-truncate">{stats.topItem}</h3>
            <span className="text-muted small fw-medium">Vendor connection link validated</span>
          </div>
        </div>
      </div>

      {/* GRID CONTAINER FOR INTERACTIVE GRAPHICAL CHARTS */}
      <div className="row g-4">
        {/* CHART ROW CARD 1 */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 hover-premium-card">
            <div className="mb-3">
              <h5 className="fw-bold text-dark mb-0">Gross Revenue Growth Trend Analysis</h5>
              <small className="text-muted">Itemized progression tracking scaling metrics</small>
            </div>
            <div className="p-2" style={{ maxHeight: '320px' }}>
              <Line data={revenueTrendData} options={commonOptions} />
            </div>
          </div>
        </div>

        {/* CHART ROW CARD 2 */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 hover-premium-card">
            <div className="mb-3">
              <h5 className="fw-bold text-dark mb-0">System Summary Ratio Mix</h5>
              <small className="text-muted">Database records tracking structural ratio spread</small>
            </div>
            <div className="p-3 d-flex align-items-center justify-content-center" style={{ maxHeight: '280px' }}>
              <Doughnut data={demographicsData} options={commonOptions} />
            </div>
          </div>
        </div>

        {/* CHART ROW CARD 3 */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white hover-premium-card">
            <div className="mb-3">
              <h5 className="fw-bold text-dark mb-0">Inventory Asset Storage Optimization Ledger</h5>
              <small className="text-muted">On-hand visual warning benchmarks outlining low volume supply lines</small>
            </div>
            <div className="p-2" style={{ maxHeight: '350px' }}>
              <Bar
                data={materialStockData}
                options={{
                  ...commonOptions,
                  scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f3f5' } },
                    x: { grid: { display: false } }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ReportsPage;