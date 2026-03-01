import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Briefcase, Check, ChevronDown, Info, Clock, MapPin } from 'lucide-react';
import { PRICING } from '../config/pricing';
import './SearchResults.css';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const vehicleClasses = [
  {
    id: 'business',
    name: 'Business Class',
    passengers: 3,
    luggage: 2,
    vehicle: 'Mercedes-Benz E-Class or similar',
    image: '/images/business-class.png',
    description: 'Perfect for business travelers seeking comfort and style'
  },
  {
    id: 'business-van',
    name: 'Business Van/SUV',
    passengers: 5,
    luggage: 5,
    vehicle: 'Mercedes-Benz V-Class or similar',
    image: '/images/business-van.png',
    description: 'Spacious luxury for groups and families'
  },
  {
    id: 'first',
    name: 'First Class',
    passengers: 3,
    luggage: 2,
    vehicle: 'Mercedes-Benz S-Class or similar',
    image: '/images/first-class.png',
    description: 'Ultimate luxury and prestige'
  }
];

const SearchResults = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState('business');
  const [expandedVehicle, setExpandedVehicle] = useState(null);

  const rideType = query.get('rideType') || 'one-way';
  const from = query.get('from') || '';
  const to = query.get('to') || '';
  const date = query.get('date') || '';
  const time = query.get('time') || '';
  const duration = query.get('duration') || '2';

  // Initial-stage pricing: local (NYC) airport $197, hourly $97/hr
  const hours = Math.max(1, parseInt(duration, 10) || 2);
  const computedPrice = rideType === 'by-hour'
    ? PRICING.HOURLY_RATE_PER_HOUR * hours
    : PRICING.LOCAL_AIRPORT_TRANSFER;

  // Calculate estimated arrival time (placeholder logic)
  const calculateArrivalTime = () => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const pickupTime = new Date();
    pickupTime.setHours(parseInt(hours), parseInt(minutes));
    // Add 2 hours as example travel time
    pickupTime.setHours(pickupTime.getHours() + 2);
    return pickupTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Calculate distance (placeholder)
  const calculateDistance = () => {
    return '2523'; // km - this should be calculated based on actual locations
  };

  const handleContinue = () => {
    const selectedVehicleData = vehicleClasses.find(v => v.id === selectedVehicle);
    navigate('/pickup-info', { 
      state: { 
        booking: {
          rideType,
          from,
          to,
          date,
          time,
          duration,
          vehicle: { ...selectedVehicleData, price: computedPrice }
        }
      }
    });
  };

  return (
    <div className="search-results-page">
      <div className="search-results-container">
        {/* Progress Steps */}
        <div className="booking-progress">
          <div className="progress-step active">
            <div className="step-circle">1</div>
            <span>Service Class</span>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
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
            <span>Payment</span>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-circle">5</div>
            <span>Checkout</span>
          </div>
        </div>

        {/* Trip Summary */}
        <div className="trip-summary">
          <div className="trip-info">
            <div className="trip-date-time">
              <Clock size={16} />
              <span>{date ? new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''} at {time}</span>
            </div>
            <div className="trip-route">
              <div className="route-point">
                <MapPin size={16} />
                <span className="route-location">{from || 'Not specified'}</span>
              </div>
              <div className="route-arrow">→</div>
              <div className="route-point">
                <MapPin size={16} />
                <span className="route-location">{to || 'Not specified'}</span>
              </div>
            </div>
            <div className="trip-details">
              <span>Estimated arrival at {calculateArrivalTime()}</span>
              <span>• {calculateDistance()} km</span>
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="vehicle-selection">
          <h1>Select a vehicle class</h1>
          <p className="selection-subtitle">All prices include estimated VAT, fees, and tolls</p>

          <div className="vehicle-list">
            {vehicleClasses.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`vehicle-card ${selectedVehicle === vehicle.id ? 'selected' : ''}`}
                onClick={() => setSelectedVehicle(vehicle.id)}
              >
                <div className="vehicle-card-content">
                  <div className="vehicle-image">
                    <img src={vehicle.image} alt={vehicle.name} onError={(e) => {
                      e.target.style.display = 'none';
                    }} />
                  </div>
                  <div className="vehicle-info">
                    <h3>{vehicle.name}</h3>
                    <div className="vehicle-capacity">
                      <span><Users size={16} /> {vehicle.passengers}</span>
                      <span><Briefcase size={16} /> {vehicle.luggage}</span>
                    </div>
                    <p className="vehicle-model">{vehicle.vehicle}</p>
                  </div>
                  <div className="vehicle-price">
                    <span className="price-amount">US${computedPrice.toFixed(2)}{rideType === 'by-hour' ? ` (${hours} hr)` : ''}</span>
                    <button
                      className="expand-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedVehicle(expandedVehicle === vehicle.id ? null : vehicle.id);
                      }}
                    >
                      <ChevronDown 
                        size={20} 
                        className={`chevron ${expandedVehicle === vehicle.id ? 'rotated' : ''}`}
                      />
                    </button>
                  </div>
                </div>
                
                {expandedVehicle === vehicle.id && (
                  <div className="vehicle-details">
                    <p>{vehicle.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Promotion Notice */}
          <div className="promotion-notice">
            <Info size={18} />
            <span>Eligible promotion auto-applied.</span>
          </div>

          {/* Included Features */}
          <div className="included-features">
            <h3>All classes include:</h3>
            <ul>
              <li><Check size={16} /> Free cancellation up until 1 hour before pickup</li>
              <li><Check size={16} /> Free 15 minutes of wait time</li>
              <li><Check size={16} /> Meet & Greet</li>
              <li><Check size={16} /> Complimentary bottle of water</li>
              <li><Check size={16} /> Complimentary in-vehicle WiFi</li>
              <li><Check size={16} /> Tissues and sanitizer</li>
              <li><Check size={16} /> Android and iPhone chargers</li>
            </ul>
          </div>

          {/* Important Notes */}
          <div className="important-notes">
            <h3>Please note:</h3>
            <ul>
              <li>
                <Info size={16} />
                <span>Guest/luggage capacities must be abided by for safety reasons. If you are unsure, select a larger class as chauffeurs may turn down service when they are exceeded.</span>
              </li>
              <li>
                <Info size={16} />
                <span>The vehicle images above are examples. You may get a different vehicle of similar quality.</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="terms-link">View terms & conditions</a>
            <button className="btn-continue" onClick={handleContinue}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
