import { useState, useEffect } from 'react';
import { TrendingUp, Users, Car, DollarSign, Calendar } from 'lucide-react';
import './AdminTabs.css';

const OverviewTab = () => {
  const [stats, setStats] = useState({
    totals: { bookings: 0, customers: 0, chauffeurs: 0, activeBookings: 0 },
    today: { bookings: 0, revenue: 0 },
    thisMonth: { bookings: 0, revenue: 0, growth: 0 },
    recentBookings: [],
    bookingsByStatus: [],
    revenueChart: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const kpiCards = [
    {
      title: 'Total Bookings',
      value: stats.totals?.bookings || 0,
      icon: Car,
      color: '#d4af37',
      bgColor: 'rgba(212, 175, 55, 0.1)',
    },
    {
      title: 'Total Customers',
      value: stats.totals?.customers || 0,
      icon: Users,
      color: '#c0c0c0',
      bgColor: 'rgba(192, 192, 192, 0.1)',
    },
    {
      title: 'Active Bookings',
      value: stats.totals?.activeBookings || 0,
      icon: Calendar,
      color: '#4caf50',
      bgColor: 'rgba(76, 175, 80, 0.1)',
    },
    {
      title: 'Monthly Revenue',
      value: '$' + (stats.thisMonth?.revenue || 0).toLocaleString(),
      icon: DollarSign,
      color: '#d4af37',
      bgColor: 'rgba(212, 175, 55, 0.1)',
      growth: stats.thisMonth?.growth,
    },
  ];

  return (
    <div className="overview-tab">
      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="kpi-card">
              <div className="kpi-icon" style={{ backgroundColor: card.bgColor }}>
                <Icon size={28} style={{ color: card.color }} />
              </div>
              <div className="kpi-content">
                <h3>{card.title}</h3>
                <div className="kpi-value-row">
                  <p className="kpi-value">{card.value}</p>
                  {card.growth && card.growth !== 0 && (
                    <span className={`kpi-growth ${card.growth > 0 ? 'positive' : 'negative'}`}>
                      <TrendingUp size={16} />
                      {card.growth}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="admin-card">
        <h2>Recent Bookings</h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Pickup</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.bookingId}</td>
                    <td>
                      {booking.customer?.firstName} {booking.customer?.lastName}
                    </td>
                    <td>{booking.pickupLocation}</td>
                    <td>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>${booking.totalPrice}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Status Distribution */}
      <div className="admin-card">
        <h2>Booking Status Distribution</h2>
        <div className="status-grid">
          {stats.bookingsByStatus && stats.bookingsByStatus.length > 0 ? (
            stats.bookingsByStatus.map((item) => (
              <div key={item._id} className="status-item">
                <span className={`status-badge status-${item._id}`}>{item._id}</span>
                <span className="status-count">{item.count}</span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
              No booking data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
