import { useState, useEffect } from 'react';
import { MessageCircle, Plus, Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import './DashboardTabs.css';

const CATEGORIES = [
  { value: 'booking_issue', label: 'Booking issue' },
  { value: 'payment_issue', label: 'Payment issue' },
  { value: 'chauffeur_complaint', label: 'Chauffeur feedback' },
  { value: 'refund_request', label: 'Refund request' },
  { value: 'general_inquiry', label: 'General inquiry' },
  { value: 'technical_issue', label: 'Technical issue' },
];

const SupportTab = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ subject: '', description: '', category: 'general_inquiry' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchTickets = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/support`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setTickets(data.data || []);
    } catch (err) {
      console.error('Fetch tickets error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Subject and description are required');
      return;
    }
    setSubmitting(true);
    setError('');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          category: formData.category,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setFormData({ subject: '', description: '', category: 'general_inquiry' });
        setShowForm(false);
        fetchTickets();
      } else {
        setError(data.message || 'Failed to create ticket');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTicketDetail = async (id) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/support/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setSelectedTicket(data.data);
    } catch (err) {
      console.error('Fetch ticket error:', err);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    setSendingReply(true);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/support/${selectedTicket._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyMessage.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setReplyMessage('');
        fetchTicketDetail(selectedTicket._id);
        fetchTickets();
      }
    } catch (err) {
      console.error('Send reply error:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const statusLabel = (s) => (s === 'in_progress' ? 'In progress' : (s || '').replace('_', ' '));

  if (loading && tickets.length === 0) {
    return (
      <div className="tab-loading">
        <div className="spinner" />
        <p>Loading support tickets...</p>
      </div>
    );
  }

  return (
    <div className="support-tab">
      <div className="tab-header">
        <div>
          <h1>Contact Support</h1>
          <p>Open a ticket or view your existing support requests.</p>
        </div>
        <button type="button" className="btn-create-ride" onClick={() => { setShowForm(true); setError(''); }}>
          <Plus size={20} />
          New ticket
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New support ticket</h2>
              <button type="button" className="modal-close" onClick={() => setShowForm(false)}>
                <X size={24} />
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitTicket}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #dee2e6' }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief summary of your issue"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #dee2e6' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  placeholder="Describe your issue or question in detail."
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #dee2e6', resize: 'vertical' }}
                />
              </div>
              {error && (
                <div style={{ marginBottom: 12, padding: 10, background: '#fee', borderRadius: 6, color: '#c00' }}>{error}</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTicket.ticketNumber} – {selectedTicket.subject}</h2>
              <button type="button" className="modal-close" onClick={() => setSelectedTicket(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16 }}>
                <strong>Status:</strong> {statusLabel(selectedTicket.status)} &nbsp;|&nbsp;
                <strong>Category:</strong> {CATEGORIES.find((c) => c.value === selectedTicket.category)?.label || selectedTicket.category}
              </p>
              <div className="support-messages">
                {(selectedTicket.messages || []).map((msg, i) => (
                  <div key={i} className={`support-msg support-msg-${msg.sender}`}>
                    <strong>{msg.sender === 'customer' ? 'You' : 'Support'}</strong>
                    <span className="support-msg-time">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                    <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                  </div>
                ))}
              </div>
              {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                <form onSubmit={handleAddReply} style={{ marginTop: 20 }}>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                    placeholder="Type your reply..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #dee2e6', resize: 'vertical' }}
                  />
                  <button type="submit" className="btn-save" disabled={sendingReply || !replyMessage.trim()} style={{ marginTop: 8 }}>
                    <Send size={16} /> {sendingReply ? 'Sending...' : 'Send reply'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="empty-state">
          <MessageCircle size={64} />
          <h3>No support tickets</h3>
          <p>Open a ticket using the button above if you need help.</p>
        </div>
      ) : (
        <div className="history-list">
          {tickets.map((t) => (
            <div key={t._id} className="history-card">
              <div className="history-header">
                <div className="history-ref">
                  <MessageCircle size={18} />
                  <strong>{t.ticketNumber}</strong>
                </div>
                <span className={`status-badge status-${(t.status || '').replace('_', '-')}`}>{statusLabel(t.status)}</span>
              </div>
              <div className="history-body">
                <h4 style={{ margin: '0 0 8px' }}>{t.subject}</h4>
                <p style={{ margin: 0, fontSize: 14, color: '#6c757d' }}>
                  {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="history-footer">
                <button type="button" className="btn-view-details" onClick={() => fetchTicketDetail(t._id)}>
                  View & reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .support-messages { display: flex; flex-direction: column; gap: 12px; max-height: 320px; overflow-y: auto; }
        .support-msg { padding: 12px; border-radius: 8px; border: 1px solid #e9ecef; }
        .support-msg-customer { background: rgba(212,175,55,0.08); border-color: rgba(212,175,55,0.3); }
        .support-msg-admin { background: #f8f9fa; }
        .support-msg-time { font-size: 12px; color: #6c757d; margin-left: 8px; }
      `}</style>
    </div>
  );
};

export default SupportTab;
