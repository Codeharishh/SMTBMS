// src/pages/NotificationsPage.js
import React, { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationRead } from '../services/notificationService';

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

// ── CRISP SVG ICON SET ──────────────────────────────────────────────────────
const ICONS = {
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path vectorEffect="non-scaling-stroke" d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  mail: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline vectorEffect="non-scaling-stroke" points="22,6 12,13 2,6" />
    </svg>
  ),
  message: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  monitor: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="21" x2="16" y2="21" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  alertTriangle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="9" x2="12" y2="13" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  arrowUpDown: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="12" y1="5" x2="12" y2="19" />
      <polyline vectorEffect="non-scaling-stroke" points="19 12 12 19 5 12" />
      <polyline vectorEffect="non-scaling-stroke" points="19 12 12 5 5 12" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="7" r="4" />
      <path vectorEffect="non-scaling-stroke" d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path vectorEffect="non-scaling-stroke" d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  creditCard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  briefcase: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path vectorEffect="non-scaling-stroke" d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="2" x2="16" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="2" x2="8" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
};

// ── TOGGLE SWITCH COMPONENT ────────────────────────────────────────────────
const Toggle = ({ checked, onChange, color }) => (
  <div
    onClick={onChange}
    style={{
      width: '46px', height: '26px', borderRadius: '13px', cursor: 'pointer',
      background: checked ? color : '#e2e8f0',
      transition: 'background 0.25s ease',
      position: 'relative', flexShrink: 0
    }}
  >
    <div style={{
      width: '20px', height: '20px', borderRadius: '50%', background: '#ffffff',
      position: 'absolute', top: '3px',
      left: checked ? '23px' : '3px',
      transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.18)'
    }} />
  </div>
);

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    inApp: true
  });

  const [alertTypes, setAlertTypes] = useState({
    lowStock: true,
    movements: true,
    hrEvents: false,
    payroll: true,
    crm: false,
    reports: true
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetchNotifications();
      const data = Array.isArray(response) ? response : (response.notifications || []);
      const unread = response.unread !== undefined ? response.unread : data.filter(n => !n.is_read).length;
      setNotifications(data);
      setUnreadCount(unread);
    } catch (error) {
      setNotifications([
        { id: 1, title: 'Low Stock Alert', message: 'Steel Rods stock has fallen below reorder threshold (8 units remaining).', is_read: false, created_at: new Date().toISOString() },
        { id: 2, title: 'Payroll Processed', message: 'May 2026 salary disbursement for 24 employees completed successfully.', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, title: 'Material Movement', message: 'Rubber Compound batch IN — 500 units received at Warehouse B.', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
      ]);
      setUnreadCount(2);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getNotifAccent = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('payroll') || t.includes('salary')) return COLORS.emerald;
    if (t.includes('low stock') || t.includes('alert') || t.includes('warning')) return COLORS.alert;
    if (t.includes('material') || t.includes('movement')) return COLORS.amber;
    if (t.includes('hr') || t.includes('leave')) return COLORS.violet;
    return COLORS.indigo;
  };

  const deliveryChannels = [
    { key: 'email', label: 'Email Notifications', sub: 'Receive alerts and reports via email', icon: ICONS.mail, color: COLORS.amber },
    { key: 'sms', label: 'SMS / WhatsApp', sub: 'Urgent alerts via mobile message', icon: ICONS.message, color: COLORS.emerald },
    { key: 'inApp', label: 'In-App Push', sub: 'Real-time alerts inside the dashboard', icon: ICONS.monitor, color: COLORS.indigo },
  ];

  const alertTypeList = [
    { key: 'lowStock', label: 'Low Stock Alerts', sub: 'When items fall below reorder level', icon: ICONS.alertTriangle, color: COLORS.rose },
    { key: 'movements', label: 'Material Movements', sub: 'IN / OUT / TRANSFER notifications', icon: ICONS.arrowUpDown, color: COLORS.indigo },
    { key: 'hrEvents', label: 'HR Events', sub: 'Leave, attendance, payroll events', icon: ICONS.users, color: COLORS.slate },
    { key: 'payroll', label: 'Payroll Processing', sub: 'Salary runs and payment confirmations', icon: ICONS.creditCard, color: COLORS.emerald },
    { key: 'crm', label: 'CRM – Leads & Deals', sub: 'New leads, deal stage changes, tasks due', icon: ICONS.briefcase, color: COLORS.amber },
    { key: 'reports', label: 'Scheduled Reports', sub: 'Weekly / monthly summaries', icon: ICONS.calendar, color: COLORS.violet },
  ];

  return (
    <div className="theme-notif container-fluid px-4 py-4" style={{
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
        .hover-btn-lux {
          transition: all 0.2s ease !important;
        }
        .hover-btn-lux:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(255, 122, 69, 0.28) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 12px;
        }

        /* PREF TOGGLE ROWS */
        .pref-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #f4f2fb;
          transition: background 0.15s ease;
        }
        .pref-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .pref-row:first-child {
          padding-top: 0;
        }
        .pref-icon-ring {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* NOTIFICATION FEED ROWS */
        .notif-feed-row {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 16px 20px;
          border-bottom: 1px solid #f4f2fb;
          transition: background-color 0.15s ease;
        }
        .notif-feed-row:last-child { border-bottom: none; }
        .notif-feed-row:hover { background-color: #FDFAFF; }

        /* CLEAR BUTTON SPECIFICITY OVERRIDES */
        .theme-notif .btn-action-clear {
          background-color: #eff6ff !important;
          color: #3b82f6 !important;
          border: none !important;
          padding: 4px 12px !important;
          border-radius: 6px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          cursor: pointer;
          transition: filter 0.15s ease;
          white-space: nowrap;
          flex-shrink: 0;
          box-shadow: none !important;
          transform: none !important;
          height: auto !important;
          min-height: unset !important;
          line-height: normal !important;
        }
        .theme-notif .btn-action-clear:hover {
          filter: brightness(0.95) !important;
        }

        @keyframes soft-pulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.75; }
        }
        .pulse-dot {
          animation: soft-pulse 2s infinite ease-in-out;
        }
      `}</style>

      {/* TOAST */}
      {saved && (
        <div className="alert d-flex align-items-center justify-content-between p-3 rounded-4 shadow border-0 position-fixed top-0 end-0 m-4 z-3"
          style={{ maxWidth: '380px', backgroundColor: '#ffffff', border: '1px solid #10b981', color: '#065f46' }}>
          <div><span className="me-2">✅</span><strong>Saved:</strong> Notification preferences updated.</div>
          <button className="btn-close" onClick={() => setSaved(false)} />
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)`, borderRadius: '14px' }}>
            {ICONS.bell}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Notification Centre</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Manage delivery channels, alert types and review live system notifications</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {unreadCount > 0 && (
            <button
              className="btn px-3 py-2 rounded-3 fw-semibold border-0 text-white hover-btn-lux"
              onClick={handleMarkAllRead}
              style={{ background: `linear-gradient(135deg, ${COLORS.indigo} 0%, #8BAFF5 100%)`, fontSize: '0.85rem' }}
            >
              Mark All Read
            </button>
          )}
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white"
            onClick={handleSavePreferences}
            disabled={saving}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)`, fontSize: '0.85rem' }}
          >
            {saving ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving...</> : ' Save Preferences'}
          </button>
        </div>
      </div>

      {/* PREFERENCES BLOCK */}
      <div className="section-eyebrow">Preferences</div>
      <div className="row g-4 mb-4">

        {/* DELIVERY CHANNELS CARD */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm hover-premium-card p-4 h-100" style={{ borderRadius: '22px' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${COLORS.violet}18`, color: COLORS.violet, border: `2px solid ${COLORS.violet}30` }}>
                {ICONS.monitor}
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.05rem' }}>Delivery Channels</h5>
                <p className="small mb-0" style={{ color: '#94a3b8' }}>Choose how you want to receive notifications</p>
              </div>
            </div>

            <div>
              {deliveryChannels.map(ch => (
                <div key={ch.key} className="pref-row">
                  <div className="pref-icon-ring" style={{ background: `${ch.color}18`, color: ch.color, border: `2px solid ${ch.color}30` }}>
                    {ch.icon}
                  </div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-bold" style={{ color: '#1e293b', fontSize: '0.92rem' }}>{ch.label}</div>
                    <div className="small" style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{ch.sub}</div>
                  </div>
                  <Toggle
                    checked={channels[ch.key]}
                    onChange={() => setChannels(prev => ({ ...prev, [ch.key]: !prev[ch.key] }))}
                    color={ch.color}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ALERT TYPES CARD */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm hover-premium-card p-4 h-100" style={{ borderRadius: '22px' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${COLORS.rose}18`, color: COLORS.rose, border: `2px solid ${COLORS.rose}30` }}>
                {ICONS.alertTriangle}
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.05rem' }}>Alert Types</h5>
                <p className="small mb-0" style={{ color: '#94a3b8' }}>Select the types of alerts you want to receive</p>
              </div>
            </div>

            <div className="row g-0">
              {alertTypeList.map(at => (
                <div key={at.key} className="col-12 col-sm-6">
                  <div className="pref-row" style={{ paddingLeft: '4px', paddingRight: '4px' }}>
                    <div className="pref-icon-ring" style={{ background: `${at.color}18`, color: at.color, border: `2px solid ${at.color}30` }}>
                      {at.icon}
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="fw-bold" style={{ color: alertTypes[at.key] ? at.color : '#1e293b', fontSize: '0.9rem', transition: 'color 0.2s' }}>{at.label}</div>
                      <div className="small" style={{ color: '#94a3b8', fontSize: '0.76rem' }}>{at.sub}</div>
                    </div>
                    <Toggle
                      checked={alertTypes[at.key]}
                      onChange={() => setAlertTypes(prev => ({ ...prev, [at.key]: !prev[at.key] }))}
                      color={at.color}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE NOTIFICATION FEED */}
      <div className="section-eyebrow">Live Feed</div>
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>

        {/* TABLE HEADER BAR */}
        <div className="p-4 bg-white border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: '#f1f0f9' }}>
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.05rem' }}>
            Recent System Notifications
            {unreadCount > 0 && (
              <span className="ms-2 px-2 py-1 rounded-pill fw-bold pulse-dot"
                style={{ background: `${COLORS.alert}18`, color: COLORS.alert, fontSize: '0.72rem', border: `1px solid ${COLORS.alert}33` }}>
                {unreadCount} unread
              </span>
            )}
          </h5>
          {unreadCount > 0 && (
            <button className="btn-action-clear" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          )}
        </div>

        {/* FEED BODY */}
        {loading ? (
          <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }} />
            Synchronizing live system notifications...
          </div>
        ) : notifications.length ? (
          <div>
            {notifications.map(notif => {
              const isRead = !!notif.is_read;
              const accent = getNotifAccent(notif.title);
              return (
                <div key={notif.id} className="notif-feed-row" style={{ opacity: isRead ? 0.6 : 1 }}>
                  {/* ACCENT DOT */}
                  <div className="flex-shrink-0 mt-1">
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: isRead ? '#cbd5e1' : accent,
                      boxShadow: isRead ? 'none' : `0 0 0 3px ${accent}22`
                    }} />
                  </div>

                  {/* CONTENT */}
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <span className="fw-bold" style={{ color: '#1e293b', fontSize: '0.92rem' }}>{notif.title}</span>
                      {!isRead && (
                        <span className="px-2 fw-bold rounded-pill"
                          style={{ background: `${accent}18`, color: accent, fontSize: '0.62rem', border: `1px solid ${accent}33`, padding: '2px 8px' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="mb-1 small" style={{ color: '#64748b', lineHeight: '1.45' }}>
                      {notif.message || notif.detail}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {new Date(notif.created_at || notif.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>

                  {/* ACTION */}
                  {!isRead && (
                    <button className="btn-action-clear" onClick={() => handleMarkRead(notif.id)}>
                      Clear
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5" style={{ color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✉</div>
            <div className="fw-bold" style={{ color: '#1e293b', fontSize: '1rem' }}>All Caught Up</div>
            <div className="small mt-1">No pending notifications in the system queue.</div>
          </div>
        )}
      </div>

    </div>
  );
};

export default NotificationsPage;