import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Car, Shield, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './ChauffeurLoginPage.css';

const ChauffeurLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${API_BASE}/api/chauffeur/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        const msg = data.message || 'Login failed';
        const detail = data.error ? ` (${data.error})` : '';
        alert(msg + detail);
        return;
      }

      // Success
      alert('Login successful');
      // Save token and chauffeur info
      if (data.token) {
        if (rememberMe) {
          localStorage.setItem('chauffeurToken', data.token);
        } else {
          sessionStorage.setItem('chauffeurToken', data.token);
        }
      }
      if (data.chauffeur) {
        localStorage.setItem('chauffeurInfo', JSON.stringify(data.chauffeur));
      }
      // Redirect to chauffeur dashboard
      setTimeout(() => {
        navigate('/chauffeur-dashboard');
      }, 800);
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      alert('Unable to reach server. Please try again later.');
    }
  };

  const features = [
    {
      icon: <Car size={32} />,
      title: 'Manage Your Rides',
      description: 'Accept and manage bookings with ease'
    },
    {
      icon: <Shield size={32} />,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: <Clock size={32} />,
      title: 'Flexible Schedule',
      description: 'Work on your own terms, anytime'
    }
  ];

  return (
    <div className="chauffeur-login-page">
      <div className="login-container">
        {/* Left Side - Login Form */}
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <div className="login-header">
              <h1 className="login-title">Chauffeur Login</h1>
              <p className="login-subtitle">Welcome back! Please login to your account</p>
            </div>

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
                <Link to="/chauffeur-forgot-password" className="forgot-password">
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

              <div className="signup-link">
                <p>Don't have an account? <Link to="/become-chauffeur">Become a Chauffeur</Link></p>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="login-features-section">
          <div className="features-content">
            <div className="features-header">
              <h2>Join Our Elite Chauffeur Network</h2>
              <p>Experience the benefits of working with the world's leading chauffeur service</p>
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
                <h3>50,000+</h3>
                <p>Active Chauffeurs</p>
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

export default ChauffeurLoginPage;
