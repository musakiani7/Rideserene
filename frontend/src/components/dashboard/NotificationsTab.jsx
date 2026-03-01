import { useState, useEffect } from 'react';
import { Bell, Mail, CheckCircle } from 'lucide-react';
import './DashboardTabs.css';

const NotificationsTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/notifications?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const markRead = async (id) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      }
    } catch (err) {
      console.error('Mark notification read error:', err);
    }
  };

  const markAll = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    setMarkingAll(true);
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Mark all notifications read error:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const badgeIcon = (type) => {
    switch (type) {
      case 'booking_created':
        return <Mail size={16} />;
      case 'chauffeur_assigned':
        return <Bell size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="tab-loading">
        <div className="spinner" />
        <p>Loading notifications...</p>
      </div>
    );
  }

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="notifications-tab">
      <div className="tab-header">
        <div>
          <h1>Notifications</h1>
          <p>Email notifications are sent to your inbox based on your settings. Recent booking and chauffeur assignment alerts are listed here.</p>
        </div>
        {items.length > 0 && unreadCount > 0 && (
          <button
            type="button"
            className="btn-create-ride"
            onClick={markAll}
            disabled={markingAll}
          >
            <CheckCircle size={18} />
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state-small">
          <Bell size={48} />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="history-list">
          {items.map((n) => (
            <div
              key={n._id}
              className="history-card"
              style={{
                borderLeft: n.read ? '4px solid #e9ecef' : '4px solid #d4af37',
                background: n.read ? '#ffffff' : 'rgba(212,175,55,0.05)',
              }}
            >
              <div className="history-header">
                <div className="history-ref">
                  {badgeIcon(n.type)}
                  <strong>{n.title}</strong>
                </div>
                {!n.read && <span className="status-badge status-confirmed">new</span>}
              </div>
              <div className="history-body">
                <p style={{ margin: 0, fontSize: 14 }}>{n.message}</p>
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6c757d' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="history-footer">
                {!n.read && (
                  <button
                    type="button"
                    className="btn-view-details"
                    onClick={() => markRead(n._id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-page"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-page"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;

