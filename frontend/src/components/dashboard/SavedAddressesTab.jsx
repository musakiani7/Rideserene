import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Home, Building2, Plane, X } from 'lucide-react';
import './DashboardTabs.css';

const TYPE_LABELS = { home: 'Home', work: 'Office', airport: 'Airport', other: 'Other' };
const TYPE_ICONS = { home: Home, work: Building2, airport: Plane, other: MapPin };

const SavedAddressesTab = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    address: '',
    type: 'home',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAddresses = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/favorite-locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setAddresses(data.data);
      else setError(data.message || 'Failed to load addresses');
    } catch (err) {
      setError('Failed to load saved addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ label: '', address: '', type: 'home' });
    setShowForm(true);
    setError('');
  };

  const openEdit = (loc) => {
    setEditingId(loc._id);
    setFormData({
      label: loc.label || TYPE_LABELS[loc.type] || '',
      address: loc.address || [loc.city, loc.country].filter(Boolean).join(', ') || '',
      type: loc.type || 'other',
    });
    setShowForm(true);
    setError('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ label: '', address: '', type: 'home' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address.trim()) {
      setError('Please enter an address');
      return;
    }
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const body = {
        label: formData.label || TYPE_LABELS[formData.type],
        address: formData.address.trim(),
        type: formData.type,
      };
      if (editingId) {
        const response = await fetch(`${API_BASE}/api/dashboard/favorite-locations/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        if (data.success) {
          closeForm();
          fetchAddresses();
        } else setError(data.message || 'Update failed');
      } else {
        const response = await fetch(`${API_BASE}/api/dashboard/favorite-locations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        if (data.success) {
          closeForm();
          fetchAddresses();
        } else setError(data.message || 'Add failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this saved address?')) return;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/favorite-locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) fetchAddresses();
    } catch (err) {
      setError('Failed to delete address');
    }
  };

  if (loading) {
    return (
      <div className="saved-addresses-tab tab-loading">
        <div className="spinner" />
        <p>Loading saved addresses...</p>
      </div>
    );
  }

  return (
    <div className="saved-addresses-tab">
      <div className="tab-header">
        <div>
          <h1>Saved Addresses</h1>
          <p>Manage your Home, Office, Airport and other frequent locations.</p>
        </div>
        <button type="button" className="btn-create-ride" onClick={openAdd}>
          <Plus size={20} />
          Add Address
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: 16, padding: 12, background: '#fee', borderRadius: 8, color: '#c00' }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Address' : 'Add Saved Address'}</h2>
              <button type="button" className="modal-close" onClick={closeForm} aria-label="Close">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #dee2e6' }}
                >
                  <option value="home">Home</option>
                  <option value="work">Office</option>
                  <option value="airport">Airport</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Label (optional)</label>
                <input
                  type="text"
                  placeholder={TYPE_LABELS[formData.type]}
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #dee2e6' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Address *</label>
                <input
                  type="text"
                  placeholder="Full address (e.g. 123 Main St, City, State)"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #dee2e6' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-cancel" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="empty-state">
          <MapPin size={64} />
          <h3>No saved addresses yet</h3>
          <p>Add Home, Office, Airport or other locations for quicker booking.</p>
          <button type="button" className="btn-create-ride" onClick={openAdd} style={{ marginTop: 16 }}>
            <Plus size={20} />
            Add your first address
          </button>
        </div>
      ) : (
        <div className="saved-addresses-grid">
          {addresses.map((loc) => {
            const Icon = TYPE_ICONS[loc.type] || MapPin;
            const displayLabel = loc.label || TYPE_LABELS[loc.type] || 'Other';
            const displayAddress = loc.address || [loc.city, loc.country].filter(Boolean).join(', ') || '—';
            return (
              <div key={loc._id} className="saved-address-card">
                <div className="saved-address-header">
                  <span className={`saved-address-type-badge type-${loc.type}`}>
                    <Icon size={16} />
                    {displayLabel}
                  </span>
                  <div className="saved-address-actions">
                    <button type="button" className="btn-icon" onClick={() => openEdit(loc)} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button type="button" className="btn-icon btn-icon-danger" onClick={() => handleDelete(loc._id)} title="Remove">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="saved-address-value">{displayAddress}</p>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .saved-addresses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .saved-address-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e9ecef; transition: all 0.2s; }
        .saved-address-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: rgba(212,175,55,0.3); }
        .saved-address-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .saved-address-type-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; }
        .saved-address-type-badge.type-home { background: rgba(212,175,55,0.15); color: #b8860b; }
        .saved-address-type-badge.type-work { background: rgba(44,62,80,0.1); color: #2c3e50; }
        .saved-address-type-badge.type-airport { background: rgba(52,152,219,0.15); color: #2980b9; }
        .saved-address-type-badge.type-other { background: #f1f3f5; color: #495057; }
        .saved-address-value { margin: 0; font-size: 15px; color: #1a1a1a; line-height: 1.5; }
        .saved-address-actions { display: flex; gap: 8px; }
        .btn-icon { background: none; border: none; padding: 8px; cursor: pointer; color: #6c757d; border-radius: 8px; transition: all 0.2s; }
        .btn-icon:hover { background: rgba(212,175,55,0.1); color: #d4af37; }
        .btn-icon-danger:hover { background: rgba(220,53,69,0.1); color: #dc3545; }
      `}</style>
    </div>
  );
};

export default SavedAddressesTab;
