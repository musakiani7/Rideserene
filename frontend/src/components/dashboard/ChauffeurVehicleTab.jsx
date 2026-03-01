import { useState, useEffect } from 'react';
import { User, Phone, Car, Calendar, Star, Mail, Award } from 'lucide-react';
import './DashboardTabs.css';

const ChauffeurVehicleTab = () => {
  const [currentRides, setCurrentRides] = useState([]);
  const [previousRides, setPreviousRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'previous'

  useEffect(() => {
    fetchAllRides();
  }, []);

  const fetchAllRides = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    setLoading(true);
    try {
      // Fetch both upcoming rides and ride history
      const [upcomingRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard/upcoming-rides`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/dashboard/ride-history?page=1&limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
      const [upcomingData, historyData] = await Promise.all([
        upcomingRes.json(),
        historyRes.json(),
      ]);

      // Current rides: upcoming, confirmed, assigned, in-progress with chauffeur
      const current = (upcomingData.success ? upcomingData.data || [] : [])
        .filter((r) => r.chauffeur && ['pending', 'confirmed', 'assigned', 'in-progress'].includes(r.status));

      // Previous rides: completed or cancelled rides with chauffeur
      const previous = (historyData.success ? historyData.data || [] : [])
        .filter((r) => r.chauffeur && ['completed', 'cancelled'].includes(r.status));

      setCurrentRides(current);
      setPreviousRides(previous);
    } catch (err) {
      console.error('Fetch rides error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChauffeurDetails = async (rideId) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/ride/${rideId}/chauffeur-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDetailData(data.data);
      else setDetailData(null);
    } catch (err) {
      console.error('Fetch chauffeur details error:', err);
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (ride) => {
    setSelectedRide(ride);
    if (ride.chauffeur) {
      fetchChauffeurDetails(ride._id);
    } else {
      setDetailData(null);
    }
  };

  const vehicleFromChauffeur = (ch) => {
    if (!ch || !ch.vehicle) return null;
    const v = ch.vehicle;
    return {
      model: v.model || '—',
      year: v.year || '—',
      color: v.color || '—',
      registrationNumber: v.registrationNumber || '—',
    };
  };

  if (loading) {
    return (
      <div className="tab-loading">
        <div className="spinner" />
        <p>Loading chauffeur & vehicle info...</p>
      </div>
    );
  }

  const displayRides = activeTab === 'current' ? currentRides : previousRides;
  const allRides = [...currentRides, ...previousRides];

  return (
    <div className="chauffeur-vehicle-tab">
      <div className="tab-header">
        <div>
          <h1>Chauffeur & Vehicle Details</h1>
          <p>View details of current and previous chauffeurs and their vehicles.</p>
        </div>
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
          onClick={() => setActiveTab('current')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'current' 
              ? 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 100%)' 
              : 'transparent',
            color: activeTab === 'current' ? '#1a1a1a' : '#6c757d',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          Current Chauffeurs ({currentRides.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('previous')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'previous' 
              ? 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 100%)' 
              : 'transparent',
            color: activeTab === 'previous' ? '#1a1a1a' : '#6c757d',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          Previous Chauffeurs ({previousRides.length})
        </button>
      </div>

      {allRides.length === 0 ? (
        <div className="empty-state">
          <User size={64} />
          <h3>No chauffeur details available</h3>
          <p>When you have rides with assigned chauffeurs, their details will appear here.</p>
        </div>
      ) : displayRides.length === 0 ? (
        <div className="empty-state">
          <User size={64} />
          <h3>No {activeTab === 'current' ? 'current' : 'previous'} chauffeurs</h3>
          <p>
            {activeTab === 'current' 
              ? 'You don\'t have any upcoming rides with assigned chauffeurs at the moment.'
              : 'You don\'t have any completed rides with chauffeurs yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="chauffeur-vehicle-grid">
            {displayRides.map((ride) => {
              const v = vehicleFromChauffeur(ride.chauffeur);
              return (
                <div key={ride._id} className="chauffeur-vehicle-card" style={{
                  borderLeft: activeTab === 'current' ? '4px solid #22c55e' : '4px solid #6c757d',
                  position: 'relative'
                }}>
                  {activeTab === 'current' && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '4px 8px',
                      background: 'linear-gradient(135deg, #22c55e 0%, #86efac 100%)',
                      color: '#1a1a1a',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}>
                      Current
                    </div>
                  )}
                  {activeTab === 'previous' && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '4px 8px',
                      background: 'linear-gradient(135deg, #6c757d 0%, #adb5bd 100%)',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}>
                      Previous
                    </div>
                  )}
                  <div className="cv-card-header">
                    <strong>{ride.bookingReference}</strong>
                    <span className={`status-badge status-${ride.status}`}>{ride.status}</span>
                  </div>
                  <div className="cv-card-date">
                    <Calendar size={16} />
                    {new Date(ride.pickupDate).toLocaleDateString()} at {ride.pickupTime}
                  </div>
                  <div className="cv-card-section">
                    <h4><User size={18} /> Chauffeur</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      {ride.chauffeur.profilePicture && (
                        <img 
                          src={ride.chauffeur.profilePicture.startsWith('http') || ride.chauffeur.profilePicture.startsWith('data:') 
                            ? ride.chauffeur.profilePicture 
                            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${ride.chauffeur.profilePicture.replace(/^\//, '')}`}
                          alt={`${ride.chauffeur.firstName} ${ride.chauffeur.lastName}`}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #d4af37'
                          }}
                        />
                      )}
                      <p className="cv-name" style={{ margin: 0 }}>
                        {ride.chauffeur.firstName} {ride.chauffeur.lastName}
                      </p>
                    </div>
                    <p className="cv-phone">
                      <Phone size={14} />
                      {ride.chauffeur.phone}
                    </p>
                    {ride.chauffeur.email && (
                      <p className="cv-email" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#495057', margin: '0 0 4px 0' }}>
                        <Mail size={14} />
                        {ride.chauffeur.email}
                      </p>
                    )}
                    {ride.chauffeur.rating != null && (
                      <p className="cv-rating">
                        <Star size={14} fill="currentColor" />
                        {Number(ride.chauffeur.rating).toFixed(1)}
                        {ride.chauffeur.totalRatings && (
                          <span style={{ marginLeft: '4px', fontSize: '12px', color: '#6c757d' }}>
                            ({ride.chauffeur.totalRatings} {ride.chauffeur.totalRatings === 1 ? 'review' : 'reviews'})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  {v && (
                    <div className="cv-card-section">
                      <h4><Car size={18} /> Vehicle</h4>
                      <div className="cv-vehicle-details">
                        <span><strong>Model:</strong> {v.model}</span>
                        <span><strong>Year:</strong> {v.year}</span>
                        <span><strong>Color:</strong> {v.color}</span>
                        <span><strong>License plate:</strong> {v.registrationNumber}</span>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn-view-details"
                    onClick={() => openDetail(ride)}
                  >
                    View full details
                  </button>
                </div>
              );
            })}
          </div>

        </>
      )}

      {/* Full details modal */}
      {selectedRide && (
        <div className="modal-overlay" onClick={() => { setSelectedRide(null); setDetailData(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chauffeur & Vehicle – {selectedRide.bookingReference}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => { setSelectedRide(null); setDetailData(null); }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {detailLoading ? (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px' }} />
                  <p>Loading details...</p>
                </div>
              ) : detailData ? (
                <>
                  <div className="detail-section">
                    <h3><User size={20} /> Chauffeur Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Full Name</span>
                        <span className="detail-value">{detailData.chauffeur.fullName || `${selectedRide.chauffeur.firstName} ${selectedRide.chauffeur.lastName}`}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">
                          <Phone size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          {detailData.chauffeur.phone || selectedRide.chauffeur.phone}
                        </span>
                      </div>
                      {detailData.chauffeur.email && (
                        <div className="detail-item">
                          <span className="detail-label">Email</span>
                          <span className="detail-value">
                            <Mail size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                            {detailData.chauffeur.email}
                          </span>
                        </div>
                      )}
                      {detailData.chauffeur.rating != null && (
                        <div className="detail-item">
                          <span className="detail-label">Rating</span>
                          <span className="detail-value">
                            <Star size={16} fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '4px', color: '#d4af37' }} />
                            {Number(detailData.chauffeur.rating).toFixed(1)}
                            {detailData.chauffeur.totalRatings && (
                              <span style={{ marginLeft: '6px', fontSize: '13px', color: '#6c757d' }}>
                                ({detailData.chauffeur.totalRatings} {detailData.chauffeur.totalRatings === 1 ? 'review' : 'reviews'})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="detail-section">
                    <h3><Car size={20} /> Vehicle Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Model</span>
                        <span className="detail-value">{detailData.vehicle.model || '—'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Year</span>
                        <span className="detail-value">{detailData.vehicle.year || '—'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Color</span>
                        <span className="detail-value">
                          {detailData.vehicle.color ? (
                            <>
                              <span style={{
                                display: 'inline-block',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: detailData.vehicle.color.toLowerCase(),
                                border: '1px solid #ddd',
                                verticalAlign: 'middle',
                                marginRight: '6px'
                              }} />
                              {detailData.vehicle.color}
                            </>
                          ) : '—'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">License Plate</span>
                        <span className="detail-value">{detailData.vehicle.registrationNumber || '—'}</span>
                      </div>
                      {detailData.vehicle.vehicleClass && (
                        <div className="detail-item">
                          <span className="detail-label">Vehicle Class</span>
                          <span className="detail-value">{detailData.vehicle.vehicleClass}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="detail-section">
                    <h3><Calendar size={20} /> Ride Details</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Booking Reference</span>
                        <span className="detail-value">{selectedRide.bookingReference}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Pickup Date & Time</span>
                        <span className="detail-value">
                          {new Date(detailData.pickupDate || selectedRide.pickupDate).toLocaleDateString()} at {detailData.pickupTime || selectedRide.pickupTime}
                        </span>
                      </div>
                      {selectedRide.pickupLocation && (
                        <div className="detail-item">
                          <span className="detail-label">Pickup Location</span>
                          <span className="detail-value">{selectedRide.pickupLocation.address || selectedRide.pickupLocation}</span>
                        </div>
                      )}
                      {selectedRide.dropoffLocation && (
                        <div className="detail-item">
                          <span className="detail-label">Drop-off Location</span>
                          <span className="detail-value">{selectedRide.dropoffLocation.address || selectedRide.dropoffLocation}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-label">Status</span>
                        <span className={`status-badge status-${detailData.status || selectedRide.status}`}>
                          {detailData.status || selectedRide.status}
                        </span>
                      </div>
                      {selectedRide.completedAt && (
                        <div className="detail-item">
                          <span className="detail-label">Completed At</span>
                          <span className="detail-value">
                            {new Date(selectedRide.completedAt).toLocaleDateString()} at {new Date(selectedRide.completedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : !selectedRide.chauffeur ? (
                <p>No chauffeur assigned to this ride yet.</p>
              ) : (
                <p>Could not load details. Please try again.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .chauffeur-vehicle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .chauffeur-vehicle-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e9ecef; }
        .cv-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .cv-card-date { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #6c757d; margin-bottom: 16px; }
        .cv-card-section { margin-bottom: 16px; }
        .cv-card-section h4 { display: flex; align-items: center; gap: 8px; font-size: 14px; margin: 0 0 8px 0; color: #1a1a1a; }
        .cv-name { font-weight: 700; font-size: 16px; margin: 0 0 4px 0; }
        .cv-phone, .cv-rating { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #495057; margin: 0 0 4px 0; }
        .cv-vehicle-details { display: flex; flex-direction: column; gap: 4px; font-size: 14px; color: #495057; }
        .cv-pending-section { margin-top: 32px; }
        .cv-pending-section h3 { font-size: 18px; margin-bottom: 16px; color: #1a1a1a; }
      `}</style>
    </div>
  );
};

export default ChauffeurVehicleTab;
