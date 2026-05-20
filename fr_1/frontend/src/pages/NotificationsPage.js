import { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationRead } from '../services/notificationService';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetchNotifications();
      setNotifications(response.notifications || []);
      setUnreadCount(response.unread || 0);
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

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="page-title">Notifications</h3>
          <p className="text-muted">Real-time alerts and activity logs for your operations team.</p>
        </div>
        <div>
          <span className="badge bg-primary">Unread {unreadCount}</span>
        </div>
      </div>

      <div className="card card-custom p-4">
        {loading ? (
          <p className="text-muted">Loading notifications...</p>
        ) : notifications.length ? (
          <ul className="list-group list-group-flush">
            {notifications.map((notification) => (
              <li key={notification.id} className={`list-group-item d-flex justify-content-between align-items-start ${notification.is_read ? 'bg-light' : 'bg-white'}`}>
                <div>
                  <h6 className="mb-1">{notification.title}</h6>
                  <p className="mb-1 text-muted">{notification.message || notification.detail}</p>
                  <small className="text-muted">{new Date(notification.created_at || notification.createdAt || Date.now()).toLocaleString()}</small>
                </div>
                {!notification.is_read && (
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleMarkRead(notification.id)}>
                    Mark Read
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mb-0">No notifications found.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
