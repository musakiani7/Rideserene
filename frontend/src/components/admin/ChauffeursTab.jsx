import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import './AdminTabs.css';

const ChauffeursTab = () => {
  const [chauffeurs, setChauffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '' });

  useEffect(() => {
    fetchChauffeurs();
  }, [filters]);

  const fetchChauffeurs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/chauffeurs?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setChauffeurs(data.data);
      }
    } catch (error) {
      console.error('Error fetching chauffeurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/chauffeurs/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchChauffeurs();
    } catch (error) {
      console.error('Error approving chauffeur:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/chauffeurs/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Documents not verified' }),
      });
      fetchChauffeurs();
    } catch (error) {
      console.error('Error rejecting chauffeur:', error);
    }
  };

  return (
    <div className="chauffeurs-tab">
      <div className="tab-header">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search chauffeurs..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="admin-card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Completed Rides</th>
                <th>Earnings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {chauffeurs && chauffeurs.length > 0 ? (
                chauffeurs.map((chauffeur) => (
                <tr key={chauffeur._id}>
                  <td>
                    {chauffeur.firstName} {chauffeur.lastName}
                  </td>
                  <td>{chauffeur.email}</td>
                  <td>{chauffeur.phone}</td>
                  <td>
                    <span className={`status-badge status-${chauffeur.status}`}>
                      {chauffeur.status}
                    </span>
                  </td>
                  <td>{chauffeur.completedRides || 0}</td>
                  <td>${chauffeur.totalEarnings?.toFixed(2) || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn">
                        <Eye size={18} />
                      </button>
                      {chauffeur.status === 'pending' && (
                        <>
                          <button
                            className="action-btn success"
                            onClick={() => handleApprove(chauffeur._id)}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            className="action-btn danger"
                            onClick={() => handleReject(chauffeur._id)}
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    No chauffeurs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChauffeursTab;
