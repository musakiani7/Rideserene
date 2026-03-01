import { User, Mail, Phone, Car, Calendar, Wallet } from 'lucide-react';
import './DashboardTabs.css';
import './GuestProfileTab.css';

const GuestProfileTab = ({ customer, stats }) => {
  if (!customer) {
    return (
      <div className="tab-loading guest-profile-tab">
        <div className="spinner" />
      </div>
    );
  }

  const initials = [customer.firstName?.charAt(0), customer.lastName?.charAt(0)]
    .filter(Boolean)
    .join('')
    .toUpperCase() || 'G';
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Guest';
  const memberSince = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="guest-profile-tab">
      {/* Hero */}
      <div className="guest-profile-hero">
        <div className="guest-profile-hero-inner">
          <div className="guest-profile-avatar">
            {customer.profileImage ? (
              <img src={customer.profileImage} alt="" />
            ) : (
              initials
            )}
          </div>
          <div className="guest-profile-hero-text">
            <h1>{fullName}</h1>
            <p>Your profile and ride snapshot at a glance</p>
          </div>
        </div>
      </div>

      {/* Personal details */}
      <section className="guest-profile-section">
        <div className="guest-profile-section-title">
          <div className="icon-wrap">
            <User size={22} strokeWidth={2} />
          </div>
          <h2>Personal details</h2>
        </div>
        <div className="guest-profile-card">
          <div className="guest-profile-details-grid">
            <div className="guest-profile-detail-item">
              <div className="icon-wrap">
                <User size={22} strokeWidth={2} />
              </div>
              <div>
                <p className="label">Name</p>
                <p className="value">{fullName}</p>
              </div>
            </div>
            <div className="guest-profile-detail-item">
              <div className="icon-wrap">
                <Mail size={22} strokeWidth={2} />
              </div>
              <div>
                <p className="label">Email</p>
                <p className="value">{customer.email}</p>
              </div>
            </div>
            <div className="guest-profile-detail-item">
              <div className="icon-wrap">
                <Phone size={22} strokeWidth={2} />
              </div>
              <div>
                <p className="label">Phone</p>
                <p className="value">{customer.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ride snapshot */}
      <section className="guest-profile-section">
        <div className="guest-profile-section-title">
          <div className="icon-wrap">
            <Car size={22} strokeWidth={2} />
          </div>
          <h2>Ride snapshot</h2>
        </div>
        <div className="guest-profile-stats">
          <div className="guest-profile-stat-card stat-rides">
            <div className="stat-icon">
              <Car size={24} strokeWidth={2} />
            </div>
            <p className="stat-value">{stats?.totalRides ?? 0}</p>
            <p className="stat-label">Total rides</p>
          </div>
          <div className="guest-profile-stat-card stat-upcoming">
            <div className="stat-icon">
              <Calendar size={24} strokeWidth={2} />
            </div>
            <p className="stat-value">{stats?.upcomingRides ?? 0}</p>
            <p className="stat-label">Upcoming rides</p>
          </div>
          <div className="guest-profile-stat-card stat-wallet">
            <div className="stat-icon">
              <Wallet size={24} strokeWidth={2} />
            </div>
            <p className="stat-value">
              ${typeof stats?.walletBalance === 'number' ? Math.round(stats.walletBalance) : '0'}
            </p>
            <p className="stat-label">Wallet balance</p>
          </div>
        </div>
      </section>

      {/* Meta */}
      {memberSince && (
        <div className="guest-profile-meta">
          <span>
            <Calendar size={16} />
            Member since {memberSince}
          </span>
        </div>
      )}
    </div>
  );
};

export default GuestProfileTab;
