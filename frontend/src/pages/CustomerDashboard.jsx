import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Calendar, MapPin, CreditCard, User, LogOut, 
  Clock, Car, FileText, Gift, Plus, Edit, Trash2, X, Menu, RefreshCw, DollarSign,
  Download, MessageCircle, HelpCircle, Bell, MessagesSquare
} from 'lucide-react';
import UpcomingRidesTab from '../components/dashboard/UpcomingRidesTab';
import RideHistoryTab from '../components/dashboard/RideHistoryTab';
import PaymentsTab from '../components/dashboard/PaymentsTab';
import RefundsTab from '../components/dashboard/RefundsTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import SavedAddressesTab from '../components/dashboard/SavedAddressesTab';
import GuestProfileTab from '../components/dashboard/GuestProfileTab';
import InvoicesTab from '../components/dashboard/InvoicesTab';
import SupportTab from '../components/dashboard/SupportTab';
import FaqTab from '../components/dashboard/FaqTab';
import NotificationsTab from '../components/dashboard/NotificationsTab';
import ChauffeurVehicleTab from '../components/dashboard/ChauffeurVehicleTab';
import ChatTab from '../components/dashboard/ChatTab';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();

    // Refresh dashboard data every 30 seconds to show real-time updates
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [navigate]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      console.log('🔄 Fetching dashboard data...');
      const response = await fetch(`${API_BASE}/api/dashboard/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      const data = await response.json();
      console.log('📊 Dashboard API Response:', data);

      if (data.success) {
        console.log('✅ Stats received:', data.data.stats);
        setDashboardData(data.data);
        setError('');
      } else {
        setError('Failed to load dashboard data: ' + (data.message || 'Unknown error'));
        console.error('❌ Dashboard error:', data);
      }
    } catch (err) {
      console.error('❌ Dashboard fetch error:', err);
      setError('Failed to load dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  const handleNewBooking = () => {
    navigate('/');
  };

  if (loading && !dashboardData) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Calendar size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Dashboard</h2>
          <p className="user-name">
            {dashboardData?.customer?.firstName} {dashboardData?.customer?.lastName}
          </p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
          >
            <Home size={20} />
            <span>Home</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'guest-profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('guest-profile'); setMobileMenuOpen(false); }}
          >
            <User size={20} />
            <span>Guest Profile</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => { setActiveTab('upcoming'); setMobileMenuOpen(false); }}
          >
            <Calendar size={20} />
            <span>Upcoming Rides</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'chauffeur-vehicle' ? 'active' : ''}`}
            onClick={() => { setActiveTab('chauffeur-vehicle'); setMobileMenuOpen(false); }}
          >
            <Car size={20} />
            <span>Chauffeur & Vehicle</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
          >
            <Clock size={20} />
            <span>Ride History</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => { setActiveTab('notifications'); setMobileMenuOpen(false); }}
          >
            <Bell size={20} />
            <span>Notifications</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
          >
            <MessagesSquare size={20} />
            <span>Chat</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => { setActiveTab('addresses'); setMobileMenuOpen(false); }}
          >
            <MapPin size={20} />
            <span>Saved Addresses</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('payments'); setMobileMenuOpen(false); }}
          >
            <CreditCard size={20} />
            <span>Payments & Wallet</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'refunds' ? 'active' : ''}`}
            onClick={() => { setActiveTab('refunds'); setMobileMenuOpen(false); }}
          >
            <DollarSign size={20} />
            <span>Refunds</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => { setActiveTab('invoices'); setMobileMenuOpen(false); }}
          >
            <Download size={20} />
            <span>Download Invoice (PDF)</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => { setActiveTab('support'); setMobileMenuOpen(false); }}
          >
            <MessageCircle size={20} />
            <span>Contact Support</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => { setActiveTab('faq'); setMobileMenuOpen(false); }}
          >
            <HelpCircle size={20} />
            <span>Booking Help / FAQ</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {activeTab === 'home' && (
          <HomeTab 
            data={dashboardData} 
            onNewBooking={handleNewBooking}
            onTabChange={setActiveTab}
          />
        )}

        {activeTab === 'guest-profile' && (
          <GuestProfileTab customer={dashboardData?.customer} stats={dashboardData?.stats} />
        )}

        {activeTab === 'upcoming' && (
          <UpcomingRidesTab />
        )}

        {activeTab === 'chauffeur-vehicle' && (
          <ChauffeurVehicleTab />
        )}

        {activeTab === 'history' && (
          <RideHistoryTab onSwitchToChat={(bookingId) => {
            setActiveTab('chat');
            // Store booking ID for ChatTab to pick up
            localStorage.setItem('chatBookingId', bookingId);
          }} />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab />
        )}

        {activeTab === 'chat' && (
          <ChatTab />
        )}

        {activeTab === 'addresses' && (
          <SavedAddressesTab />
        )}

        {activeTab === 'payments' && (
          <PaymentsTab customer={dashboardData?.customer} />
        )}

        {activeTab === 'refunds' && (
          <RefundsTab />
        )}

        {activeTab === 'invoices' && (
          <InvoicesTab />
        )}

        {activeTab === 'support' && (
          <SupportTab />
        )}

        {activeTab === 'faq' && (
          <FaqTab />
        )}

        {activeTab === 'profile' && (
          <ProfileTab customer={dashboardData?.customer} onUpdate={fetchDashboardData} />
        )}
      </main>
    </div>
  );
};

// Home Tab Component
const HomeTab = ({ data, onNewBooking, onTabChange }) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [searchingVehicles, setSearchingVehicles] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  const vehicleTypes = [
    { id: 'sedan', name: 'Luxury Sedan', icon: '🚗' },
    { id: 'suv', name: 'Luxury SUV', icon: '🚙' },
    { id: 'van', name: 'Executive Van', icon: '🚐' },
    { id: 'premium', name: 'Premium Sedan', icon: '🚘' }
  ];

  // Fetch saved addresses for quick-fill
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_BASE}/api/dashboard/favorite-locations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => d.success && setSavedAddresses(d.data || []))
      .catch(() => {});
  }, []);

  const fillFromSaved = (addr, field) => {
    const value = addr.address || [addr.city, addr.country].filter(Boolean).join(', ');
    if (field === 'pickup') setPickupLocation(value);
    else setDropoffLocation(value);
  };

  // Log stats for debugging
  useEffect(() => {
    if (data) {
      console.log('📊 Dashboard Data Updated:', {
        stats: data.stats,
        customer: data.customer?.email,
        upcomingRidesCount: data.upcomingRides?.length,
        recentRidesCount: data.recentRides?.length
      });
    }
  }, [data]);

  const searchVehicles = async () => {
    if (!pickupLocation || !dropoffLocation || !selectedVehicleType) {
      alert('Please fill in all fields: pickup location, drop-off location, and vehicle type');
      return;
    }

    setSearchingVehicles(true);
    setShowResults(false);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Fetch available chauffeurs using customer-accessible endpoint
      const response = await fetch(`${API_BASE}/api/bookings/search-chauffeurs?vehicleType=${selectedVehicleType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setAvailableVehicles(result.data);
        setShowResults(true);
        
        if (result.data.length === 0) {
          alert('No vehicles found for the selected type. Try selecting a different vehicle type.');
        }
      } else {
        alert(result.message || 'Failed to search vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      alert('Failed to search vehicles. Please try again.');
    } finally {
      setSearchingVehicles(false);
    }
  };

  const handleBookVehicle = (chauffeur) => {
    // Store booking details and navigate to booking page
    sessionStorage.setItem('quickBookData', JSON.stringify({
      pickupLocation,
      dropoffLocation,
      vehicleType: selectedVehicleType,
      chauffeur: chauffeur
    }));
    onNewBooking();
  };

  return (
    <div className="home-tab">
      <div className="dashboard-header">
        <h1>Welcome back, {data?.customer?.firstName}!</h1>
        <div style={{display: 'flex', gap: '12px'}}>
          <button 
            className="btn-secondary" 
            onClick={() => window.location.reload()}
            title="Refresh dashboard data"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
          <button className="btn-primary" onClick={onNewBooking}>
            <Plus size={20} />
            Book a Ride
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onTabChange('history')} title="Click to view all rides">
          <div className="stat-content">
            <p>Total Rides</p>
            <h3>{data?.stats?.totalRides ?? 0}</h3>
          </div>
          <div className="stat-icon">
            <Car />
          </div>
        </div>

        <div className="stat-card stat-card-active" onClick={() => onTabChange('upcoming')} title="Click to view upcoming rides">
          <div className="stat-content">
            <p>Upcoming Rides</p>
            <h3>{data?.stats?.upcomingRides ?? 0}</h3>
          </div>
          <div className="stat-icon">
            <Calendar />
          </div>
        </div>

        <div className="stat-card stat-card-new" onClick={() => onTabChange('payments')} title="Click to view wallet details">
          <div className="stat-content">
            <p>Wallet Balance</p>
            <h3>
              $
              {typeof data?.stats?.walletBalance === 'number'
                ? Math.round(data.stats.walletBalance)
                : '0'}
            </h3>
          </div>
          <div className="stat-icon">
            <CreditCard />
          </div>
        </div>
      </div>

      {/* Quick Book Section */}
      <div className="quick-book-section">
        <h2>Quick Book</h2>
        <div className="quick-book-card">
          <div className="book-form-preview">
            <div className="location-input-field">
              <label>Pickup Location</label>
              <input 
                type="text" 
                placeholder="Enter pickup location" 
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
              />
              {savedAddresses.length > 0 && (
                <div className="saved-address-chips">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr._id}
                      type="button"
                      className="address-chip"
                      onClick={() => fillFromSaved(addr, 'pickup')}
                    >
                      {addr.type === 'work' ? 'Office' : addr.type === 'home' ? 'Home' : addr.type === 'airport' ? 'Airport' : addr.label || 'Other'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="location-input-field">
              <label>Drop-off Location</label>
              <input 
                type="text" 
                placeholder="Enter drop-off location"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
              />
              {savedAddresses.length > 0 && (
                <div className="saved-address-chips">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr._id}
                      type="button"
                      className="address-chip"
                      onClick={() => fillFromSaved(addr, 'dropoff')}
                    >
                      {addr.type === 'work' ? 'Office' : addr.type === 'home' ? 'Home' : addr.type === 'airport' ? 'Airport' : addr.label || 'Other'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Vehicle Type Selector */}
            <div className="vehicle-type-selector">
              <label>Select Vehicle Type</label>
              <div className="vehicle-type-checkboxes">
                {vehicleTypes.map((type) => (
                  <label key={type.id} className="vehicle-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedVehicleType === type.id}
                      onChange={() => setSelectedVehicleType(type.id)}
                    />
                    <span className="vehicle-type-name">{type.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              className="btn-book" 
              onClick={searchVehicles}
              disabled={searchingVehicles}
            >
              {searchingVehicles ? (
                <>
                  <div className="spinner-small"></div>
                  Searching...
                </>
              ) : (
                'Search Vehicles'
              )}
            </button>
          </div>

          {/* Search Results */}
          {showResults && (
            <div className="search-results">
              <h3>Available Vehicles ({availableVehicles.length})</h3>
              
              {availableVehicles.length === 0 ? (
                <div className="no-results">
                  <Car size={48} />
                  <p>No vehicles available for the selected type</p>
                  <small>Try selecting a different vehicle type</small>
                </div>
              ) : (
                <div className="available-vehicles-grid">
                  {availableVehicles.map((chauffeur) => (
                    <div key={chauffeur._id} className="available-vehicle-card">
                      <div className="vehicle-card-header">
                        <div className="vehicle-info">
                          <h4>{chauffeur.vehicleInfo?.make} {chauffeur.vehicleInfo?.model}</h4>
                          <p className="vehicle-year">{chauffeur.vehicleInfo?.year} • {chauffeur.vehicleInfo?.color}</p>
                        </div>
                        <div className="vehicle-type-badge">
                          {vehicleTypes.find(v => v.id === selectedVehicleType)?.icon}
                        </div>
                      </div>

                      <div className="chauffeur-info">
                        <User size={16} />
                        <div>
                          <p className="chauffeur-name">
                            {chauffeur.firstName} {chauffeur.lastName}
                          </p>
                          <p className="chauffeur-experience">
                            {chauffeur.yearsOfExperience || 0} years experience
                          </p>
                        </div>
                      </div>

                      <div className="vehicle-details">
                        <div className="detail-item">
                          <span>License Plate:</span>
                          <strong>{chauffeur.vehicleInfo?.licensePlate}</strong>
                        </div>
                        <div className="detail-item">
                          <span>Phone:</span>
                          <strong>{chauffeur.phone}</strong>
                        </div>
                      </div>

                      <button 
                        className="btn-book-this-vehicle"
                        onClick={() => handleBookVehicle(chauffeur)}
                      >
                        Book This Vehicle
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Rides Preview */}
      {data?.upcomingRides && data.upcomingRides.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>Upcoming Rides</h2>
            <button className="btn-text" onClick={() => onTabChange('upcoming')}>
              View All
            </button>
          </div>
          <div className="rides-list">
            {data.upcomingRides.slice(0, 3).map((ride) => (
              <RideCard key={ride._id} ride={ride} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Rides */}
      {data?.recentRides && data.recentRides.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>Recent Rides</h2>
            <button className="btn-text" onClick={() => onTabChange('history')}>
              View All
            </button>
          </div>
          <div className="rides-list">
            {data.recentRides.slice(0, 3).map((ride) => (
              <RideCard key={ride._id} ride={ride} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Ride Card Component
const RideCard = ({ ride, compact = false }) => {
  const navigate = useNavigate();
  const getStatusColor = (status) => {
    const colors = {
      confirmed: '#28a745',
      assigned: '#007bff',
      'in-progress': '#ffc107',
      completed: '#6c757d',
      cancelled: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="ride-card">
      <div className="ride-header">
        <div className="ride-ref">
          <strong>{ride.bookingReference}</strong>
          <span 
            className="ride-status"
            style={{ backgroundColor: getStatusColor(ride.status) }}
          >
            {ride.status}
          </span>
        </div>
        <div className="ride-date">
          {new Date(ride.pickupDate).toLocaleDateString()} at {ride.pickupTime}
        </div>
      </div>

      <div className="ride-details">
        <div className="ride-location">
          <MapPin size={16} />
          <div>
            <p className="location-label">From</p>
            <p className="location-value">{ride.pickupLocation.address}</p>
          </div>
        </div>

        {ride.dropoffLocation && (
          <div className="ride-location">
            <MapPin size={16} />
            <div>
              <p className="location-label">To</p>
              <p className="location-value">{ride.dropoffLocation.address}</p>
            </div>
          </div>
        )}

        <div className="ride-vehicle">
          <Car size={16} />
          <span>{ride.vehicleClass.name} - {ride.vehicleClass.vehicle}</span>
        </div>
      </div>

      {!compact && (
        <div className="ride-footer">
          <div className="ride-price">
            <strong>${ride.totalPrice.toFixed(2)}</strong>
          </div>
          <div className="ride-actions">
            <button 
              className="btn-secondary-small" 
              onClick={() => navigate(`/booking-confirmation/${ride._id}`)}
            >
              View Confirmation
            </button>
            {ride.status === 'confirmed' && (
              <button className="btn-outline-small">Edit</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
