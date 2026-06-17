// src/pages/FollowUps.js
import React, { useState } from 'react';

// Static array data for communication entries
const initialAlerts = [
  { id: 1, lead: 'Acme Industries', contactType: 'Phone', time: '09:30 AM', status: 'Overdue', communication: 'Follow-up call after demo' },
  { id: 2, lead: 'Nova Retail', contactType: 'Mail', time: '11:00 AM', status: 'Pending', communication: 'Send updated proposal' },
  { id: 3, lead: 'Vertex Logistics', contactType: 'Phone', time: '01:45 PM', status: 'Pending', communication: 'Confirm contract details' },
  { id: 4, lead: 'Solstice Tech', contactType: 'Mail', time: '03:15 PM', status: 'Overdue', communication: 'Check-in on renewal status' }
];

const DataTable = ({ title, headers, data, renderRow }) => (
  <div className="data-table">
    <div className="table-header">
      <h4 className="table-title">{title}</h4>
    </div>
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="text-muted small text-uppercase">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => renderRow(row))}
        </tbody>
      </table>
    </div>
  </div>
);

const FollowUps = () => {
  const [alerts, setAlerts] = useState(initialAlerts);

  // Filter counters calculated from state dynamically
  const overdueCount = alerts.filter((item) => item.status === 'Overdue').length;
  const todayCount = alerts.filter((item) => item.status === 'Pending').length;

  // Handle local data dismissal
  const handleMarkDone = (id) => {
    setAlerts(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="module-container" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', fontFamily: '"Inter", sans-serif' }}>
      <div className="page-header">
        <div>
          <h2 className="title-gradient">Sales Follow-ups</h2>
          <p className="subtitle">Maintain conversation momentum, close more leads, and keep your daily follow-ups in one sales-ready ledger.</p>
        </div>
      </div>

      <div className="cards-grid">
        <div className="followup-card card-danger premium-hover">
          <div className="card-icon icon-danger-bg">
            {/* Native AlertCircle SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div>
            <p className="card-label">Overdue Follow-ups</p>
            <h3 className="text-danger-val">{overdueCount}</h3>
          </div>
        </div>

        <div className="followup-card card-amber premium-hover">
          <div className="card-icon icon-amber-bg">
            {/* Native Clock SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div>
            <p className="card-label">Scheduled Today</p>
            <h3 className="text-amber-val">{todayCount}</h3>
          </div>
        </div>
      </div>

      <div className="table-panel premium-hover">
        <DataTable
          title="Communication Ledger"
          headers={['Customer/Lead', 'Contact Type', 'Scheduled Time', 'Status', 'Actions']}
          data={alerts}
          renderRow={(a) => (
            <tr key={a.id} className="interactive-row-lux">
              <td>
                <div className="lead-cell">
                  <strong className="lead-name">{a.lead}</strong>
                  <span className="text-muted small">{a.communication}</span>
                </div>
              </td>
              <td>
                <span className="type-pill">
                  {a.contactType === 'Phone' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  )}
                  <span className="type-text">{a.contactType}</span>
                </span>
              </td>
              <td>
                <span className="time-cell">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>{a.time}</span>
                </span>
              </td>
              <td>
                <span className={`status-pill status-${a.status.toLowerCase()}`}>
                  <span className="status-dot"></span>
                  {a.status}
                </span>
              </td>
              <td>
                <button className="action-button-lux" onClick={() => handleMarkDone(a.id)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-11m14.06 2L12 15.01l-3-3"></path></svg>
                  <span>Mark Done</span>
                </button>
              </td>
            </tr>
          )}
        />
        
        {alerts.length === 0 && (
          <div className="empty-state-lux">
            <div className="empty-icon">🎉</div>
            <h4>All Caught Up!</h4>
            <p className="text-muted">No pending sales follow-ups logged on your active roster queue.</p>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .module-container {
          padding: 30px;
          background-color: var(--bg);
          animation: fadeIn 0.4s ease-out;
        }

        .page-header {
          margin-bottom: 28px;
        }

        .title-gradient {
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.5rem;
        }

        .subtitle {
          margin: 0;
          color: var(--text-muted, #94a3b8);
          max-width: 640px;
          line-height: 1.6;
        }

        /* Micro-Interactions & Premium Elevation */
        .premium-hover {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease-in-out, border-color 0.2s ease !important;
        }
        .premium-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12) !important;
          border-color: var(--primary) !important;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .followup-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 24px;
          border-radius: 18px;
          background-color: var(--surface);
          border: 1px solid var(--card-border);
        }

        .card-danger {
          background: rgba(239, 68, 68, 0.06);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .card-amber {
          background: rgba(245, 158, 11, 0.06);
          border-color: rgba(245, 158, 11, 0.2);
        }

        .card-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: var(--text);
          flex-shrink: 0;
        }

        .icon-danger-bg { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .icon-amber-bg { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }

        .card-label {
          margin-bottom: 0.35rem;
          color: var(--text-muted, #94a3b8);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 600;
        }

        .cards-grid h3 {
          margin: 0;
          font-size: 2.2rem;
          font-weight: 800;
        }
        .text-danger-val { color: #ef4444; }
        .text-amber-val { color: #f59e0b; }

        .table-panel {
          background-color: var(--surface);
          border: 1px solid var(--card-border);
          border-radius: 22px;
          padding: 24px;
        }

        .table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .table-title {
          margin: 0;
          color: var(--text);
          font-size: 1.15rem;
          font-weight: 700;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          min-width: 720px;
        }

        .table th,
        .table td {
          padding: 16px 18px;
          border-bottom: 1px solid var(--card-border);
          vertical-align: middle;
        }

        .interactive-row-lux { transition: background-color 0.12s ease; }
        .interactive-row-lux:hover { background-color: var(--surface-alt) !important; }

        .lead-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .lead-name {
          color: var(--text);
          font-size: 15px;
        }

        .type-pill,
        .time-cell {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted, #94a3b8);
          font-size: 0.95rem;
          font-weight: 500;
        }

        .text-primary-icon { color: #3b82f6; }
        .text-purple-icon { color: #a855f7; }
        .type-text { color: var(--text); font-size: 14px; }

        /* Premium Glowing Status Badges */
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          min-width: 104px;
          justify-content: center;
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }

        .status-overdue {
          background-color: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.15);
        }
        .status-overdue .status-dot { background: #ef4444; box-shadow: 0 0 8px #ef4444; }

        .status-pending {
          background-color: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.15);
        }
        .status-pending .status-dot { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }

        /* Modern Sliding Action Buttons */
        .action-button-lux {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 10px;
          background-color: rgba(16, 185, 129, 0.08);
          color: #10b981;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        .action-button-lux:hover {
          background-color: #10b981;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
          transform: translateY(-1px);
        }

        .empty-state-lux {
          text-align: center;
          padding: 40px 20px;
        }
        .empty-icon { font-size: 40px; margin-bottom: 12px; }
        .empty-state-lux h4 { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 4px; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 760px) {
          .cards-grid {
            grid-template-columns: 1fr;
          }

          .table {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default FollowUps;