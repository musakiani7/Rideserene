import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Shield, Check, Info, Calendar, MapPin } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';
import './PaymentPage.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = useMemo(() => location.state?.booking || {}, [location.state]);

  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [billingAddress, setBillingAddress] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  // Check authentication and create payment intent for Stripe
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { booking } });
      return;
    }
    
    if (!booking.vehicle) {
      navigate('/');
      return;
    }

    // Create Stripe payment intent when component mounts
    const createPaymentIntent = async () => {
      if (paymentMethod === 'stripe' && !clientSecret) {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        try {
          const response = await fetch(`${API_BASE}/api/stripe/create-payment-intent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              amount: booking.vehicle.price,
              currency: 'usd',
              bookingDetails: {
                from: booking.from,
                to: booking.to,
                date: booking.date,
                time: booking.time,
              }
            }),
          });

          const data = await response.json();
          
          if (data.success) {
            setClientSecret(data.clientSecret);
            setPaymentIntentId(data.paymentIntentId);
          } else {
            setError('Failed to initialize payment. Please try again.');
          }
        } catch (err) {
          console.error('Error creating payment intent:', err);
          setError('Failed to initialize payment. Please try again.');
        }
      }
    };

    createPaymentIntent();
  }, [navigate, booking, paymentMethod, clientSecret]);

  const handleCardInputChange = (e) => {
    let { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      value = value.substring(0, 19); // Max 16 digits + 3 spaces
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
    }
    
    // Limit CVV
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setCardData({ ...cardData, [name]: value });
  };

  const handleBillingChange = (e) => {
    setBillingAddress({ ...billingAddress, [e.target.name]: e.target.value });
  };

  const handleStripePaymentSuccess = async (paymentIntent) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      // Create the booking
      const bookingResponse = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rideType: booking.rideType,
          pickupLocation: {
            address: booking.from,
            placeId: booking.fromPlaceId,
            coordinates: {
              lat: booking.fromLat,
              lng: booking.fromLng,
            },
          },
          dropoffLocation: booking.to ? {
            address: booking.to,
            placeId: booking.toPlaceId,
            coordinates: {
              lat: booking.toLat,
              lng: booking.toLng,
            },
          } : undefined,
          pickupDate: new Date(booking.date).toISOString(),
          pickupTime: booking.time,
          duration: booking.duration,
          vehicleClass: {
            id: booking.vehicle.id,
            name: booking.vehicle.name,
            vehicle: booking.vehicle.vehicle,
            passengers: booking.vehicle.passengers,
            luggage: booking.vehicle.luggage,
          },
          passengerInfo: booking.passengerInfo,
          basePrice: booking.vehicle.price,
          totalPrice: booking.vehicle.price,
        }),
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        setError(bookingData.message || 'Failed to create booking');
        setIsProcessing(false);
        return;
      }

      // Update payment status with Stripe payment intent
      const paymentResponse = await fetch(`${API_BASE}/api/bookings/${bookingData.booking.id}/payment`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentStatus: 'completed',
          paymentMethod: 'stripe',
          transactionId: paymentIntent.id,
          paymentIntentId: paymentIntent.id,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        setError(paymentData.message || 'Payment update failed');
        setIsProcessing(false);
        return;
      }

      // Success! Navigate to confirmation
      navigate('/checkout', { 
        state: { 
          booking: {
            ...booking,
            bookingReference: bookingData.booking.bookingReference,
            bookingId: bookingData.booking.id,
            paymentStatus: 'completed',
            paymentIntentId: paymentIntent.id,
          }
        }
      });
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to complete booking. Please contact support.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    if (!token) {
      setError('You must be logged in to complete payment. Redirecting...');
      setTimeout(() => navigate('/login', { state: { booking } }), 2000);
      setIsProcessing(false);
      return;
    }

    try {
      // Create the booking
      const bookingResponse = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rideType: booking.rideType,
          pickupLocation: {
            address: booking.from,
            placeId: booking.fromPlaceId,
            coordinates: {
              lat: booking.fromLat,
              lng: booking.fromLng,
            },
          },
          dropoffLocation: booking.to ? {
            address: booking.to,
            placeId: booking.toPlaceId,
            coordinates: {
              lat: booking.toLat,
              lng: booking.toLng,
            },
          } : undefined,
          pickupDate: new Date(booking.date).toISOString(),
          pickupTime: booking.time,
          duration: booking.duration,
          vehicleClass: {
            id: booking.vehicle.id,
            name: booking.vehicle.name,
            vehicle: booking.vehicle.vehicle,
            passengers: booking.vehicle.passengers,
            luggage: booking.vehicle.luggage,
          },
          passengerInfo: booking.passengerInfo,
          basePrice: booking.vehicle.price,
          totalPrice: booking.vehicle.price,
        }),
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        setError(bookingData.message || 'Failed to create booking');
        setIsProcessing(false);
        return;
      }

      // Simulate payment processing for non-Stripe methods
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update payment status
      const paymentResponse = await fetch(`${API_BASE}/api/bookings/${bookingData.booking.id}/payment`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentStatus: 'completed',
          paymentMethod: paymentMethod,
          transactionId: `TXN-${Date.now()}`,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        setError(paymentData.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // Success! Navigate to confirmation
      navigate('/checkout', { 
        state: { 
          booking: {
            ...booking,
            bookingReference: bookingData.booking.bookingReference,
            bookingId: bookingData.booking.id,
            paymentStatus: 'completed',
          }
        }
      });
    } catch (err) {
      console.error('Payment error:', err);
      setError('Unable to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
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
          <div className="progress-line active"></div>
          <div className="progress-step active">
            <div className="step-circle">4</div>
            <span>Payment</span>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-circle">5</div>
            <span>Checkout</span>
          </div>
        </div>

        <div className="payment-content">
          {/* Left Side - Booking Summary */}
          <div className="booking-summary-section">
            <h2>Booking Summary</h2>
            
            <div className="summary-card">
              <div className="summary-header">
                <h3>Trip Details</h3>
              </div>
              
              <div className="summary-item">
                <MapPin size={18} />
                <div>
                  <span className="label">From:</span>
                  <span className="value">{booking.from || 'N/A'}</span>
                </div>
              </div>
              
              {booking.to && (
                <div className="summary-item">
                  <MapPin size={18} />
                  <div>
                    <span className="label">To:</span>
                    <span className="value">{booking.to}</span>
                  </div>
                </div>
              )}
              
              <div className="summary-item">
                <Calendar size={18} />
                <div>
                  <span className="label">Date & Time:</span>
                  <span className="value">{booking.date} at {booking.time}</span>
                </div>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-item">
                <span className="label">Vehicle:</span>
                <span className="value">{booking.vehicle?.name}</span>
              </div>
              
              <div className="summary-item small">
                <span className="value">{booking.vehicle?.vehicle}</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-item">
                <span className="label">Passenger:</span>
                <span className="value">{booking.passengerInfo?.firstName} {booking.passengerInfo?.lastName}</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="price-breakdown">
                <div className="price-item">
                  <span>Base Fare</span>
                  <span>US${booking.vehicle?.price?.toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Taxes & Fees</span>
                  <span>Included</span>
                </div>
                <div className="price-item total">
                  <span>Total Amount</span>
                  <span className="total-price">US${booking.vehicle?.price?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="security-notice">
              <Shield size={20} />
              <div>
                <strong>Secure Payment</strong>
                <p>Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Form */}
          <div className="payment-form-section">
            <h1>Payment Information</h1>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="payment-form">
              {/* Payment Method Selection */}
              <div className="payment-methods">
                <label className={`payment-method-option ${paymentMethod === 'stripe' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <CreditCard size={24} />
                  <span>Stripe Payment</span>
                </label>

                <label className={`payment-method-option ${paymentMethod === 'credit_card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <CreditCard size={24} />
                  <span>Credit/Debit Card</span>
                </label>
                
                <label className={`payment-method-option ${paymentMethod === 'paypal' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span style={{fontSize: '20px', fontWeight: 'bold', color: '#003087'}}>PayPal</span>
                </label>
              </div>

              {paymentMethod === 'stripe' && clientSecret && (
                <div className="form-section">
                  <h3>Secure Payment with Stripe</h3>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm 
                      amount={booking.vehicle?.price}
                      onSuccess={handleStripePaymentSuccess}
                      onError={(error) => setError(error.message)}
                      isProcessing={isProcessing}
                      setIsProcessing={setIsProcessing}
                    />
                  </Elements>
                </div>
              )}

              {paymentMethod === 'credit_card' && (
                <>
                  {/* Card Details */}
                  <div className="form-section">
                    <h3>Card Details</h3>
                    
                    <div className="form-group">
                      <label htmlFor="cardNumber">
                        <CreditCard size={16} />
                        Card Number *
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={handleCardInputChange}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="cardName">Name on Card *</label>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        value={cardData.cardName}
                        onChange={handleCardInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date *</label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={cardData.expiryDate}
                          onChange={handleCardInputChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="cvv">
                          CVV *
                          <Lock size={14} />
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={cardData.cvv}
                          onChange={handleCardInputChange}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="form-section">
                    <h3>Billing Address</h3>
                    
                    <div className="form-group">
                      <label htmlFor="address">Street Address *</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={billingAddress.address}
                        onChange={handleBillingChange}
                        placeholder="123 Main Street"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="city">City *</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={billingAddress.city}
                          onChange={handleBillingChange}
                          placeholder="New York"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="state">State *</label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={billingAddress.state}
                          onChange={handleBillingChange}
                          placeholder="NY"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="zipCode">ZIP Code *</label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={billingAddress.zipCode}
                          onChange={handleBillingChange}
                          placeholder="10001"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="country">Country *</label>
                        <select
                          id="country"
                          name="country"
                          value={billingAddress.country}
                          onChange={handleBillingChange}
                          required
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === 'paypal' && (
                <div className="paypal-notice">
                  <Info size={20} />
                  <p>You will be redirected to PayPal to complete your payment securely.</p>
                </div>
              )}

              {/* Terms and Submit */}
              <div className="terms-section">
                <label className="checkbox-label">
                  <input type="checkbox" required />
                  <span>I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></span>
                </label>
              </div>

              {paymentMethod !== 'stripe' && (
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-back"
                    onClick={() => navigate(-1)}
                    disabled={isProcessing}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn-pay"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Pay US${booking.vehicle?.price?.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              )}

              {paymentMethod === 'stripe' && (
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-back"
                    onClick={() => navigate(-1)}
                    disabled={isProcessing}
                  >
                    Back
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
