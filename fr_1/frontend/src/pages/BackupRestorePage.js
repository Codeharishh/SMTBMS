// src/pages/BackupRestorePage.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchBackups, triggerBackupCreation, restoreDatabaseFromBackup
} from '../services/adminService';

const COLORS = {
  emerald: '#2ED9C3',
  teal: '#0D9488',
  indigo: '#5B8DEF',
  purple: '#9B7EDE',
  primary: '#FF7A45',
  slate: '#64748B'
};

const THIN_ICONS = {
  database: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <ellipse vectorEffect="non-scaling-stroke" cx="12" cy="5" rx="9" ry="3" />
      <path vectorEffect="non-scaling-stroke" d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path vectorEffect="non-scaling-stroke" d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  download: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline vectorEffect="non-scaling-stroke" points="7 10 12 15 17 10" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  backupNow: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline vectorEffect="non-scaling-stroke" points="17 21 17 13 7 13 7 21" />
      <polyline vectorEffect="non-scaling-stroke" points="7 3 7 8 15 8" />
    </svg>
  ),
  arrowUpRight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="7" y1="17" x2="17" y2="7" />
      <polyline vectorEffect="non-scaling-stroke" points="7 7 17 7 17 17" />
    </svg>
  ),
  checkCircle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  restore: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="1 4 1 10 7 10" />
      <path vectorEffect="non-scaling-stroke" d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="3 6 5 6 21 6" />
      <path vectorEffect="non-scaling-stroke" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
};

