import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, User, CreditCard, Download, Mail, Info } from 'lucide-react';
import { generateSimpleInvoicePDF } from '../utils/simpleInvoiceGenerator';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = useMemo(() => location.state?.booking || {}, [location.state]);
  const [fullBookingDetails, setFullBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    // Check if booking data exists
    if (!booking.vehicle && !booking.bookingReference) {
      navigate('/');
      return;
    }

    // If booking already has a reference, it's already confirmed
    if (booking.bookingReference) {
      setIsConfirmed(true);
    }

    // Fetch full booking details if already confirmed
    const fetchBookingDetails = async () => {
      if (!booking.bookingId) {
        return;
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/bookings/${booking.bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Full booking details from database:', data.booking);
          setFullBookingDetails(data.booking);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (booking.bookingId) {
      fetchBookingDetails();
    }
  }, [booking, navigate]);

  const handleConfirmBooking = async () => {
    try {
      console.log('=== BOOKING CONFIRMATION START ===');
      setIsConfirming(true);
      setError('');

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in. Redirecting...');
        setTimeout(() => navigate('/login', { state: { booking } }), 2000);
        setIsConfirming(false);
        return;
      }

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      console.log('Building payload with booking data:', {
        date: booking.date,
        time: booking.time,
        from: booking.from,
        to: booking.to,
        vehicle: booking.vehicle,
        passengerInfo: booking.passengerInfo
      });

      // Parse and validate date
      let pickupDate;
      try {
        if (booking.date) {
          pickupDate = new Date(booking.date);
          if (isNaN(pickupDate.getTime())) {
            throw new Error('Invalid date');
          }
          pickupDate = pickupDate.toISOString();
        } else {
          pickupDate = new Date().toISOString();
        }
      } catch (dateError) {
        console.error('Date parsing error:', dateError);
        setError('Invalid date format. Please go back and select a valid date.');
        setIsConfirming(false);
        return;
      }

      const bookingPayload = {
        rideType: booking.rideType || 'one-way',
        pickupLocation: {
          address: booking.from || 'Unknown',
          placeId: booking.fromPlaceId || '',
          coordinates: {
            lat: booking.fromLat || 0,
            lng: booking.fromLng || 0,
          },
        },
        dropoffLocation: booking.to ? {
          address: booking.to,
          placeId: booking.toPlaceId || '',
          coordinates: {
            lat: booking.toLat || 0,
            lng: booking.toLng || 0,
          },
        } : undefined,
        pickupDate: pickupDate,
        pickupTime: booking.time || '12:00',
        duration: booking.duration,
        vehicleClass: {
          id: booking.vehicle?.id || 'unknown',
          name: booking.vehicle?.name || 'Unknown',
          vehicle: booking.vehicle?.vehicle || 'Unknown',
          passengers: booking.vehicle?.passengers || 1,
          luggage: booking.vehicle?.luggage || 0,
        },
        passengerInfo: booking.passengerInfo || {
          firstName: 'Guest',
          lastName: 'User',
          email: 'guest@example.com',
          phone: '0000000000'
        },
        basePrice: booking.vehicle?.price || 0,
        totalPrice: booking.vehicle?.price || 0,
      };

      console.log('Sending booking request with payload:', bookingPayload);

      const bookingResponse = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload),
      });

      const bookingData = await bookingResponse.json();
      console.log('Booking response:', bookingData);

      if (!bookingResponse.ok) {
        setError(bookingData.message || 'Failed to create booking');
        setIsConfirming(false);
        return;
      }

      console.log('✅ Booking created successfully!');
      console.log('Booking ID:', bookingData.booking.id || bookingData.booking._id);
      console.log('Booking Reference:', bookingData.booking.bookingReference);

      // Try to update payment status (optional - booking is already created)
      try {
        const bookingId = bookingData.booking.id || bookingData.booking._id;
        console.log('Updating payment for booking:', bookingId);
        
        const paymentResponse = await fetch(`${API_BASE}/api/bookings/${bookingId}/payment`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentStatus: 'completed',
            paymentMethod: 'pay_on_arrival',
            transactionId: `TXN-${Date.now()}`,
          }),
        });

        const paymentData = await paymentResponse.json();
        console.log('Payment update response:', paymentData);

        if (paymentResponse.ok) {
          console.log('✅ Payment status updated');
        } else {
          console.warn('⚠️ Payment update failed, but booking was created');
        }
      } catch (paymentError) {
        console.warn('⚠️ Payment update error (booking still created):', paymentError);
      }

      // Success! Show confirmation even if payment update failed
      const newBookingId = bookingData.booking.id || bookingData.booking._id;
      setFullBookingDetails(bookingData.booking);
      setIsConfirmed(true);
      setIsConfirming(false);

      console.log('✅ Booking confirmed!', bookingData.booking.bookingReference);
      // Navigate to dedicated confirmation page with full summary
      if (newBookingId) {
        navigate(`/booking-confirmation/${newBookingId}`, { replace: true });
      }
    } catch (err) {
      console.error('Error:', err);
      setError(`Failed: ${err.message}`);
      setIsConfirming(false);
    }
  };

  const handleDownloadReceipt = () => {
    try {
      console.log('=== RECEIPT DOWNLOAD DEBUG ===');
      console.log('Full booking details:', fullBookingDetails);
      console.log('Booking ref:', bookingRef);
      console.log('Booking object:', booking);
      
      // Use full booking details if available, otherwise construct from displayed booking
      const displayedBooking = fullBookingDetails || displayBooking;
      
      const bookingForPDF = {
        _id: displayedBooking._id || 'temp-id',
        bookingReference: displayedBooking.bookingReference || bookingRef || 'BK-TEMP',
        status: displayedBooking.status || 'confirmed',
        pickupLocation: { 
          address: displayedBooking.pickupLocation?.address || displayedBooking.from || booking.from || 'N/A'
        },
        dropoffLocation: (displayedBooking.dropoffLocation?.address || displayedBooking.to || booking.to) ? { 
          address: displayedBooking.dropoffLocation?.address || displayedBooking.to || booking.to
        } : null,
        pickupDate: displayedBooking.pickupDate || booking.date || new Date(),
        pickupTime: displayedBooking.pickupTime || booking.time || '12:00',
        vehicleClass: {
          name: displayedBooking.vehicleClass?.name || booking.vehicle?.name || 'N/A',
          vehicle: displayedBooking.vehicleClass?.vehicle || booking.vehicle?.vehicle || 'N/A',
          passengers: displayedBooking.vehicleClass?.passengers || booking.vehicle?.passengers || 1,
          luggage: displayedBooking.vehicleClass?.luggage || booking.vehicle?.luggage || 0
        },
        passengerInfo: displayedBooking.passengerInfo || booking.passengerInfo || {
          firstName: 'Guest',
          lastName: 'User',
          email: 'guest@example.com',
          phone: '0000000000'
        },
        basePrice: displayedBooking.basePrice || booking.vehicle?.price || 0,
        totalPrice: displayedBooking.totalPrice || booking.vehicle?.price || 0,
        paymentStatus: displayedBooking.paymentStatus || 'completed',
        paymentMethod: displayedBooking.paymentMethod || 'pay_on_arrival',
        transactionId: displayedBooking.transactionId || `TXN-${Date.now()}`,
        createdAt: displayedBooking.createdAt || new Date(),
      };
      
      console.log('Booking data for PDF:', bookingForPDF);
      console.log('Calling generateSimpleInvoicePDF...');
      
      generateSimpleInvoicePDF(bookingForPDF);
      
      console.log('✅ Receipt downloaded successfully');
    } catch (error) {
      console.error('❌ Error downloading receipt:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      alert(`Failed to download receipt: ${error.message}`);
    }
  };

  const handleEmailReceipt = () => {
    // Implement email receipt functionality
    alert('Receipt will be sent to your email');
  };

  // Use database details if available, otherwise use passed booking data
  const displayBooking = fullBookingDetails || booking;
  const bookingRef = displayBooking.bookingReference || booking.bookingReference;

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div style={{textAlign: 'center', padding: '60px 20px'}}>
            <div className="spinner" style={{margin: '0 auto 20px', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            <p>Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Progress Steps */}
        <div className="booking-progress">
          <div className="progress-step completed">
            <div className="step-circle">✓</div>
            <span>Service Class</span>
          </div>
          <div className="progress-line completed"></div>
          <div className="progress-step completed">
            <div className="step-circle">✓</div>
            <span>Pickup Info</span>
          </div>
          <div className="progress-line completed"></div>
          <div className="progress-step completed">
            <div className="step-circle">✓</div>
            <span>Log in</span>
          </div>
          <div className="progress-line completed"></div>
          <div className="progress-step active">
            <div className="step-circle">4</div>
            <span>Checkout</span>
          </div>
        </div>

        {/* Success Message or Confirmation */}
        {isConfirmed ? (
          <div className="success-section">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h1>Booking Confirmed!</h1>
            <p className="success-subtitle">
              Your booking has been successfully confirmed.
              {fullBookingDetails && <span style={{display: 'block', marginTop: '8px', fontSize: '14px', color: '#28a745'}}>✓ Saved to database</span>}
            </p>
            <div className="booking-reference">
              <span>Booking Reference:</span>
              <strong>{bookingRef || 'N/A'}</strong>
            </div>
          </div>
        ) : (
          <div className="success-section">
            <h1>Review Your Booking</h1>
            <p className="success-subtitle">
              Please review your booking details below and confirm to complete your reservation.
            </p>
            {error && (
              <div className="error-message" style={{marginTop: '20px', padding: '15px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '8px', color: '#c00'}}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Booking Details */}
        <div className="confirmation-details">
          <div className="details-card">
            <h2>Booking Details</h2>
            
            <div className="detail-section">
              <h3><Calendar size={20} /> Trip Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Pickup Location</span>
                  <span className="detail-value">
                    {fullBookingDetails?.pickupLocation?.address || booking.from || 'N/A'}
                  </span>
                </div>
                {(fullBookingDetails?.dropoffLocation?.address || booking.to) && (
                  <div className="detail-item">
                    <span className="detail-label">Dropoff Location</span>
                    <span className="detail-value">
                      {fullBookingDetails?.dropoffLocation?.address || booking.to}
                    </span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">
                    {fullBookingDetails ? new Date(fullBookingDetails.pickupDate).toLocaleDateString() : booking.date}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">
                    {fullBookingDetails?.pickupTime || booking.time}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Booking Status</span>
                  <span className="detail-value" style={{color: '#28a745', fontWeight: 'bold'}}>
                    {fullBookingDetails?.status?.toUpperCase() || 'CONFIRMED'}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3><User size={20} /> Vehicle Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Class</span>
                  <span className="detail-value">
                    {fullBookingDetails?.vehicleClass?.name || booking.vehicle?.name || 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Vehicle</span>
                  <span className="detail-value">
                    {fullBookingDetails?.vehicleClass?.vehicle || booking.vehicle?.vehicle || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3><User size={20} /> Passenger Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">
                    {fullBookingDetails?.passengerInfo?.firstName || booking.passengerInfo?.firstName} {fullBookingDetails?.passengerInfo?.lastName || booking.passengerInfo?.lastName}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">
                    {fullBookingDetails?.passengerInfo?.email || booking.passengerInfo?.email}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">
                    {fullBookingDetails?.passengerInfo?.phone || booking.passengerInfo?.phone}
                  </span>
                </div>
                {(fullBookingDetails?.passengerInfo?.flightNumber || booking.passengerInfo?.flightNumber) && (
                  <div className="detail-item">
                    <span className="detail-label">Flight Number</span>
                    <span className="detail-value">
                      {fullBookingDetails?.passengerInfo?.flightNumber || booking.passengerInfo.flightNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3><CreditCard size={20} /> Payment Summary</h3>
              <div className="payment-summary">
                <div className="payment-item">
                  <span>Base Fare</span>
                  <span>US${(fullBookingDetails?.basePrice || booking.vehicle?.price || 0).toFixed(2)}</span>
                </div>
                <div className="payment-item">
                  <span>Taxes & Fees</span>
                  <span>Included</span>
                </div>
                <div className="payment-item total">
                  <span>{isConfirmed ? 'Total Paid' : 'Total Amount'}</span>
                  <span className="total-amount">US${(fullBookingDetails?.totalPrice || booking.vehicle?.price || 0).toFixed(2)}</span>
                </div>
                {isConfirmed ? (
                  <>
                    <div className="payment-status">
                      <CheckCircle size={16} />
                      <span>Payment {fullBookingDetails?.paymentStatus?.toUpperCase() || 'CONFIRMED'}</span>
                      {fullBookingDetails?.paymentMethod && (
                        <span style={{marginLeft: '10px', fontSize: '12px', color: '#6c757d'}}>
                          via {fullBookingDetails.paymentMethod.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    {fullBookingDetails?.transactionId && (
                      <div style={{marginTop: '10px', fontSize: '13px', color: '#6c757d'}}>
                        Transaction ID: {fullBookingDetails.transactionId}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="payment-status" style={{backgroundColor: '#fff3cd', padding: '12px', borderRadius: '6px', marginTop: '10px'}}>
                    <Info size={16} style={{color: '#856404'}} />
                    <span style={{color: '#856404', fontWeight: '500'}}>Payment on Arrival</span>
                    <p style={{fontSize: '13px', color: '#856404', marginTop: '8px', marginBottom: 0}}>
                      You can pay the chauffeur directly upon arrival using cash or card.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="confirmation-actions">
          {isConfirmed ? (
            <>
              <button className="btn-secondary" onClick={handleDownloadReceipt}>
                <Download size={20} />
                Download Receipt
              </button>
              <button className="btn-secondary" onClick={handleEmailReceipt}>
                <Mail size={20} />
                Email Receipt
              </button>
              <button className="btn-primary" onClick={() => navigate('/')}>
                Back to Home
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn-secondary" 
                onClick={() => navigate(-1)}
                disabled={isConfirming}
              >
                Back
              </button>
              <button 
                className="btn-primary" 
                onClick={handleConfirmBooking}
                disabled={isConfirming}
                style={{minWidth: '200px'}}
              >
                {isConfirming ? (
                  <>
                    <span className="spinner" style={{display: 'inline-block', width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px'}}></span>
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Confirm Booking
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Next Steps */}
        {isConfirmed && (
          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>You will receive a confirmation email shortly with all booking details.</li>
              <li>A chauffeur will be assigned to your booking closer to your pickup date.</li>
              <li>You can track your chauffeur's location on the day of your trip.</li>
              <li>Your chauffeur will wait 15 minutes free of charge at the pickup location.</li>
              <li>Payment can be made directly to the chauffeur upon arrival.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
