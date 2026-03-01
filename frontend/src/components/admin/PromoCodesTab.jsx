import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './AdminTabs.css';

const PromoCodesTab = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxUses: '',
    expiryDate: '',
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setPromoCodes(data.data);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        fetchPromoCodes();
        setFormData({ code: '', discountType: 'percentage', discountValue: '', maxUses: '', expiryDate: '' });
      }
    } catch (error) {
      console.error('Error creating promo code:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
    }
  };

  return (
    <div className="promos-tab">
      <div className="tab-header">
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Create Promo Code
        </button>
      </div>

      <div className="admin-card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Uses</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes && promoCodes.length > 0 ? (
                promoCodes.map((promo) => (
                <tr key={promo._id}>
                  <td><strong>{promo.code}</strong></td>
                  <td>
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}%`
                      : `$${promo.discountValue}`}
                  </td>
                  <td>
                    {promo.usedCount || 0} / {promo.maxUses || '∞'}
                  </td>
                  <td>{new Date(promo.expiryDate).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        promo.isActive && new Date(promo.expiryDate) > new Date()
                          ? 'status-confirmed'
                          : 'status-cancelled'
                      }`}
                    >
                      {promo.isActive && new Date(promo.expiryDate) > new Date()
                        ? 'Active'
                        : 'Expired'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn">
                        <Edit size={18} />
                      </button>
                      <button className="action-btn danger" onClick={() => handleDelete(promo._id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    No promo codes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Promo Code</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div className="form-group">
                <label>Discount Value</label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Max Uses</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodesTab;