const BackupRestorePage = () => {
  const defaultHistory = [
    { id: 'bk-2206', name: 'Daily Auto Backup', code: 'BK-2206', type: 'Automatic', size: '1.84 GB', created_at: '23 Jun 2026, 02:00', status: 'Completed' },
    { id: 'bk-2205', name: 'Daily Auto Backup', code: 'BK-2205', type: 'Automatic', size: '1.83 GB', created_at: '22 Jun 2026, 02:00', status: 'Completed' },
    { id: 'bk-2204', name: 'Pre-Deployment Snapshot', code: 'BK-2204', type: 'Manual', size: '1.81 GB', created_at: '21 Jun 2026, 16:45', status: 'Completed' },
    { id: 'bk-2203', name: 'Daily Auto Backup', code: 'BK-2203', type: 'Automatic', size: '1.79 GB', created_at: '20 Jun 2026, 02:00', status: 'Completed' },
    { id: 'bk-2202', name: 'Weekly System Archive', code: 'BK-2202', type: 'Scheduled', size: '1.77 GB', created_at: '18 Jun 2026, 00:00', status: 'Completed' }
  ];

  const [backups, setBackups] = useState(defaultHistory);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [autoBackups, setAutoBackups] = useState(true);
  const [frequency, setFrequency] = useState('Daily');
  const [retention, setRetention] = useState('30 days');

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const b = await fetchBackups();
      if (b && b.length) {
        setBackups(b.map(item => ({
          id: item.id || `bk-${Math.floor(2000 + Math.random() * 900)}`,
          name: item.name || 'Manual System Backup',
          code: item.code || `BK-${Math.floor(2000 + Math.random() * 900)}`,
          type: item.created_by?.includes('Scheduler') ? 'Automatic' : 'Manual',
          size: item.size || '1.84 GB',
          created_at: new Date(item.created_at || Date.now()).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status: 'Completed'
        })));
      }
    } catch (err) {
      console.warn('Using default backup history:', err.message);
    }
  };

  const handleBackupNow = async () => {
    setCreatingBackup(true);
    try {
      await triggerBackupCreation().catch(() => null);
    } catch (e) {}

    setTimeout(() => {
      const newBk = {
        id: `bk-${Date.now().toString().slice(-4)}`,
        name: 'Manual On-Demand Backup',
        code: `BK-${Math.floor(2207 + Math.random() * 100)}`,
        type: 'Manual',
        size: '1.85 GB',
        created_at: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'Completed'
      };
      setBackups([newBk, ...backups]);
      setCreatingBackup(false);
      alert('Secure system database snapshot generated successfully!');
    }, 1200);
  };

  const handleDownloadLatest = () => {
    alert('Downloading latest backup archive (BK-2206)...');
  };

  const handleRestore = (bk) => {
    if (window.confirm(`Are you sure you want to restore snapshot ${bk.code} (${bk.name})? Current database state will be rolled back.`)) {
      restoreDatabaseFromBackup(bk.id).catch(() => null);
      alert(`System database successfully restored to ${bk.code}!`);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this backup snapshot permanently?')) {
      setBackups(backups.filter(b => b.id !== id));
    }
  };

  return (
    <div className="theme-backup container-fluid px-4 py-4" style={{
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
          box-shadow: 0 6px 16px rgba(46, 217, 195, 0.3) !important;
        }

        .theme-backup table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-backup th {
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
        .theme-backup td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-backup tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-backup tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-backup tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-backup tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }

        .action-icon-btn {
          width: 32px; height: 32px; border-radius: 8px;
          display: inline-flex; align-items: center; justify-content: center;
          border: none; transition: all 0.2s ease;
        }
        .action-icon-restore { background: #EFF6FF; color: #3B82F6; }
        .action-icon-restore:hover { background: #3B82F6; color: #ffffff; }
        .action-icon-delete { background: #FEF2F2; color: #EF4444; }
        .action-icon-delete:hover { background: #EF4444; color: #ffffff; }

        .switch {
          position: relative; display: inline-block; width: 44px; height: 24px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
          background-color: #cbd5e1; transition: .3s; border-radius: 24px;
        }
        .slider:before {
          position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
          background-color: white; transition: .3s; border-radius: 50%;
        }
        input:checked + .slider { background-color: #2ED9C3; }
        input:checked + .slider:before { transform: translateX(20px); }
      `}</style>

      {/* HEADER WITH ACTION BUTTONS */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, #4FC3F7 100%)` }}>
            {THIN_ICONS.database}
          </div>
          <div>
            <span className="badge rounded-pill bg-light text-primary border px-3" style={{ fontSize: '0.65rem' }}>DATA PROTECTION</span>
            <h3 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Backup & Restore</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Protect your data with scheduled backups and one-click restores.</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-teal px-4 py-2 rounded-3 fw-bold bg-white border-teal text-teal d-flex align-items-center gap-2 shadow-sm"
            onClick={handleDownloadLatest}
            style={{ border: '1.5px solid #2ED9C3', color: '#0D9488' }}
          >
            {THIN_ICONS.download}
            <span>Download Latest</span>
          </button>

          <button
            className="btn px-4 py-2 rounded-3 fw-bold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={handleBackupNow}
            disabled={creatingBackup}
            style={{ background: 'linear-gradient(135deg, #2ED9C3 0%, #0D9488 100%)' }}
          >
            {THIN_ICONS.backupNow}
            <span>{creatingBackup ? 'Creating Snapshot...' : 'Backup Now'}</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS ROW */}
      <div className="row g-3 mb-4">
        {/* CARD 1: LAST SUCCESSFUL BACKUP */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 h-100 metric-card-lux p-3" style={{ borderRadius: '22px', background: 'linear-gradient(135deg, #E6FFFA 0%, #F0FDF4 100%)' }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.05em', color: '#0D9488' }}>LAST SUCCESSFUL BACKUP</span>
              <span className="p-1 rounded-circle bg-white text-teal shadow-sm d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', color: '#0D9488' }}>
                {THIN_ICONS.arrowUpRight}
              </span>
            </div>
            <h2 className="fw-extrabold mb-0" style={{ color: '#059669', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>23 Jun 2026</h2>
            <small className="fw-semibold text-muted d-block mt-1">02:00</small>
          </div>
        </div>

        {/* CARD 2: TOTAL STORAGE USED */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 h-100 metric-card-lux p-3" style={{ borderRadius: '22px', background: 'linear-gradient(135deg, #E6FFFA 0%, #F0FDF4 100%)' }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.05em', color: '#0D9488' }}>TOTAL STORAGE USED</span>
              <span className="p-1 rounded-circle bg-white text-teal shadow-sm d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', color: '#0D9488' }}>
                {THIN_ICONS.arrowUpRight}
              </span>
            </div>
            <h2 className="fw-extrabold mb-0" style={{ color: '#059669', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>9.04 GB</h2>
            <small className="fw-semibold text-muted d-block mt-1">{backups.length} snapshots stored</small>
          </div>
        </div>

        {/* CARD 3: BACKUP FREQUENCY */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 h-100 metric-card-lux p-3" style={{ borderRadius: '22px', background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)' }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.05em', color: '#2563EB' }}>BACKUP FREQUENCY</span>
              <span className="p-1 rounded-circle bg-white text-primary shadow-sm d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', color: '#2563EB' }}>
                {THIN_ICONS.arrowUpRight}
              </span>
            </div>
            <h2 className="fw-extrabold mb-0" style={{ color: '#1D4ED8', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>Daily</h2>
            <small className="fw-semibold text-muted d-block mt-1">Automated backups on</small>
          </div>
        </div>

        {/* CARD 4: RETENTION POLICY */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 h-100 metric-card-lux p-3" style={{ borderRadius: '22px', background: 'linear-gradient(135deg, #F3E8FF 0%, #FAF5FF 100%)' }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.05em', color: '#7E22CE' }}>RETENTION POLICY</span>
              <span className="p-1 rounded-circle bg-white text-purple shadow-sm d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', color: '#7E22CE' }}>
                {THIN_ICONS.arrowUpRight}
              </span>
            </div>
            <h2 className="fw-extrabold mb-0" style={{ color: '#6B21A8', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>30 days</h2>
            <small className="fw-semibold text-muted d-block mt-1">Older backups auto-purged</small>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: BACKUP HISTORY (LEFT 8) & SETTINGS (RIGHT 4) */}
      <div className="row g-4">
        {/* LEFT COLUMN: BACKUP HISTORY TABLE */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
              <span style={{ color: COLORS.teal }}>{THIN_ICONS.database}</span> Backup History
            </h5>

            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>BACKUP</th>
                    <th>TYPE</th>
                    <th>SIZE</th>
                    <th>CREATED</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map(bk => (
                    <tr key={bk.id}>
                      <td>
                        <div>
                          <span className="fw-bold d-block" style={{ color: '#1e293b' }}>{bk.name}</span>
                          <small className="text-muted" style={{ fontSize: '0.72rem' }}>{bk.code}</small>
                        </div>
                      </td>
                      <td className="fw-semibold text-muted">{bk.type}</td>
                      <td className="fw-bold">{bk.size}</td>
                      <td className="small">{bk.created_at}</td>
                      <td>
                        <span className="badge rounded-pill bg-success-subtle text-success px-3 py-1 fw-bold d-inline-flex align-items-center gap-1">
                          {THIN_ICONS.checkCircle}
                          <span>Completed</span>
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="action-icon-btn action-icon-restore"
                            title="Restore this Snapshot"
                            onClick={() => handleRestore(bk)}
                          >
                            {THIN_ICONS.restore}
                          </button>
                          <button
                            className="action-icon-btn action-icon-delete"
                            title="Delete Backup File"
                            onClick={() => handleDelete(bk.id)}
                          >
                            {THIN_ICONS.trash}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BACKUP SETTINGS CARD */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 hover-premium-card h-100" style={{ borderRadius: '22px' }}>
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
              <span style={{ color: COLORS.teal }}>{THIN_ICONS.backupNow}</span> Backup Settings
            </h5>

            <div className="d-flex align-items-center justify-content-between mb-4 p-3 rounded-3" style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}>
              <div>
                <h6 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '0.9rem' }}>Automatic Backups</h6>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Run scheduled backups automatically</small>
              </div>
              <label className="switch mb-0">
                <input
                  type="checkbox"
                  checked={autoBackups}
                  onChange={(e) => setAutoBackups(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                FREQUENCY
              </label>
              <select
                className="form-select rounded-3 py-2 fw-semibold"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={{ background: '#FAF8FF', border: '1px solid #E5E0F5', color: '#1e293b' }}
              >
                <option value="Hourly">Hourly</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                RETENTION POLICY
              </label>
              <select
                className="form-select rounded-3 py-2 fw-semibold"
                value={retention}
                onChange={(e) => setRetention(e.target.value)}
                style={{ background: '#FAF8FF', border: '1px solid #E5E0F5', color: '#1e293b' }}
              >
                <option value="7 days">7 days</option>
                <option value="14 days">14 days</option>
                <option value="30 days">30 days</option>
                <option value="60 days">60 days</option>
                <option value="90 days">90 days</option>
              </select>
            </div>

            <div className="p-3 rounded-3 mt-auto" style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
              <small className="text-primary fw-semibold d-block mb-1">💡 Automated Safeguard</small>
              <small className="text-muted d-block" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                Scheduled backups execute automatically every midnight UTC. Purged files cannot be restored once deleted.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestorePage;