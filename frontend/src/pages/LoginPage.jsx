import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Shield, Clock, MapPin, Info } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.booking;
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        const errorMsg = data.errors?.[0]?.msg || data.message || 'Invalid email or password';
        setError(errorMsg);
        return;
      }

      // Success: store token and user info
      if (data.token) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', data.token);
        if (data.customer) {
          storage.setItem('user', JSON.stringify(data.customer));
        }
      }

      // If there's booking data, navigate to checkout, otherwise go to dashboard
      if (bookingData) {
        navigate('/checkout', { 
          state: { 
            booking: bookingData
          }
        });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      setError('Unable to reach server. Please try again later.');
    }
  };

  const features = [
    {
      icon: <MapPin size={32} />,
      title: 'Book Premium Rides',
      description: 'Access luxury chauffeur services worldwide'
    },
    {
      icon: <Shield size={32} />,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: <Clock size={32} />,
      title: '24/7 Availability',
      description: 'Book rides anytime, anywhere in the world'
    }
  ];

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Login Form */}
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <div className="login-header">
              <h1 className="login-title">Customer Login</h1>
              <p className="login-subtitle">Welcome back! Please login to your account</p>
              {bookingData && (
                <div className="booking-notice">
                  <Info size={16} />
                  <span>Please login to complete your booking</span>
                </div>
              )}
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group-login">
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={20} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group-login">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="login-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  'Login'
                )}
              </button>

              <div className="register-here-wrap">
                <Link to="/signup" className="register-here-btn">Register here</Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="login-features-section">
          <div className="features-content">
            <div className="features-header">
              <h2>Experience Luxury Travel</h2>
              <p>Join thousands of customers enjoying premium chauffeur services worldwide</p>
            </div>

            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-card-login">
                  <div className="feature-icon-login">{feature.icon}</div>
                  <div className="feature-text-login">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="stats-section">
              <div className="stat-item">
                <h3>1M+</h3>
                <p>Happy Customers</p>
              </div>
              <div className="stat-item">
                <h3>300+</h3>
                <p>Cities Worldwide</p>
              </div>
              <div className="stat-item">
                <h3>24/7</h3>
                <p>Support Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
