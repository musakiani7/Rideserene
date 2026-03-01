import { useState, useEffect } from 'react';
import { Search, MessageSquare, Eye } from 'lucide-react';
import './AdminTabs.css';

const SupportTab = () => {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/support/tickets?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/support/tickets/${ticketId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  return (
    <div className="support-tab">
      <div className="tab-header">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="filter-select"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="admin-card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td><strong>{ticket.ticketNumber}</strong></td>
                  <td>
                    {ticket.customer?.firstName} {ticket.customer?.lastName}
                  </td>
                  <td>{ticket.subject}</td>
                  <td>
                    <span className="category-badge">{ticket.category.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <span className={`priority-badge priority-${ticket.priority}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                      className={`status-select status-${ticket.status}`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn">
                        <Eye size={18} />
                      </button>
                      <button className="action-btn">
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    No support tickets found
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

export default SupportTab;
