import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, User, CreditCard, Download, Mail, Car, ArrowLeft } from 'lucide-react';
import { generateSimpleInvoicePDF } from '../utils/simpleInvoiceGenerator';
import './BookingConfirmationPage.css';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: `/booking-confirmation/${bookingId}` } });
      return;
    }

    const fetchBooking = async () => {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        const response = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.success && data.booking) {
          setBooking(data.booking);
          setError('');
        } else {
          setError(data.message || 'Booking not found');
        }
      } catch (err) {
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchBooking();
    else setLoading(false);
  }, [bookingId, navigate]);

  const handleDownloadReceipt = () => {
    if (!booking) return;
    const bookingForPDF = {
      _id: booking._id,
      bookingReference: booking.bookingReference,
      status: booking.status,
      pickupLocation: { address: booking.pickupLocation?.address || 'N/A' },
      dropoffLocation: booking.dropoffLocation?.address ? { address: booking.dropoffLocation.address } : null,
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      vehicleClass: booking.vehicleClass || { name: 'N/A', vehicle: 'N/A', passengers: 1, luggage: 0 },
      passengerInfo: booking.passengerInfo || {},
      basePrice: booking.basePrice,
      totalPrice: booking.totalPrice,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      transactionId: booking.transactionId,
      createdAt: booking.createdAt,
    };
    generateSimpleInvoicePDF(bookingForPDF);
  };

  if (loading) {
    return (
      <div className="booking-confirmation-page">
        <div className="confirmation-container">
          <div className="confirmation-loading">
            <div className="confirmation-spinner" />
            <p>Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-confirmation-page">
        <div className="confirmation-container">
          <div className="confirmation-error">
            <p>{error || 'Booking not found.'}</p>
            <button type="button" className="btn-primary" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = {
    confirmed: '#28a745',
    assigned: '#007bff',
    'in-progress': '#ffc107',
    completed: '#6c757d',
    cancelled: '#dc3545',
    pending: '#6c757d',
  }[booking.status] || '#6c757d';

  return (
    <div className="booking-confirmation-page">
      <div className="confirmation-container">
        <div className="confirmation-header">
          <div className="confirmation-success-badge">
            <CheckCircle size={48} />
            <h1>Booking Confirmation</h1>
            <p className="confirmation-subtitle">Your ride has been confirmed. Details below.</p>
          </div>
          <div className="confirmation-reference">
            <span>Booking Reference</span>
            <strong>{booking.bookingReference}</strong>
          </div>
          <div className="confirmation-status" style={{ backgroundColor: statusColor }}>
            {booking.status?.toUpperCase()}
          </div>
        </div>

        <div className="confirmation-summary">
          <section className="summary-section">
            <h2><Calendar size={22} /> Trip Information</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Pickup</span>
                <span className="summary-value">{booking.pickupLocation?.address || 'N/A'}</span>
              </div>
              {booking.dropoffLocation?.address && (
                <div className="summary-item">
                  <span className="summary-label">Drop-off</span>
                  <span className="summary-value">{booking.dropoffLocation.address}</span>
                </div>
              )}
              <div className="summary-item">
                <span className="summary-label">Date</span>
                <span className="summary-value">{new Date(booking.pickupDate).toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Time</span>
                <span className="summary-value">{booking.pickupTime}</span>
              </div>
              {booking.rideType && (
                <div className="summary-item">
                  <span className="summary-label">Ride type</span>
                  <span className="summary-value">{booking.rideType.replace(/-/g, ' ')}</span>
                </div>
              )}
            </div>
          </section>

          <section className="summary-section">
            <h2><Car size={22} /> Vehicle</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Class</span>
                <span className="summary-value">{booking.vehicleClass?.name || 'N/A'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Vehicle</span>
                <span className="summary-value">{booking.vehicleClass?.vehicle || 'N/A'}</span>
              </div>
            </div>
          </section>

          <section className="summary-section">
            <h2><User size={22} /> Passenger</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Name</span>
                <span className="summary-value">
                  {booking.passengerInfo?.firstName} {booking.passengerInfo?.lastName}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Email</span>
                <span className="summary-value">{booking.passengerInfo?.email || '—'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Phone</span>
                <span className="summary-value">{booking.passengerInfo?.phone || '—'}</span>
              </div>
              {booking.passengerInfo?.flightNumber && (
                <div className="summary-item">
                  <span className="summary-label">Flight</span>
                  <span className="summary-value">{booking.passengerInfo.flightNumber}</span>
                </div>
              )}
            </div>
          </section>

          <section className="summary-section summary-payment">
            <h2><CreditCard size={22} /> Payment Summary</h2>
            <div className="payment-rows">
              <div className="payment-row">
                <span>Base fare</span>
                <span>${(booking.basePrice || 0).toFixed(2)}</span>
              </div>
              {(booking.taxes > 0 || booking.fees > 0) && (
                <div className="payment-row">
                  <span>Taxes & fees</span>
                  <span>${((booking.taxes || 0) + (booking.fees || 0)).toFixed(2)}</span>
                </div>
              )}
              {booking.discount > 0 && (
                <div className="payment-row discount">
                  <span>Discount</span>
                  <span>-${(booking.discount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="payment-row total">
                <span>Total</span>
                <span>${(booking.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="payment-status-line">
              <CheckCircle size={18} />
              <span>Payment {booking.paymentStatus || 'pending'}</span>
              {booking.paymentMethod && (
                <span className="payment-method">({booking.paymentMethod.replace('_', ' ')})</span>
              )}
            </div>
          </section>
        </div>

        <div className="confirmation-actions">
          <button type="button" className="btn-download-receipt" onClick={handleDownloadReceipt}>
            <Download size={20} />
            Download Receipt
          </button>
          <button type="button" className="btn-email-receipt" onClick={() => alert('Receipt will be sent to your email.')}>
            <Mail size={20} />
            Email Receipt
          </button>
          <button type="button" className="btn-dashboard" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
