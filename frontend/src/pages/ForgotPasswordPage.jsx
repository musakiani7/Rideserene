import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail } from 'lucide-react';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isChauffeur = location.pathname.toLowerCase().includes('chauffeur');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const endpoint = isChauffeur
      ? `${API_BASE}/api/chauffeur/forgot-password`
      : `${API_BASE}/api/auth/forgot-password`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setIsLoading(false);
      if (data.success) {
        setMessage(data.message || 'If an account exists with this email, you will receive a password reset link shortly.');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Unable to reach server. Please try again later.');
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1 className="forgot-password-title">Forgot Password</h1>
          <p className="forgot-password-subtitle">
            {isChauffeur
              ? 'Enter your chauffeur account email and we’ll send you a link to reset your password.'
              : 'Enter your email and we’ll send you a link to reset your password.'}
          </p>
        </div>

        {error && <div className="forgot-password-error">{error}</div>}
        {message && <div className="forgot-password-success">{message}</div>}

        {!message ? (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group-login">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            </div>
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? <span className="loading-spinner" /> : 'Send reset link'}
            </button>
          </form>
        ) : null}

        <div className="forgot-password-links">
          <Link to={isChauffeur ? '/chauffeur-login' : '/login'} className="back-to-login">
            Back to {isChauffeur ? 'Chauffeur ' : ''}Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
