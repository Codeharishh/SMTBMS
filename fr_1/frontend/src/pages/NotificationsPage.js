// src/pages/NotificationsPage.js
import React, { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationRead } from '../services/notificationService';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetchNotifications();
      const data = Array.isArray(response) ? response : (response.notifications || []);
      const unread = response.unread !== undefined ? response.unread : data.filter(n => !n.is_read).length;

      setNotifications(data);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Notifications load failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Mark read failed', error);
    }
  };

  const getAlertAccentClass = (title = '', isRead) => {
    if (isRead) return 'border-light-subtle';
    const text = title.toLowerCase();
    if (text.includes('payroll') || text.includes('salary') || text.includes('paid')) return 'border-start border-success border-4';
    if (text.includes('low stock') || text.includes('alert') || text.includes('warning')) return 'border-start border-danger border-4';
    if (text.includes('material') || text.includes('movement')) return 'border-start border-warning border-4';
    return 'border-start border-primary border-4';
  };

  return (
    <div className="container-fluid px-4 py-4" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>

      {/* 🟢 FIXED: MERGED THE COMPONENT'S EMBEDDED STYLES WITH GLOBAL DARK SYSTEM VARIABLES */}
      <style>{`
        .lux-notify-card {
          background-color: var(--surface) !important;
          border: 1px solid var(--card-border) !important;
          border-radius: 14px !important;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease-in-out !important;
        }

        .lux-notify-card:hover {
          transform: translateX(4px) translateY(-1px) !important;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08) !important;
        }
        .lux-clear-btn {
          border: 1px solid var(--primary) !important;
          color: var(--primary) !important;
          background: transparent !important;
          font-weight: 600 !important;
          transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .lux-clear-btn:hover {
          background-color: var(--primary) !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(47, 109, 245, 0.2) !important;
        }

        @keyframes soft-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.95; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pulse-badge {
          animation: soft-pulse 2s infinite ease-in-out;
        }
        .opacity-65 {
          opacity: 0.55 !important;
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--card-border) !important' }}>
        <div>
          <h4 className="fw-bold mb-1">🔔 Operations Notification Hub</h4>
          <p className="text-muted small mb-0">Real-time enterprise alerts, audit trails, and system task queue tracking logs.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {unreadCount > 0 ? (
            <span className="badge bg-danger rounded-pill px-3 py-2 fw-bold shadow-sm pulse-badge" style={{ fontSize: '0.78rem' }}>
              {unreadCount} Action Required
            </span>
          ) : (
            <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 fw-semibold" style={{ fontSize: '0.78rem' }}>
              ✓ Workspace Fully Caught Up
            </span>
          )}
        </div>
      </div>

      {/* NOTIFICATIONS CONTAINER LAYOUT */}
      <div className="mx-auto" style={{ maxWidth: '900px' }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="text-muted small fw-medium">Syncing live system activity updates...</p>
          </div>
        ) : notifications.length ? (
          <div className="d-flex flex-column gap-3">
            {notifications.map((notification) => {
              const isRead = !!notification.is_read;
              return (
                <div
                  key={notification.id}
                  className={`card border-0 p-3 lux-notify-card ${isRead ? 'opacity-65 shadow-none' : 'shadow-sm'}`}
                >
                  <div className={`d-flex justify-content-between align-items-center p-1 ${getAlertAccentClass(notification.title, isRead)}`}>
                    <div className={isRead ? '' : 'ps-3'}>
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem' }}>
                          {notification.title}
                        </h6>
                        {!isRead && (
                          <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-0.5 fw-bold" style={{ fontSize: '0.62rem' }}>
                            NEW
                          </span>
                        )}
                      </div>

                      <p className="mb-2 small text-muted" style={{ lineHeight: '1.45' }}>
                        {notification.message || notification.detail}
                      </p>

                      <div className="d-flex align-items-center gap-1.5 text-muted small" style={{ fontSize: '0.74rem' }}>
                        <span>🕒</span>
                        <span>{new Date(notification.created_at || notification.createdAt || Date.now()).toLocaleString()}</span>
                      </div>
                    </div>

                    {!isRead && (
                      <button
                        className="btn btn-sm rounded-3 px-3 no-print ms-4 text-nowrap lux-clear-btn"
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => handleMarkRead(notification.id)}
                      >
                        ✓ Clear Alert
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE HERO */
          /* 🟢 FIXED: Stripped out layout class 'bg-white' which was overriding default dark tokens rules */
          <div className="card border-0 shadow-sm rounded-4 text-center p-5 border border-dashed lux-notify-card">
            <div className="display-4 text-muted opacity-25 mb-3">✉</div>
            <h5 className="fw-bold mb-1">Clear Horizon</h5>
            <p className="text-muted small mx-auto mb-0" style={{ maxWidth: '350px' }}>
              No critical notifications or background alerts match your active workstation parameters.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default NotificationsPage;