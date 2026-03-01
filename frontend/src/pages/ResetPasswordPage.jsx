import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = searchParams.get('token');
  const isChauffeur = location.pathname.toLowerCase().includes('chauffeur');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Invalid reset link. Missing token.');
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage(null);
    if (!token) {
      setError('Invalid reset link. Please use the link from your email.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const endpoint = isChauffeur
      ? `${API_BASE}/api/chauffeur/reset-password`
      : `${API_BASE}/api/auth/reset-password`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      setIsLoading(false);
      if (data.success) {
        setMessage(data.message || 'Password reset successfully. You can now sign in.');
        setTimeout(() => {
          navigate(isChauffeur ? '/chauffeur-login' : '/login', { replace: true });
        }, 2500);
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Unable to reach server. Please try again later.');
    }
  };

  if (!token && !error) return null;

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1 className="reset-password-title">Set new password</h1>
          <p className="reset-password-subtitle">
            Enter your new password below. It must be at least 6 characters.
          </p>
        </div>

        {error && <div className="reset-password-error">{error}</div>}
        {message && <div className="reset-password-success">{message}</div>}

        {!message && token ? (
          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group-login">
              <label htmlFor="newPassword" className="form-label">New password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="form-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="form-group-login">
              <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="form-input"
                />
              </div>
            </div>
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? <span className="loading-spinner" /> : 'Reset password'}
            </button>
          </form>
        ) : null}

        <div className="reset-password-links">
          <Link to={isChauffeur ? '/chauffeur-login' : '/login'} className="back-to-login">
            Back to {isChauffeur ? 'Chauffeur ' : ''}Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
