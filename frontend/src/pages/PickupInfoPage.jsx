import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Calendar, Clock, User, Phone, Mail, Info } from 'lucide-react';
import './PickupInfoPage.css';

const PickupInfoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking || {};

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    flightNumber: '',
    specialRequests: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if user is already logged in
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      // User is logged in, go directly to checkout
      navigate('/checkout', { 
        state: { 
          booking: {
            ...booking,
            passengerInfo: formData
          }
        }
      });
    } else {
      // User needs to login, navigate to login page
      navigate('/login', { 
        state: { 
          booking: {
            ...booking,
            passengerInfo: formData
          }
        }
      });
    }
  };

  return (
    <div className="pickup-info-page">
      <div className="pickup-info-container">
        {/* Progress Steps */}
        <div className="booking-progress">
          <div className="progress-step completed">
            <div className="step-circle">✓</div>
            <span>Service Class</span>
          </div>
          <div className="progress-line active"></div>
          <div className="progress-step active">
            <div className="step-circle">2</div>
            <span>Pickup Info</span>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-circle">3</div>
            <span>Log in</span>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-circle">4</div>
            <span>Checkout</span>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="booking-summary">
          <h2>Your Selection</h2>
          <div className="summary-details">
            <div className="summary-item">
              <MapPin size={18} />
              <div>
                <span className="label">From:</span>
                <span className="value">{booking.from || 'N/A'}</span>
              </div>
            </div>
            <div className="summary-item">
              <MapPin size={18} />
              <div>
                <span className="label">To:</span>
                <span className="value">{booking.to || 'N/A'}</span>
              </div>
            </div>
            <div className="summary-item">
              <Calendar size={18} />
              <div>
                <span className="label">Date & Time:</span>
                <span className="value">{booking.date} at {booking.time}</span>
              </div>
            </div>
            <div className="summary-item">
              <span className="label">Vehicle:</span>
              <span className="value">{booking.vehicle?.name || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="label">Price:</span>
              <span className="value price">US${booking.vehicle?.price?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Passenger Information Form */}
        <div className="passenger-form-section">
          <h1>Passenger Information</h1>
          <p className="form-subtitle">Please provide details for the main passenger</p>

          <form onSubmit={handleSubmit} className="passenger-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  <User size={16} />
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  <User size={16} />
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={16} />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <Phone size={16} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="flightNumber">
                Flight Number (Optional)
              </label>
              <input
                type="text"
                id="flightNumber"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleInputChange}
                placeholder="e.g., AA1234"
              />
              <small>For airport pickups - helps us track delays</small>
            </div>

            <div className="form-group">
              <label htmlFor="specialRequests">
                Special Requests (Optional)
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows="4"
                placeholder="Any special requirements or requests..."
              />
            </div>

            <div className="info-notice">
              <Info size={18} />
              <span>Your information is secure and will only be used for this booking.</span>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-back"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
              <button type="submit" className="btn-continue">
                Continue to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PickupInfoPage;
