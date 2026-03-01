import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Car, Phone, User, Edit, X, Plus, Save, FileText, Clock } from 'lucide-react';
import { PRICING } from '../../config/pricing';
import './DashboardTabs.css';

const UpcomingRidesTab = () => {
  const navigate = useNavigate();
  const [scheduledRides, setScheduledRides] = useState([]);
  const [previousRides, setPreviousRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('scheduled'); // 'scheduled' or 'previous'
  const [selectedRide, setSelectedRide] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRide, setEditingRide] = useState(null);
  const [formData, setFormData] = useState({
    rideType: 'hourly',
    pickupLocation: { address: '', lat: 0, lng: 0 },
    dropoffLocation: { address: '', lat: 0, lng: 0 },
    pickupDate: '',
    pickupTime: '',
    duration: 4,
    vehicleClass: {
      name: 'Business Sedan',
      vehicle: 'Mercedes S-Class',
      basePrice: PRICING.HOURLY_RATE_PER_HOUR
    },
    passengerInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    fetchAllRides();
    
    // Auto-refresh every 30 seconds to get latest status updates
    const refreshInterval = setInterval(() => {
      fetchAllRides();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchAllRides = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      setLoading(true);
      // Fetch both upcoming rides and ride history
      const [upcomingRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard/upcoming-rides`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/dashboard/ride-history?page=1&limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [upcomingData, historyData] = await Promise.all([
        upcomingRes.json(),
        historyRes.json()
      ]);

      // Scheduled rides: all pending, confirmed, assigned, in-progress rides
      // Combine from both endpoints to ensure we get all scheduled rides
      const allScheduledRides = [
        ...(upcomingData.success ? upcomingData.data || [] : []),
        ...(historyData.success ? (historyData.data || []).filter((r) => 
          ['pending', 'confirmed', 'assigned', 'in-progress'].includes(r.status)
        ) : [])
      ];
      
      // Remove duplicates by booking ID and filter by status
      const scheduledRaw = Array.from(
        new Map(allScheduledRides.map(ride => [ride._id || ride.id, ride])).values()
      ).filter((r) => ['pending', 'confirmed', 'assigned', 'in-progress'].includes(r.status));
      
      // Sort scheduled rides by pickup date/time (earliest first)
      const scheduled = scheduledRaw.sort((a, b) => {
        const dateA = new Date(`${a.pickupDate}T${a.pickupTime || '00:00'}`);
        const dateB = new Date(`${b.pickupDate}T${b.pickupTime || '00:00'}`);
        return dateA - dateB;
      });

      // Previous rides: completed or cancelled only
      const previousRaw = (historyData.success ? historyData.data || [] : [])
        .filter((r) => ['completed', 'cancelled'].includes(r.status))
        .sort((a, b) => {
          // Sort by completedAt or createdAt, most recent first
          const dateA = a.completedAt ? new Date(a.completedAt) : new Date(a.createdAt);
          const dateB = b.completedAt ? new Date(b.completedAt) : new Date(b.createdAt);
          return dateB - dateA;
        });
      
      // Remove duplicates by booking ID
      const previous = Array.from(
        new Map(previousRaw.map(ride => [ride._id || ride.id, ride])).values()
      );

      setScheduledRides(scheduled);
      setPreviousRides(previous);
    } catch (error) {
      console.error('Fetch rides error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      rideType: 'hourly',
      pickupLocation: { address: '', lat: 0, lng: 0 },
      dropoffLocation: { address: '', lat: 0, lng: 0 },
      pickupDate: '',
      pickupTime: '',
      duration: 4,
      vehicleClass: {
        name: 'Business Sedan',
        vehicle: 'Mercedes S-Class',
        basePrice: PRICING.HOURLY_RATE_PER_HOUR
      },
      passengerInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCreateRide = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    let bookingCreated = false;
    let responseData = null;

    try {
      const isHourly = formData.rideType === 'hourly';
      const totalPrice = isHourly ? PRICING.HOURLY_RATE_PER_HOUR * formData.duration : PRICING.LOCAL_AIRPORT_TRANSFER;
      const bookingData = {
        ...formData,
        basePrice: totalPrice,
        totalPrice,
        estimatedDistance: 0,
        estimatedArrivalTime: formData.pickupTime,
        taxes: 0,
        fees: 0,
        discount: 0,
        currency: 'USD'
      };

      console.log('Creating ride request:', bookingData);

      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      // Check response status first
      const isOk = response.ok && (response.status >= 200 && response.status < 300);
      
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        // If we can't parse JSON but got a 201/200, booking might still be created
        if (isOk) {
          bookingCreated = true;
        }
        throw new Error('Invalid response from server');
      }
      
      // Check both response status and success flag
      if (isOk && responseData && responseData.success) {
        bookingCreated = true;
        console.log('✅ Ride created successfully:', responseData.booking);
        alert('Ride request created successfully!');
        setShowCreateModal(false);
        resetForm();
        // Refresh the ride list to show the new ride
        await fetchAllRides();
      } else {
        // Response received but indicates failure
        const errorMessage = responseData?.message || responseData?.error || `Server returned status ${response.status}`;
        console.error('❌ Create ride failed:', { status: response.status, statusText: response.statusText, data: responseData });
        alert(`Failed to create ride: ${errorMessage}`);
        
        // Still refresh to check if booking was created despite error response
        // (handles edge cases where booking succeeds but response indicates failure)
        setTimeout(async () => {
          try {
            await fetchAllRides();
          } catch (refreshError) {
            console.error('Error refreshing rides:', refreshError);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Create ride error:', error);
      
      // Network error or other exception - booking might still have been created
      // Refresh after a delay to check
      alert('There was an issue creating your ride request. Please check your ride list to confirm if it was created.');
      
      setTimeout(async () => {
        try {
          await fetchAllRides();
          // Check if a new ride appeared (indicating it was created)
          // We can't easily detect this without storing previous state, 
          // but refreshing will show it to the user
        } catch (refreshError) {
          console.error('Error refreshing rides:', refreshError);
        }
      }, 1500);
    }
  };

  const handleEditRide = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const updateData = {
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        passengerInfo: formData.passengerInfo
      };

      const response = await fetch(`${API_BASE}/api/bookings/${editingRide._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Ride updated successfully!');
        setShowEditModal(false);
        setEditingRide(null);
        resetForm();
        fetchAllRides();
      } else {
        alert(`Failed to update ride: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Edit ride error:', error);
      alert('Failed to update ride. Please try again.');
    }
  };

  const openEditModal = (ride) => {
    setEditingRide(ride);
    setFormData({
      rideType: ride.rideType,
      pickupLocation: ride.pickupLocation,
      dropoffLocation: ride.dropoffLocation || { address: '', lat: 0, lng: 0 },
      pickupDate: ride.pickupDate.split('T')[0],
      pickupTime: ride.pickupTime,
      duration: ride.duration || 4,
      vehicleClass: ride.vehicleClass,
      passengerInfo: ride.passengerInfo
    });
    setShowEditModal(true);
  };

  const handleCancelRide = async (rideId) => {
    if (!confirm('Are you sure you want to cancel this ride? A refund request will be automatically created.')) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/bookings/${rideId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cancellationReason: 'Customer requested cancellation'
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Booking cancelled successfully! A refund request has been created. You can track it in the Refunds section.');
        fetchAllRides();
        setSelectedRide(null);
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel ride error:', error);
      alert('Failed to cancel booking');
    }
  };

  if (loading) {
    return <div className="tab-loading"><div className="spinner"></div></div>;
  }

  const displayRides = activeView === 'scheduled' ? scheduledRides : previousRides;
  const allRides = [...scheduledRides, ...previousRides];

  return (
    <div className="upcoming-rides-tab">
      <div className="tab-header">
        <div>
          <h1>My Rides</h1>
          <p>
            {activeView === 'scheduled' 
              ? `${scheduledRides.length} scheduled ride${scheduledRides.length !== 1 ? 's' : ''}`
              : `${previousRides.length} previous ride${previousRides.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        {activeView === 'scheduled' && (
          <button 
            className="btn-create-ride"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            <Plus size={20} />
            Create Ride Request
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px',
        borderBottom: '2px solid #e9ecef',
        paddingBottom: '12px'
      }}>
        <button
          type="button"
          onClick={() => setActiveView('scheduled')}
          style={{
            padding: '10px 20px',
            background: activeView === 'scheduled' 
              ? 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 100%)' 
              : 'transparent',
            color: activeView === 'scheduled' ? '#1a1a1a' : '#6c757d',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Calendar size={18} />
          Scheduled ({scheduledRides.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveView('previous')}
          style={{
            padding: '10px 20px',
            background: activeView === 'previous' 
              ? 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 100%)' 
              : 'transparent',
            color: activeView === 'previous' ? '#1a1a1a' : '#6c757d',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Clock size={18} />
          Previous ({previousRides.length})
        </button>
      </div>

      {allRides.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>No Rides</h3>
          <p>You don't have any rides yet. Create your first ride request to get started.</p>
        </div>
      ) : displayRides.length === 0 ? (
        <div className="empty-state">
          {activeView === 'scheduled' ? (
            <>
              <Calendar size={64} />
              <h3>No Scheduled Rides</h3>
              <p>You don't have any scheduled rides at the moment.</p>
            </>
          ) : (
            <>
              <Clock size={64} />
              <h3>No Previous Rides</h3>
              <p>You don't have any completed or cancelled rides yet.</p>
            </>
          )}
        </div>
      ) : (
        <div className="rides-grid">
          {displayRides.map((ride) => (
            <div key={ride._id} className="upcoming-ride-card">
              <div className="ride-card-header">
                <div>
                  <h3>{ride.bookingReference}</h3>
                  <span className={`status-badge status-${ride.status}`}>
                    {ride.status}
                  </span>
                </div>
                <div className="ride-date-time">
                  <Calendar size={18} />
                  <div>
                    {activeView === 'previous' && ride.completedAt ? (
                      <>
                        <p>{new Date(ride.completedAt).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</p>
                        <p className="time">{new Date(ride.completedAt).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</p>
                      </>
                    ) : (
                      <>
                        <p>{new Date(ride.pickupDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</p>
                        <p className="time">{ride.pickupTime}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="ride-card-body">
                <div className="location-info">
                  <div className="location-item">
                    <MapPin size={18} className="icon-pickup" />
                    <div>
                      <p className="label">Pickup</p>
                      <p className="value">{ride.pickupLocation.address}</p>
                    </div>
                  </div>

                  {ride.dropoffLocation && (
                    <div className="location-item">
                      <MapPin size={18} className="icon-dropoff" />
                      <div>
                        <p className="label">Drop-off</p>
                        <p className="value">{ride.dropoffLocation.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="vehicle-info">
                  <Car size={18} />
                  <div>
                    <p className="vehicle-class">{ride.vehicleClass.name}</p>
                    <p className="vehicle-model">{ride.vehicleClass.vehicle}</p>
                  </div>
                </div>

                {ride.chauffeur ? (
                  <div className="chauffeur-info-assigned">
                    <div className="chauffeur-badge">
                      <User size={18} />
                      <span>Chauffeur Assigned</span>
                    </div>
                    <div className="chauffeur-details">
                      <div className="chauffeur-name-row">
                        {ride.chauffeur.profilePicture ? (
                          <img 
                            src={ride.chauffeur.profilePicture.startsWith('http') || ride.chauffeur.profilePicture.startsWith('data:') 
                              ? ride.chauffeur.profilePicture 
                              : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${ride.chauffeur.profilePicture.replace(/^\//, '')}`}
                            alt={`${ride.chauffeur.firstName} ${ride.chauffeur.lastName}`}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #d4af37'
                            }}
                          />
                        ) : (
                          <User size={18} />
                        )}
                        <p className="chauffeur-name">
                          {ride.chauffeur.firstName} {ride.chauffeur.lastName}
                        </p>
                        {ride.chauffeur.rating && (
                          <span className="chauffeur-rating">
                            ⭐ {ride.chauffeur.rating.toFixed(1)}
                            {ride.chauffeur.totalRatings ? ` (${ride.chauffeur.totalRatings})` : ''}
                          </span>
                        )}
                      </div>
                      <p className="chauffeur-phone">
                        <Phone size={14} />
                        {ride.chauffeur.phone}
                      </p>
                      {ride.chauffeur.vehicle && (
                        <div className="chauffeur-vehicle">
                          <Car size={14} />
                          <span>
                            {ride.chauffeur.vehicle.model || 'Vehicle'} 
                            {ride.chauffeur.vehicle.year ? ` (${ride.chauffeur.vehicle.year})` : ''}
                            {ride.chauffeur.vehicle.color ? ` • ${ride.chauffeur.vehicle.color}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : ride.status === 'pending' ? (
                  <div className="chauffeur-info-pending">
                    <Clock size={18} />
                    <span>Waiting for chauffeur assignment...</span>
                  </div>
                ) : null}

                <div className="ride-price-section">
                  <span className="price-label">Total</span>
                  <span className="price-value">${ride.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="ride-card-footer">
                <button 
                  className="btn-view-details"
                  onClick={() => setSelectedRide(ride)}
                >
                  View Details
                </button>
                <button 
                  className="btn-view-details"
                  onClick={() => navigate(`/booking-confirmation/${ride._id}`)}
                  style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', color: '#d4af37' }}
                >
                  <FileText size={16} />
                  Confirmation
                </button>
                {activeView === 'scheduled' && (ride.status === 'confirmed' || ride.status === 'pending') && (
                  <>
                    <button 
                      className="btn-edit"
                      onClick={() => openEditModal(ride)}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button 
                      className="btn-cancel"
                      onClick={() => handleCancelRide(ride._id)}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ride Details Modal */}
      {selectedRide && (
        <div className="modal-overlay" onClick={() => setSelectedRide(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ride Details</h2>
              <button className="modal-close" onClick={() => setSelectedRide(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Booking Reference</span>
                <span className="detail-value">{selectedRide.bookingReference}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`status-badge status-${selectedRide.status}`}>
                  {selectedRide.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Pickup Date & Time</span>
                <span className="detail-value">
                  {new Date(selectedRide.pickupDate).toLocaleDateString()} at {selectedRide.pickupTime}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Pickup Location</span>
                <span className="detail-value">{selectedRide.pickupLocation.address}</span>
              </div>
              {selectedRide.dropoffLocation && (
                <div className="detail-row">
                  <span className="detail-label">Drop-off Location</span>
                  <span className="detail-value">{selectedRide.dropoffLocation.address}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Vehicle</span>
                <span className="detail-value">
                  {selectedRide.vehicleClass.name} - {selectedRide.vehicleClass.vehicle}
                </span>
              </div>
              {selectedRide.chauffeur ? (
                <>
                  <div className="detail-row chauffeur-detail-section">
                    <span className="detail-label">Chauffeur Assigned</span>
                    <div className="chauffeur-detail-value">
                      <div className="chauffeur-detail-name">
                        <User size={18} />
                        {selectedRide.chauffeur.firstName} {selectedRide.chauffeur.lastName}
                        {selectedRide.chauffeur.rating && (
                          <span className="chauffeur-rating-badge">
                            ⭐ {selectedRide.chauffeur.rating.toFixed(1)}
                            {selectedRide.chauffeur.totalRatings ? ` (${selectedRide.chauffeur.totalRatings} reviews)` : ''}
                          </span>
                        )}
                      </div>
                      <div className="chauffeur-detail-contact">
                        <Phone size={16} />
                        {selectedRide.chauffeur.phone}
                      </div>
                      {selectedRide.chauffeur.vehicle && (
                        <div className="chauffeur-detail-vehicle">
                          <Car size={16} />
                          {selectedRide.chauffeur.vehicle.model || 'Vehicle'}
                          {selectedRide.chauffeur.vehicle.year ? ` (${selectedRide.chauffeur.vehicle.year})` : ''}
                          {selectedRide.chauffeur.vehicle.color ? ` • ${selectedRide.chauffeur.vehicle.color}` : ''}
                          {selectedRide.chauffeur.vehicle.registrationNumber ? ` • ${selectedRide.chauffeur.vehicle.registrationNumber}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="detail-row">
                  <span className="detail-label">Chauffeur</span>
                  <span className="detail-value">Waiting for assignment...</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Passenger</span>
                <span className="detail-value">
                  {selectedRide.passengerInfo.firstName} {selectedRide.passengerInfo.lastName}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Price</span>
                <span className="detail-value price">${selectedRide.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Ride Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Ride Request</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateRide}>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Ride Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Ride Type</label>
                      <select
                        name="rideType"
                        value={formData.rideType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="hourly">Hourly Booking</option>
                        <option value="city-to-city">City to City</option>
                        <option value="airport-transfer">Airport Transfer</option>
                      </select>
                    </div>
                    {formData.rideType === 'hourly' && (
                      <div className="form-group">
                        <label>Duration (hours)</label>
                        <input
                          type="number"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          min="1"
                          max="24"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h3>Location Details</h3>
                  <div className="form-group">
                    <label>
                      <MapPin size={16} />
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      name="pickupLocation.address"
                      value={formData.pickupLocation.address}
                      onChange={handleInputChange}
                      placeholder="Enter pickup address"
                      required
                    />
                  </div>
                  {formData.rideType !== 'hourly' && (
                    <div className="form-group">
                      <label>
                        <MapPin size={16} />
                        Drop-off Location
                      </label>
                      <input
                        type="text"
                        name="dropoffLocation.address"
                        value={formData.dropoffLocation.address}
                        onChange={handleInputChange}
                        placeholder="Enter drop-off address"
                        required={formData.rideType !== 'hourly'}
                      />
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <h3>Date & Time</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Pickup Date</label>
                      <input
                        type="date"
                        name="pickupDate"
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Pickup Time</label>
                      <input
                        type="time"
                        name="pickupTime"
                        value={formData.pickupTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Vehicle Selection</h3>
                  <div className="form-group">
                    <label>Vehicle Class</label>
                    <select
                      value={formData.vehicleClass.name}
                      onChange={(e) => {
                        const vehicles = {
                          'Business Sedan': { name: 'Business Sedan', vehicle: 'Mercedes S-Class', basePrice: PRICING.HOURLY_RATE_PER_HOUR },
                          'Luxury SUV': { name: 'Luxury SUV', vehicle: 'Cadillac Escalade', basePrice: PRICING.HOURLY_RATE_PER_HOUR },
                          'Executive Van': { name: 'Executive Van', vehicle: 'Mercedes Sprinter', basePrice: PRICING.HOURLY_RATE_PER_HOUR }
                        };
                        setFormData(prev => ({
                          ...prev,
                          vehicleClass: vehicles[e.target.value]
                        }));
                      }}
                      required
                    >
                      <option value="Business Sedan">Business Sedan - Mercedes S-Class (${PRICING.HOURLY_RATE_PER_HOUR}/hr)</option>
                      <option value="Luxury SUV">Luxury SUV - Cadillac Escalade (${PRICING.HOURLY_RATE_PER_HOUR}/hr)</option>
                      <option value="Executive Van">Executive Van - Mercedes Sprinter (${PRICING.HOURLY_RATE_PER_HOUR}/hr)</option>
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Passenger Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="passengerInfo.firstName"
                        value={formData.passengerInfo.firstName}
                        onChange={handleInputChange}
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="passengerInfo.lastName"
                        value={formData.passengerInfo.lastName}
                        onChange={handleInputChange}
                        placeholder="Last name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="passengerInfo.email"
                        value={formData.passengerInfo.email}
                        onChange={handleInputChange}
                        placeholder="Email address"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="passengerInfo.phone"
                        value={formData.passengerInfo.phone}
                        onChange={handleInputChange}
                        placeholder="Phone number"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="price-summary">
                  <h3>Estimated Price</h3>
                  <p className="price-value">
                    ${(formData.rideType === 'hourly' ? PRICING.HOURLY_RATE_PER_HOUR * formData.duration : PRICING.LOCAL_AIRPORT_TRANSFER).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  Create Ride Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ride Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Ride</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditRide}>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Location Details</h3>
                  <div className="form-group">
                    <label>
                      <MapPin size={16} />
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      name="pickupLocation.address"
                      value={formData.pickupLocation.address}
                      onChange={handleInputChange}
                      placeholder="Enter pickup address"
                      required
                    />
                  </div>
                  {formData.rideType !== 'hourly' && (
                    <div className="form-group">
                      <label>
                        <MapPin size={16} />
                        Drop-off Location
                      </label>
                      <input
                        type="text"
                        name="dropoffLocation.address"
                        value={formData.dropoffLocation.address}
                        onChange={handleInputChange}
                        placeholder="Enter drop-off address"
                      />
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <h3>Date & Time</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Pickup Date</label>
                      <input
                        type="date"
                        name="pickupDate"
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Pickup Time</label>
                      <input
                        type="time"
                        name="pickupTime"
                        value={formData.pickupTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Passenger Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="passengerInfo.firstName"
                        value={formData.passengerInfo.firstName}
                        onChange={handleInputChange}
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="passengerInfo.lastName"
                        value={formData.passengerInfo.lastName}
                        onChange={handleInputChange}
                        placeholder="Last name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="passengerInfo.email"
                        value={formData.passengerInfo.email}
                        onChange={handleInputChange}
                        placeholder="Email address"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="passengerInfo.phone"
                        value={formData.passengerInfo.phone}
                        onChange={handleInputChange}
                        placeholder="Phone number"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  Update Ride
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingRidesTab;
