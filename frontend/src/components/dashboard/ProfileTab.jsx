import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Plus, Trash2, Save, Camera, Lock, Star } from 'lucide-react';
import './DashboardTabs.css';
import './ProfileTab.css';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const ProfileTab = ({ customer, onUpdate }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({
    country: '',
    city: '',
  });
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
      });
    }
    fetchFavoriteLocations();
  }, [customer]);

  const fetchFavoriteLocations = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/favorite-locations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setFavoriteLocations(data.data);
      }
    } catch (error) {
      console.error('Fetch favorite locations error:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert('Please choose a JPEG, PNG, WebP or GIF image.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      alert('Image must be under 2MB.');
      return;
    }
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (!token) return;
    setUploadingPhoto(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const response = await fetch(`${API_BASE}/api/dashboard/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          profileImage: dataUrl,
        }),
      });
      if (response.ok && onUpdate) {
        onUpdate();
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.message || 'Failed to update profile photo.');
      }
    } catch (err) {
      console.error('Profile photo upload error:', err);
      alert('Failed to update profile photo.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccessMessage('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setChangingPassword(true);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordSuccessMessage('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setPasswordSuccessMessage(''), 3000);
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setPasswordError('Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();

    if (!newLocation.country || !newLocation.city) {
      alert('Please enter both country and city');
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/favorite-locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLocation)
      });

      const data = await response.json();

      if (data.success) {
        alert('Location added successfully!');
        setNewLocation({ country: '', city: '' });
        setShowAddLocation(false);
        fetchFavoriteLocations();
      } else {
        alert(data.message || 'Failed to add location');
      }
    } catch (error) {
      console.error('Add location error:', error);
      alert('Failed to add location. Please try again.');
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!confirm('Delete this location?')) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_BASE}/api/dashboard/favorite-locations/${locationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchFavoriteLocations();
      }
    } catch (error) {
      console.error('Delete location error:', error);
    }
  };

  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ') ||
    [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || 'Profile';
  const initials = [formData.firstName?.charAt(0), formData.lastName?.charAt(0)]
    .filter(Boolean)
    .join('')
    .toUpperCase() ||
    [customer?.firstName?.charAt(0), customer?.lastName?.charAt(0)].filter(Boolean).join('').toUpperCase() || '?';
  const profileImage = customer?.profileImage;

  return (
    <div className="profile-tab">
      <div className="tab-header">
        <h1>Profile & Preferences</h1>
        <p>Manage your account and favorite places.</p>
      </div>

      {/* Hero with avatar and upload */}
      <div className="profile-tab-hero">
        <div className="profile-tab-hero-inner">
          <div className="profile-tab-avatar-wrap">
            <div className="profile-tab-avatar" aria-hidden="true">
              {profileImage ? (
                <img src={profileImage} alt="" />
              ) : (
                initials
              )}
            </div>
            <label className="profile-tab-avatar-upload" title="Upload profile photo">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={handleProfileImageChange}
                disabled={uploadingPhoto}
                aria-label="Upload profile photo"
              />
              {uploadingPhoto ? (
                <span className="profile-avatar-loading" aria-hidden="true">...</span>
              ) : (
                <Camera size={20} strokeWidth={2} />
              )}
            </label>
          </div>
          <div className="profile-tab-hero-text">
            <h1>{fullName}</h1>
            <p>{customer?.email || '—'}</p>
            <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', opacity: 0.85 }}>
              {profileImage ? 'Photo updated. Change it with the camera button.' : 'Add a profile photo so we can recognize you.'}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <section className="profile-tab-section">
        <div className="profile-tab-section-title">
          <div className="icon-wrap">
            <User size={22} strokeWidth={2} />
          </div>
          <h2>Personal Information</h2>
        </div>
        <div className="profile-tab-card">
          <form onSubmit={handleUpdateProfile} className="profile-tab-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <User size={18} />
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <User size={18} />
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                value={customer?.email || ''}
                disabled
                className="disabled-input"
              />
              <small>Email cannot be changed</small>
            </div>
            <div className="form-group">
              <label>
                <Phone size={18} />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-save" disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </section>

      {/* Change Password */}
      <section className="profile-tab-section">
        <div className="profile-tab-section-title">
          <div className="icon-wrap">
            <Lock size={22} strokeWidth={2} />
          </div>
          <h2>Change Password</h2>
        </div>
        <div className="profile-tab-card">
          <form onSubmit={handleChangePassword} className="profile-tab-form">
            {passwordError && (
              <div className="profile-tab-error">{passwordError}</div>
            )}
            {passwordSuccessMessage && (
              <div className="profile-tab-success">{passwordSuccessMessage}</div>
            )}
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <button type="submit" className="btn-save" disabled={changingPassword}>
              <Save size={18} />
              {changingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </section>

      {/* Favorite Locations */}
      <section className="profile-tab-section">
        <div className="profile-tab-section-header">
          <div className="profile-tab-section-title">
            <div className="icon-wrap">
              <Star size={22} strokeWidth={2} />
            </div>
            <h2>Favorite Locations</h2>
          </div>
          <button
            type="button"
            className="btn-add"
            onClick={() => setShowAddLocation(!showAddLocation)}
          >
            <Plus size={18} />
            Add Location
          </button>
        </div>
        <div className="profile-tab-card">
          {showAddLocation && (
            <form onSubmit={handleAddLocation} className="profile-tab-form add-location-form">
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Country"
                    value={newLocation.country}
                    onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="City"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary-small">Add</button>
                <button
                  type="button"
                  className="btn-secondary-small"
                  onClick={() => setShowAddLocation(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          {favoriteLocations.length === 0 ? (
            <div className="profile-tab-empty-state">
              <MapPin size={48} />
              <p>No favorite locations saved</p>
            </div>
          ) : (
            <div className="profile-tab-locations-list">
              {favoriteLocations.map((location) => (
                <div key={location._id} className="profile-tab-location-card">
                  <div className="location-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="location-info">
                    <h4>{location.country}</h4>
                    <p className="location-city">{location.city}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-delete-icon"
                    onClick={() => handleDeleteLocation(location._id)}
                    aria-label="Delete location"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfileTab;
