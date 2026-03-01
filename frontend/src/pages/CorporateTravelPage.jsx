import { useState } from 'react';
import { Building2, Globe, Clock, Shield, TrendingUp, Users, Calendar, FileText, HeadphonesIcon, Leaf, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CorporateTravelPage.css';

const CorporateTravelPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    interestedIn: '',
    message: ''
  });

  const occasions = [
    {
      title: 'Business trips',
      description: 'Provide your employees with the most comfortable transport for their business trips. Add an extra revenue source to your companies, whether domestic or international.',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80'
    },
    {
      title: 'Corporate events',
      description: 'To the board meeting, taking a business trip or going to a conference, make sure your executives and visitors arrive on time and in style.',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80'
    },
    {
      title: 'Roadshows',
      description: 'Get a vehicle for your entire roadshow trip. Our chauffeurs can wait at each location and are ready when you are for the next destination.',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80'
    },
    {
      title: 'Airport transfers',
      description: 'Make your business trips or any traveling convenient with our meet and greet chauffeur service. Our chauffeurs monitor your flight and are always on time.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80'
    }
  ];

  const reliabilityFeatures = [
    'Rides confirmed and charged only after completion',
    'Vetted and licensed professional chauffeurs',
    'Know your chauffeur before your ride',
    'Track your ride in real time',
    "Flight tracking and up to 60 minutes' waiting time",
    'Carbon offsetting by default on every ride'
  ];

  const invoiceFeatures = [
    'Set booking permissions for team members',
    'Upload lists of employees with automated profile management',
    'Get usage statistics for all bookings',
    'Receive monthly consolidated invoices',
    'Expense reports made easy with 15-day or 30-day billing',
    'Export reports in CSV or Excel formats'
  ];

  const corporateBenefits = [
    {
      icon: <Building2 size={28} />,
      title: 'Competitive pricing',
      description: 'Access premium service at fixed, distance-based prices that are fair to you and our chauffeurs.'
    },
    {
      icon: <Globe size={28} />,
      title: 'Global availability',
      description: 'Book in over 50 countries and 300+ cities worldwide with consistent quality and service.'
    },
    {
      icon: <Clock size={28} />,
      title: 'Priority dispatching',
      description: 'Get priority booking and dispatching for your corporate account with dedicated support.'
    },
    {
      icon: <Shield size={28} />,
      title: 'Easy booking',
      description: 'Book through our portal, API, app or phone. Set profiles and payment methods for team members.'
    },
    {
      icon: <TrendingUp size={28} />,
      title: 'Corporate reports',
      description: 'Get detailed cost reports and usage statistics to help you manage travel budgets efficiently.'
    },
    {
      icon: <Users size={28} />,
      title: 'Business-tailored options',
      description: 'We provide the right ride for every occasion, from sedans to SUVs and vans.'
    }
  ];

  const sustainabilityItems = [
    {
      title: 'Electric Class',
      tag: 'NEW',
      description: 'Go fully electric in Tesla Model S, Audi e-tron and other luxury electric vehicles.',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80'
    },
    {
      title: 'Carbon neutrality',
      description: 'All our chauffeurs offset 100% of their carbon emissions at no extra cost to you.',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80'
    },
    {
      title: '50% electric by 2030',
      description: "We're on track to making all our rides fully electric by 2030.",
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80'
    }
  ];

  const articles = [
    {
      title: 'Executive sedan standards for corporate travel',
      category: 'TRAVEL',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80'
    },
    {
      title: 'Business travel sustainability best practices',
      category: 'SUSTAINABILITY',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80'
    },
    {
      title: "Travel trends: What's next in business mobility",
      category: 'INSIGHTS',
      image: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&q=80'
    }
  ];

  const faqs = [
    {
      question: 'How do I onboard my corporate team?',
      answer: "Simply fill out the form below or contact our corporate sales team. We'll set up your account, add your team members, and configure billing preferences within 24-48 hours."
    },
    {
      question: 'What is unique about the chauffeur service?',
      answer: 'Our chauffeurs are professionally licensed, vetted, and trained to provide the highest level of service. They arrive on time, monitor flights, and ensure a comfortable, professional experience.'
    },
    {
      question: 'How can Blacklane help reduce corporate travel spend?',
      answer: 'With transparent distance-based pricing, consolidated monthly invoices, detailed usage reports, and no hidden fees, you can better manage and reduce your travel spend while maintaining quality.'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/corporate/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Thank you for your inquiry! Our team will contact you soon.');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          company: '',
          email: '',
          phone: '',
          country: '',
          interestedIn: '',
          message: ''
        });
      } else {
        alert(data.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit inquiry. Please check your connection and try again.');
    }
  };

  return (
    <div className="corporate-travel-page">
      {/* Hero Section */}
      <section className="hero-corporate-section">
        <div className="hero-corporate-overlay"></div>
        <div className="container">
          <div className="hero-corporate-content">
            <h1 className="hero-corporate-title">
              Corporate Travel Solutions for Business Executives
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Image Banner */}
      <section className="hero-image-banner">
        <div className="container">
          <div className="hero-banner-image">
            <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80" alt="Corporate Fleet" />
          </div>
        </div>
      </section>

      {/* Occasions Section */}
      <section className="occasions-section section">
        <div className="container">
          <h2 className="section-title-corporate">Corporate chauffeur services for every occasion</h2>
          
          <div className="occasions-grid">
            {occasions.map((occasion, index) => (
              <div key={index} className="occasion-card">
                <div className="occasion-image">
                  <img src={occasion.image} alt={occasion.title} />
                </div>
                <div className="occasion-content">
                  <h3>{occasion.title}</h3>
                  <p>{occasion.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="occasions-cta">
            <button className="btn-corporate-primary">Discover our destinations</button>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial-corporate-section section">
        <div className="container">
          <div className="testimonial-corporate-box">
            <p className="testimonial-corporate-quote">
              "I know that I can rely on Rideserene high quality standards worldwide. The customer service team focus at Rideserene, which makes me feel taken care of."
            </p>
            <p className="testimonial-corporate-author">
              Witta Wente, Project Manager, American Express Meetings & Events
            </p>
          </div>
        </div>
      </section>

      {/* Reliability Section */}
      <section className="reliability-section section">
        <div className="container">
          <div className="reliability-content">
            <div className="reliability-image">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" alt="Reliable Service" />
            </div>
            <div className="reliability-text">
              <h2>A new level of chauffeur reliability</h2>
              <ul className="features-list-corporate">
                {reliabilityFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Invoice Section */}
      <section className="invoice-section section">
        <div className="container">
          <div className="invoice-content">
            <div className="invoice-text">
              <h2>A relief from chasing invoices</h2>
              <ul className="features-list-corporate">
                {invoiceFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <button className="btn-corporate-secondary">Contact sales</button>
            </div>
            <div className="invoice-image">
              <img src="https://images.unsplash.com/photo-1554224311-beee460ae6ba?w=800&q=80" alt="Invoice Management" />
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="booking-executives-section section">
        <div className="container">
          <div className="booking-executives-content">
            <div className="booking-executives-image">
              <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80" alt="Executive Booking" />
            </div>
            <div className="booking-executives-text">
              <h2>Booking for your executives</h2>
              <p>
                Book rides on behalf of your executives, clients, or guests. 
                Set up profiles for VIPs with preferred payment methods and 
                vehicle preferences. Our system handles everything from 
                booking to billing, making it seamless for your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* By The Hour Section */}
      <section className="by-hour-section section">
        <div className="container">
          <div className="by-hour-content">
            <div className="by-hour-text">
              <h2>By the hour</h2>
              <p>
                Need a chauffeur to take you to several appointments or 
                locations during a full day? No worries. Book your chauffeur by the hour, 
                and pay a fixed rate for the time you need. Perfect for roadshows, 
                multi-stop business trips, and corporate events.
              </p>
            </div>
            <div className="by-hour-image">
              <img src="https://images.unsplash.com/photo-1617704548623-340376564e68?w=800&q=80" alt="Hourly Service" />
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="awards-corporate-section section">
        <div className="container">
          <div className="awards-corporate-grid">
            <div className="award-corporate-item">
              <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80" alt="LUX Award" />
            </div>
            <div className="award-corporate-item">
              <img src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80" alt="Business Travel Award" />
            </div>
            <div className="award-corporate-item">
              <img src="https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&q=80" alt="Technology Award" />
            </div>
          </div>
          <div className="ready-started-cta">
            <button className="btn-corporate-primary">Ready to get started?</button>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="sustainability-corporate-section section">
        <div className="container">
          <h2 className="section-title-corporate">Sustainability initiatives</h2>
          <div className="sustainability-grid">
            {sustainabilityItems.map((item, index) => (
              <div key={index} className="sustainability-card">
                <div className="sustainability-image">
                  <img src={item.image} alt={item.title} />
                  {item.tag && <span className="sustainability-tag">{item.tag}</span>}
                </div>
                <div className="sustainability-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Benefits Section */}
      <section className="benefits-corporate-section section">
        <div className="container">
          <h2 className="section-title-corporate">Experience our corporate benefits</h2>
          <div className="benefits-corporate-grid">
            {corporateBenefits.map((benefit, index) => (
              <div key={index} className="benefit-corporate-card">
                <div className="benefit-corporate-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="articles-section section">
        <div className="container">
          <h2 className="section-title-corporate">Check out our latest articles</h2>
          <div className="articles-grid">
            {articles.map((article, index) => (
              <div key={index} className="article-card">
                <div className="article-image">
                  <img src={article.image} alt={article.title} />
                  <span className="article-category">{article.category}</span>
                </div>
                <div className="article-content">
                  <h3>{article.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section section">
        <div className="container">
          <h2 className="section-title-corporate">Elevate your business travel</h2>
          <p className="section-subtitle-corporate">
            Experience a more efficient way of managing business travel while ensuring employee 
            satisfaction. Get in touch with a member of the sales team to learn how you can benefit.
          </p>

          <form onSubmit={handleSubmit} className="corporate-contact-form">
            <div className="form-row-corporate">
              <div className="form-group-corporate">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group-corporate">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row-corporate">
              <div className="form-group-corporate">
                <input
                  type="text"
                  name="company"
                  placeholder="Company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group-corporate">
                <input
                  type="email"
                  name="email"
                  placeholder="Business email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row-corporate">
              <div className="form-group-corporate">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone number (optional)"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group-corporate">
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Country</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="de">Germany</option>
                  <option value="fr">France</option>
                  <option value="ae">UAE</option>
                </select>
              </div>
            </div>

            <div className="form-group-corporate">
              <select
                name="interestedIn"
                value={formData.interestedIn}
                onChange={handleChange}
                required
              >
                <option value="">What best describes your interest?</option>
                <option value="corporate">Corporate Account</option>
                <option value="travel-agency">Travel Agency</option>
                <option value="event">Event Planning</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>

            <div className="form-group-corporate">
              <textarea
                name="message"
                placeholder="How can we help you?"
                value={formData.message}
                onChange={handleChange}
                rows="4"
              ></textarea>
            </div>

            <div className="form-footer-corporate">
              <label className="privacy-checkbox">
                <input type="checkbox" required />
                <span>I understand my information will be saved.</span>
              </label>
              <button type="submit" className="btn-corporate-submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-corporate-section section">
        <div className="container">
          <div className="faq-corporate-content">
            <div className="faq-corporate-list">
              <h2>Frequently asked questions</h2>
              {faqs.map((faq, index) => (
                <div key={index} className="faq-corporate-item">
                  <button
                    className="faq-corporate-question"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`faq-corporate-icon ${openFaq === index ? 'open' : ''}`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="faq-corporate-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="faq-corporate-image">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80" alt="Corporate FAQ" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section section">
        <div className="container">
          <div className="final-cta-box">
            <h3>Ready for Rideserene?</h3>
            <button className="btn-corporate-primary-large">Get started</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CorporateTravelPage;
