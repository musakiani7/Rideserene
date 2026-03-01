import { useState, useEffect } from 'react';
import { Bell, Globe, Lock, Save } from 'lucide-react';
import './DashboardTabs.css';

const SettingsTab = ({ customer, onUpdate }) => {
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: true,
      push: true,
    },
    language: 'en',
    defaultVehicleClass: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer?.preferences) {
      setPreferences({
        notifications: customer.preferences.notifications || {
          email: true,
          sms: true,
          push: true,
        },
        language: customer.preferences.language || 'en',
        defaultVehicleClass: customer.preferences.defaultVehicleClass || '',
      });
    }
  }, [customer]);

  const handleSaveSettings = async () => {
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
        body: JSON.stringify({ preferences })
      });

      if (response.ok) {
        alert('Settings saved successfully!');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Save settings error:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-tab">
      <div className="tab-header">
        <h1>Settings</h1>
      </div>

      {/* Notifications */}
      <div className="section">
        <h2>
          <Bell size={20} />
          Notifications
        </h2>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Email Notifications</h4>
              <p>Receive booking confirmations and updates via email</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.notifications.email}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notifications: { ...preferences.notifications, email: e.target.checked }
                })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>SMS Notifications</h4>
              <p>Get text messages for ride updates and driver arrival</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.notifications.sms}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notifications: { ...preferences.notifications, sms: e.target.checked }
                })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Push Notifications</h4>
              <p>Receive push notifications on your device</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.notifications.push}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notifications: { ...preferences.notifications, push: e.target.checked }
                })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="section">
        <h2>
          <Globe size={20} />
          Language & Region
        </h2>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Language</h4>
              <p>Choose your preferred language</p>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              className="setting-select"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking Preferences */}
      <div className="section">
        <h2>Booking Preferences</h2>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Default Vehicle Class</h4>
              <p>Pre-select your preferred vehicle class</p>
            </div>
            <select
              value={preferences.defaultVehicleClass}
              onChange={(e) => setPreferences({ ...preferences, defaultVehicleClass: e.target.value })}
              className="setting-select"
            >
              <option value="">None</option>
              <option value="business">Business Class</option>
              <option value="first">First Class</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="section">
        <h2>
          <Lock size={20} />
          Security
        </h2>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Change Password</h4>
              <p>Update your account password</p>
            </div>
            <button className="btn-secondary-small">Change Password</button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security to your account</p>
            </div>
            <button className="btn-secondary-small">Enable 2FA</button>
          </div>
        </div>
      </div>

      <button 
        className="btn-save-settings"
        onClick={handleSaveSettings}
        disabled={saving}
      >
        <Save size={18} />
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

export default SettingsTab;
