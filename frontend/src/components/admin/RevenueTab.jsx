import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import './AdminTabs.css';

const RevenueTab = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  return (
    <div className="revenue-tab">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
            <DollarSign size={28} style={{ color: '#d4af37' }} />
          </div>
          <div className="kpi-content">
            <h3>Today's Revenue</h3>
            <p className="kpi-value">${stats?.today?.revenue?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
            <TrendingUp size={28} style={{ color: '#d4af37' }} />
          </div>
          <div className="kpi-content">
            <h3>Monthly Revenue</h3>
            <div className="kpi-value-row">
              <p className="kpi-value">${stats?.thisMonth?.revenue?.toLocaleString() || 0}</p>
              {stats?.thisMonth?.growth && (
                <span className={`kpi-growth ${stats.thisMonth.growth > 0 ? 'positive' : 'negative'}`}>
                  {stats.thisMonth.growth}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'rgba(192, 192, 192, 0.1)' }}>
            <CreditCard size={28} style={{ color: '#c0c0c0' }} />
          </div>
          <div className="kpi-content">
            <h3>Total Transactions</h3>
            <p className="kpi-value">{stats?.totals?.bookings || 0}</p>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2>Revenue Chart (Last 7 Days)</h2>
        <div className="chart-container">
          {stats?.revenueChart && stats.revenueChart.length > 0 ? (
            stats.revenueChart.map((item) => (
              <div key={item._id} className="chart-bar">
                <div className="bar-label">{new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div className="bar-wrapper">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${(item.revenue / Math.max(...(stats.revenueChart.map(i => i.revenue) || [1]))) * 100}%`,
                    }}
                  />
                </div>
                <div className="bar-value">${item.revenue}</div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999', width: '100%' }}>
              No revenue data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueTab;
