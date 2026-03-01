import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Clock, AlertCircle, Plus, FileText, Send, X } from 'lucide-react';
import './DashboardTabs.css';

const RefundsTab = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bookingId: '',
    reason: 'booking_cancellation',
    refundMethod: 'wallet',
    additionalDetails: ''
  });

  useEffect(() => {
    fetchRefunds();
    fetchEligibleBookings();
  }, []);

  const fetchRefunds = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/refunds`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRefunds(data.data);
      } else {
        setError(data.message || 'Failed to load refunds');
      }
    } catch (error) {
      console.error('Fetch refunds error:', error);
      setError('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleBookings = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/eligible-refund-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setEligibleBookings(data.data);
      }
    } catch (error) {
      console.error('Fetch eligible bookings error:', error);
    }
  };

  const handleSubmitRefund = async (e) => {
    e.preventDefault();
    
    if (!formData.bookingId) {
      alert('Please select a booking');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/request-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Refund request submitted successfully!');
        setShowApplicationForm(false);
        setFormData({
          bookingId: '',
          reason: 'booking_cancellation',
          refundMethod: 'wallet',
          additionalDetails: ''
        });
        fetchRefunds();
        fetchEligibleBookings();
      } else {
        alert(data.message || 'Failed to submit refund request');
      }
    } catch (error) {
      console.error('Submit refund error:', error);
      alert('Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'processing':
        return '#17a2b8';
      case 'rejected':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h1>Refunds</h1>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading refunds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div>
          <h1>Refunds</h1>
          <p>View and track your refund requests</p>
        </div>
        <button 
          className="btn-create-ride"
          onClick={() => setShowApplicationForm(true)}
        >
          <Plus size={18} />
          Request Refund
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px' }}>
          <AlertCircle size={20} />
          <span style={{ marginLeft: '0.5rem' }}>{error}</span>
        </div>
      )}

      {refunds.length === 0 ? (
        <div className="empty-state">
          <DollarSign size={64} color="#ccc" />
          <h3>No Refunds Yet</h3>
          <p>You don't have any refund requests. Refunds from cancelled bookings will appear here.</p>
        </div>
      ) : (
        <div className="refunds-list">
          {refunds.map((refund) => (
            <div key={refund._id} className="refund-card">
              <div className="refund-header">
                <div className="refund-info">
                  <h3>Booking {refund.booking?.bookingReference || '#N/A'}</h3>
                  <p className="refund-reason">{refund.reason?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Booking cancellation'}</p>
                </div>
                <div className="refund-amount">
                  <span className="amount-label">Refund Amount</span>
                  <span className="amount-value">${refund.amount?.toFixed(2)}</span>
                </div>
              </div>

              <div className="refund-details">
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>Requested: {formatDate(refund.requestedAt || refund.createdAt)}</span>
                </div>
                {refund.processedAt && (
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>Processed: {formatDate(refund.processedAt)}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="refund-method">
                    Method: {refund.refundMethod === 'wallet' ? 'Wallet' : 'Original Payment Method'}
                  </span>
                </div>
              </div>

              <div className="refund-footer">
                <span 
                  className="refund-status"
                  style={{ 
                    backgroundColor: getStatusColor(refund.status) + '20',
                    color: getStatusColor(refund.status),
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  {getStatusText(refund.status)}
                </span>
                {refund.notes && (
                  <p className="refund-notes">{refund.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refund Application Form Modal */}
      {showApplicationForm && (
        <div className="modal-overlay" onClick={() => setShowApplicationForm(false)}>
          <div className="modal-content refund-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FileText size={24} />
                Request Refund
              </h2>
              <button 
                className="close-btn"
                onClick={() => setShowApplicationForm(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitRefund} className="refund-form">
              <div className="form-group">
                <label>Select Booking *</label>
                <select
                  value={formData.bookingId}
                  onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                  required
                  disabled={eligibleBookings.length === 0}
                >
                  <option value="">Choose a booking to refund</option>
                  {eligibleBookings.map((booking) => (
                    <option key={booking._id} value={booking._id}>
                      {booking.bookingReference} - {booking.status?.toUpperCase()} - {booking.pickupLocation?.address} → {booking.dropoffLocation?.address} 
                      - ${booking.totalPrice?.toFixed(2)} - {new Date(booking.pickupDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {eligibleBookings.length === 0 ? (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                    <small style={{ color: '#856404', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      No eligible bookings available for refund
                    </small>
                    <small style={{ color: '#856404', display: 'block', fontSize: '12px' }}>
                      Only cancelled or completed rides that haven't been refunded yet are eligible. 
                      Cancel a booking to request a refund automatically, or wait for your upcoming rides to complete.
                    </small>
                  </div>
                ) : (
                  <small style={{ color: '#6c757d', display: 'block', marginTop: '8px' }}>
                    Showing {eligibleBookings.length} cancelled/completed ride{eligibleBookings.length !== 1 ? 's' : ''} eligible for refund
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Refund Reason *</label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                >
                  <option value="booking_cancellation">Booking Cancellation</option>
                  <option value="service_issue">Service Issue</option>
                  <option value="overcharge">Overcharge</option>
                  <option value="no_show">Driver No Show</option>
                  <option value="customer_request">Customer Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Refund Method *</label>
                <select
                  value={formData.refundMethod}
                  onChange={(e) => setFormData({ ...formData, refundMethod: e.target.value })}
                  required
                >
                  <option value="wallet">Wallet (Instant)</option>
                  <option value="original_payment">Original Payment Method (3-5 business days)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Additional Details</label>
                <textarea
                  value={formData.additionalDetails}
                  onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                  placeholder="Please provide any additional information about your refund request..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowApplicationForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting || eligibleBookings.length === 0}
                >
                  <Send size={18} />
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundsTab;
