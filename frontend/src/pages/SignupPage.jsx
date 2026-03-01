import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Shield, Clock, MapPin, User, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './SignupPage.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (!acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    // Send request to backend API. Use Vite env variable if available.
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        // If backend returned validation errors, display first message
          if (data && data.errors && data.errors.length) {
            alert(data.errors[0].msg || 'Signup failed');
            return;
          }
          alert(data.message || 'Signup failed');
        return;
      }

      // Success
      alert(data.message || 'Account created');
      // Save token if provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      // Redirect to login (SPA navigation)
      setTimeout(() => {
        try {
          navigate('/login');
        } catch (e) {
          window.location.href = '/login';
        }
      }, 800);
    } catch (err) {
      console.error('Signup error:', err);
      setIsLoading(false);
      alert('Unable to reach server. Please try again later.');
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
    <div className="signup-page">
      <div className="signup-container">
        {/* Left Side - Signup Form */}
        <div className="signup-form-section">
          <div className="signup-form-wrapper">
            <div className="signup-header">
              <h1 className="signup-title">Create Account</h1>
              <p className="signup-subtitle">Sign up to start booking premium rides</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-row-signup">
                <div className="form-group-signup">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <div className="input-wrapper">
                    <User size={20} className="input-icon" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group-signup">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <div className="input-wrapper">
                    <User size={20} className="input-icon" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group-signup">
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

              <div className="form-group-signup">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <div className="input-wrapper">
                  <Phone size={20} className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group-signup">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Create a password"
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

              <div className="form-group-signup">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <span>I agree to the <Link to="/terms" className="link-text">Terms & Conditions</Link> and <Link to="/privacy" className="link-text">Privacy Policy</Link></span>
                </label>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
                
              </button>

              <p className="signup-footer">
                Already have an account? <Link to="/login" className="link-text">Sign in</Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="signup-features-section">
          <div className="features-content">
            <h2 className="features-title">Join Premium Chauffeur Service</h2>
            <p className="features-description">
              Experience luxury travel with professional chauffeurs worldwide
            </p>
            
            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-text">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
