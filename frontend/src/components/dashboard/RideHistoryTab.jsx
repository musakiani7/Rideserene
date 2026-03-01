import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Car, Download, FileText, User, Phone, Calendar, DollarSign, Info, ChevronDown, ChevronUp, RefreshCw, MessageCircle, X } from 'lucide-react';
import { generateInvoicePDF } from '../../utils/invoiceGenerator';
import './DashboardTabs.css';

const RideHistoryTab = ({ onSwitchToChat }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRide, setExpandedRide] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [reviewingRide, setReviewingRide] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewCategories, setReviewCategories] = useState({
    professionalism: 0,
    punctuality: 0,
    vehicleCondition: 0,
    communication: 0,
    drivingSkills: 0,
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const navigate = useNavigate();

  const handleOpenChat = (bookingId) => {
    // Store booking ID in localStorage for ChatTab to pick up
    localStorage.setItem('chatBookingId', bookingId);
    // Trigger tab switch if callback provided
    if (onSwitchToChat) {
      onSwitchToChat(bookingId);
    } else {
      // Fallback: dispatch custom event
      window.dispatchEvent(new CustomEvent('switchToChat', { detail: { bookingId } }));
    }
  };

  useEffect(() => {
    fetchRideHistory();
  }, [page]);

  const fetchRideHistory = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    console.log('=== RIDE HISTORY DEBUG ===');
    console.log('1. Token exists:', !!token);
    console.log('2. Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    console.log('3. API Base URL:', API_BASE);
    console.log('4. Full URL:', `${API_BASE}/api/dashboard/ride-history?page=${page}&limit=10`);

    if (!token) {
      console.error('❌ NO TOKEN FOUND! User may not be logged in.');
      setLoading(false);
      return;
    }

    try {
      console.log('5. Making fetch request...');
      
      const response = await fetch(`${API_BASE}/api/dashboard/ride-history?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('6. Response status:', response.status);
      console.log('7. Response ok:', response.ok);

      const data = await response.json();
      console.log('8. Response data:', data);
      
      if (data.success) {
        console.log('✅ SUCCESS! Rides count:', data.count);
        console.log('9. Rides data:', data.data);
        
        // Filter to show completed, cancelled, and pending rides (pending rides can be confirmed)
        // Exclude confirmed, assigned, in-progress (those should be in Upcoming Rides)
        const filteredRides = (data.data || []).filter(
          (ride) => ride.status === 'completed' || ride.status === 'cancelled' || ride.status === 'pending'
        );
        
        // Remove duplicates by booking ID
        const uniqueRides = Array.from(
          new Map(filteredRides.map(ride => [ride._id || ride.id, ride])).values()
        );
        
        console.log('9a. Filtered rides (completed/cancelled only):', filteredRides.length);
        console.log('9b. Unique rides (after deduplication):', uniqueRides.length);
        setRides(uniqueRides);
        
        // Recalculate pages based on filtered results
        const filteredTotal = filteredRides.length;
        setTotalPages(Math.ceil(filteredTotal / 10) || 1);
        
        console.log('10. State updated with', filteredRides.length, 'rides');
      } else {
        console.error('❌ API returned success: false');
        console.error('Error message:', data.message);
      }
    } catch (error) {
      console.error('❌ FETCH ERROR:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
      console.log('=== END DEBUG ===');
    }
  };

  const handleDownloadInvoice = (ride) => {
    try {
      console.log('=== INVOICE GENERATION DEBUG ===');
      console.log('1. Ride data:', ride);
      console.log('2. Booking reference:', ride.bookingReference);
      console.log('3. Calling generateInvoicePDF...');
      
      generateInvoicePDF(ride);
      
      console.log('✅ Invoice generated successfully for:', ride.bookingReference);
      console.log('=== END DEBUG ===');
    } catch (error) {
      console.error('❌ Error generating invoice:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      console.error('Ride data that caused error:', ride);
      alert(`Failed to generate invoice: ${error.message}\n\nCheck console (F12) for details.`);
    }
  };

  const toggleRideDetails = (rideId) => {
    setExpandedRide(expandedRide === rideId ? null : rideId);
  };

  const handleCancelRide = async (ride) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Only allow cancelling pending, confirmed, or assigned rides
    if (!['pending', 'confirmed', 'assigned'].includes(ride.status)) {
      alert('This ride cannot be cancelled.');
      return;
    }

    if (!confirm('Are you sure you want to cancel this ride? This action cannot be undone.')) {
      return;
    }

    try {
      setCancellingId(ride._id);
      
      const response = await fetch(`${API_BASE}/api/bookings/${ride._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancellationReason: 'Cancelled by customer',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || 'Failed to cancel ride');
        setCancellingId(null);
        return;
      }

      // Refresh the ride list to show updated status
      await fetchRideHistory();
      alert('Ride cancelled successfully!');
      setCancellingId(null);
    } catch (error) {
      console.error('Cancel ride error:', error);
      alert('Failed to cancel ride. Please try again.');
      setCancellingId(null);
    }
  };

  const openReviewModal = async (ride) => {
    setReviewingRide(ride);
    setReviewRating(5);
    setReviewComment('');
    setReviewCategories({
      professionalism: 0,
      punctuality: 0,
      vehicleCondition: 0,
      communication: 0,
      drivingSkills: 0,
    });
    setReviewError('');

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/rides/${ride._id}/review`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.review) {
          setReviewRating(data.review.rating || 5);
          setReviewComment(data.review.comment || '');
          if (data.review.categories) {
            setReviewCategories({
              professionalism: data.review.categories.professionalism || 0,
              punctuality: data.review.categories.punctuality || 0,
              vehicleCondition: data.review.categories.vehicleCondition || 0,
              communication: data.review.categories.communication || 0,
              drivingSkills: data.review.categories.drivingSkills || 0,
            });
          }
        }
      }
    } catch (e) {
      // ignore load errors; user can still submit
    }
  };

  const closeReviewModal = () => {
    setReviewingRide(null);
    setReviewError('');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewingRide) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      setReviewSubmitting(true);
      setReviewError('');
      const response = await fetch(`${API_BASE}/api/dashboard/rides/${reviewingRide._id}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          categories: reviewCategories,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setReviewError(data.message || 'Failed to submit review');
        setReviewSubmitting(false);
        return;
      }

      closeReviewModal();
      setReviewSubmitting(false);
    } catch (error) {
      console.error('Submit review error:', error);
      setReviewError('Something went wrong. Please try again.');
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return <div className="tab-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="ride-history-tab">
      <div className="tab-header">
        <h1>Ride History</h1>
        <p>{rides.length} past ride{rides.length !== 1 ? 's' : ''}</p>
      </div>

      {rides.length === 0 ? (
        <div className="empty-state">
          <Clock size={64} />
          <h3>No Ride History</h3>
          <p>Your completed rides will appear here.</p>
          <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px', fontSize: '14px', textAlign: 'left' }}>
            <strong>Troubleshooting:</strong>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li>Check browser console (F12) for detailed debug logs</li>
              <li>Verify you are logged in (token should exist)</li>
              <li>Ensure backend server is running on port 5000</li>
              <li>Check if bookings exist in database: <code>node backend/checkBookings.js</code></li>
              <li>Create test booking: <code>node backend/test-booking.js</code></li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className="history-list">
            {rides.map((ride) => (
              <div key={ride._id} className="history-card">
                <div className="history-header">
                  <div className="history-ref">
                    <FileText size={18} />
                    <strong>{ride.bookingReference}</strong>
                  </div>
                  <span className={`status-badge status-${ride.status}`}>
                    {ride.status}
                  </span>
                </div>

                <div className="history-body">
                  <div className="history-date">
                    <Clock size={16} />
                    <span>{new Date(ride.pickupDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })} at {ride.pickupTime}</span>
                  </div>

                  <div className="history-route">
                    <div className="route-item">
                      <MapPin size={16} className="icon-pickup" />
                      <div>
                        <span className="route-label">Pickup</span>
                        <span className="route-address">{ride.pickupLocation.address}</span>
                      </div>
                    </div>
                    {ride.dropoffLocation && (
                      <div className="route-item">
                        <MapPin size={16} className="icon-dropoff" />
                        <div>
                          <span className="route-label">Drop-off</span>
                          <span className="route-address">{ride.dropoffLocation.address}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="history-vehicle">
                    <Car size={16} />
                    <span>{ride.vehicleClass.name} - {ride.vehicleClass.vehicle}</span>
                  </div>

                  {/* Expanded Details */}
                  {expandedRide === ride._id && (
                    <div className="expanded-details">
                      <div className="detail-section">
                        <h4><Info size={16} /> Booking Details</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Booking Type:</span>
                            <span className="detail-value">{ride.rideType || 'One Way'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Passengers:</span>
                            <span className="detail-value">{ride.passengers || 1}</span>
                          </div>
                          {ride.duration && (
                            <div className="detail-item">
                              <span className="detail-label">Duration:</span>
                              <span className="detail-value">{ride.duration} hours</span>
                            </div>
                          )}
                          {ride.distance && (
                            <div className="detail-item">
                              <span className="detail-label">Distance:</span>
                              <span className="detail-value">{ride.distance} km</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {ride.chauffeur && (
                        <div className="detail-section">
                          <h4><User size={16} /> Chauffeur Information</h4>
                          <div className="detail-grid">
                            <div className="detail-item">
                              <span className="detail-label">Name:</span>
                              <span className="detail-value">
                                {ride.chauffeur.firstName} {ride.chauffeur.lastName}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Phone:</span>
                              <span className="detail-value">{ride.chauffeur.phone}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="detail-section">
                        <h4><DollarSign size={16} /> Payment Details</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Base Fare:</span>
                            <span className="detail-value">${ride.basePrice?.toFixed(2) || '0.00'}</span>
                          </div>
                          {ride.additionalCharges > 0 && (
                            <div className="detail-item">
                              <span className="detail-label">Additional Charges:</span>
                              <span className="detail-value">${ride.additionalCharges.toFixed(2)}</span>
                            </div>
                          )}
                          {ride.discount > 0 && (
                            <div className="detail-item">
                              <span className="detail-label">Discount:</span>
                              <span className="detail-value">-${ride.discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="detail-item">
                            <span className="detail-label">Payment Method:</span>
                            <span className="detail-value">{ride.paymentMethod || 'Card'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Payment Status:</span>
                            <span className={`payment-status ${ride.paymentStatus}`}>
                              {ride.paymentStatus || 'Paid'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {ride.specialRequests && (
                        <div className="detail-section">
                          <h4><Info size={16} /> Special Requests</h4>
                          <p className="special-requests">{ride.specialRequests}</p>
                        </div>
                      )}

                      <div className="detail-section">
                        <h4><Calendar size={16} /> Timeline</h4>
                        <div className="timeline">
                          <div className="timeline-item">
                            <span className="timeline-label">Booked:</span>
                            <span className="timeline-value">
                              {new Date(ride.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {ride.completedAt && (
                            <div className="timeline-item">
                              <span className="timeline-label">Completed:</span>
                              <span className="timeline-value">
                                {new Date(ride.completedAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {ride.cancelledAt && (
                            <div className="timeline-item">
                              <span className="timeline-label">Cancelled:</span>
                              <span className="timeline-value">
                                {new Date(ride.cancelledAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="history-footer">
                  <div className="history-price">
                    <span className="price-label">Total Paid</span>
                    <span className="price-value">${ride.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="history-actions">
                    <button 
                      className="btn-details"
                      onClick={() => toggleRideDetails(ride._id)}
                    >
                      {expandedRide === ride._id ? (
                        <>
                          <ChevronUp size={16} />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          View Details
                        </>
                      )}
                    </button>
                    <button 
                      className="btn-download"
                      onClick={() => handleDownloadInvoice(ride)}
                    >
                      <Download size={16} />
                      Invoice
                    </button>
                    {['pending', 'confirmed', 'assigned'].includes(ride.status) && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancelRide(ride)}
                        disabled={!!cancellingId}
                        title="Cancel this ride"
                        style={{
                          background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: cancellingId ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                          opacity: cancellingId ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!cancellingId) {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!cancellingId) {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      >
                        <X size={16} />
                        {cancellingId === ride._id ? 'Cancelling...' : 'Cancel Ride'}
                      </button>
                    )}
                    {(ride.status === 'in-progress' || ride.status === 'assigned' || ride.status === 'confirmed') && ride.chauffeur && (
                      <button
                        className="btn-chat"
                        onClick={() => handleOpenChat(ride._id)}
                        title="Chat with chauffeur"
                      >
                        <MessageCircle size={16} />
                        Chat
                      </button>
                    )}
                    {ride.status === 'completed' && ride.chauffeur && (
                      <button
                        className="btn-cancel"
                        onClick={() => openReviewModal(ride)}
                      >
                        Rate Chauffeur
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="btn-page"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="page-info">Page {page} of {totalPages}</span>
              <button 
                className="btn-page"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      {reviewingRide && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rate your chauffeur</h2>
              <button className="modal-close" onClick={closeReviewModal}>
                ✕
              </button>
            </div>
            <form className="modal-body" onSubmit={submitReview}>
              <p style={{ marginBottom: 12 }}>
                Ride <strong>{reviewingRide.bookingReference}</strong> on{' '}
                {new Date(reviewingRide.pickupDate).toLocaleDateString()} at {reviewingRide.pickupTime}
              </p>
              {reviewingRide.chauffeur && (
                <p style={{ marginBottom: 16 }}>
                  Chauffeur:{' '}
                  <strong>
                    {reviewingRide.chauffeur.firstName} {reviewingRide.chauffeur.lastName}
                  </strong>
                </p>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Overall rating</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        border: '1px solid #e9ecef',
                        background: star <= reviewRating ? '#ffc107' : '#fff',
                        color: star <= reviewRating ? '#1a1a1a' : '#adb5bd',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Performance by Category */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e9ecef',
                  overflow: 'hidden',
                  marginBottom: 16
                }}>
                  <div style={{
                    height: '6px',
                    background: 'linear-gradient(90deg, #ffc107 0%, #ff9800 100%)'
                  }} />
                  <div style={{ padding: '20px' }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      marginBottom: '20px',
                      textAlign: 'center',
                      color: '#1a1a1a'
                    }}>
                      Performance by Category
                    </h3>
                    
                    {[
                      { key: 'professionalism', label: 'Professionalism' },
                      { key: 'punctuality', label: 'Punctuality' },
                      { key: 'vehicleCondition', label: 'Vehicle Condition' },
                      { key: 'communication', label: 'Communication' },
                      { key: 'drivingSkills', label: 'Driving Skills' },
                    ].map((category) => (
                      <div key={category.key} style={{ marginBottom: '16px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{
                            fontSize: '0.9rem',
                            color: '#666',
                            fontWeight: '500'
                          }}>
                            {category.label}
                          </span>
                          <span style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#1a1a1a',
                            minWidth: '35px',
                            textAlign: 'right'
                          }}>
                            {reviewCategories[category.key] > 0 ? reviewCategories[category.key].toFixed(1) : '0.0'}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            flex: 1,
                            height: '8px',
                            background: '#f0f0f0',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${(reviewCategories[category.key] / 5) * 100}%`,
                              background: reviewCategories[category.key] > 0 
                                ? 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)' 
                                : '#f0f0f0',
                              transition: 'width 0.3s ease',
                              borderRadius: '4px'
                            }} />
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewCategories({
                                  ...reviewCategories,
                                  [category.key]: star
                                })}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  border: '1px solid #e9ecef',
                                  background: star <= reviewCategories[category.key] ? '#ffc107' : '#fff',
                                  color: star <= reviewCategories[category.key] ? '#1a1a1a' : '#adb5bd',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 0
                                }}
                                title={`Rate ${star} out of 5`}
                              >
                                {star}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Comments (optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #dee2e6',
                    resize: 'vertical',
                  }}
                  maxLength={500}
                  placeholder="Share any feedback about your chauffeur or the ride experience."
                />
              </div>
              {reviewError && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: 10,
                    background: '#fee',
                    borderRadius: 6,
                    color: '#c00',
                    fontSize: 14,
                  }}
                >
                  {reviewError}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn-cancel" onClick={closeReviewModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={reviewSubmitting}>
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideHistoryTab;
