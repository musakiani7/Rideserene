import { useState } from 'react';
import { Globe, DollarSign, Users, Headphones, TrendingUp, Shield, ChevronDown, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import './TravelAgenciesPage.css';

const TravelAgenciesPage = () => {
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

  const services = [
    {
      title: 'Ease of sourcing',
      description: 'Booking everything outside the hassle. Simply book with us and forget about the stress of arrangement.',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80'
    },
    {
      title: 'Global availability',
      description: 'We are in over 50 countries and 300+ cities worldwide. Book chauffeur services wherever your clients travel.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
    },
    {
      title: 'Superior service',
      description: 'All of our chauffeurs are licensed professionals who provide premium service and maintain the highest standards.',
      image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80'
    }
  ];

  const features = [
    {
      icon: <Globe size={28} />,
      title: 'Global availability',
      description: 'Book in over 50 countries and 300+ cities with consistent quality and service standards.'
    },
    {
      icon: <DollarSign size={28} />,
      title: 'Fully transparent rates',
      description: 'Fixed, distance-based pricing with no hidden fees. Know the cost upfront for every booking.'
    },
    {
      icon: <Users size={28} />,
      title: 'Increase flexibility',
      description: 'Flexible cancellation policies and easy modifications to accommodate your clients\' changing plans.'
    },
    {
      icon: <Headphones size={28} />,
      title: '24/7 Customer support',
      description: 'Round-the-clock multilingual support for you and your clients in every time zone.'
    },
    {
      icon: <TrendingUp size={28} />,
      title: 'Easy integration',
      description: 'Seamlessly integrate our services into your booking platform with our API solutions.'
    },
    {
      icon: <Shield size={28} />,
      title: 'Best-in-class service',
      description: 'Professional chauffeurs, premium vehicles, and reliability you can trust for your clients.'
    }
  ];

  const contentSections = [
    {
      title: 'Additional revenue and commissions without the hassle',
      description: 'Offer your clients premium chauffeur services and earn attractive commissions on every booking. No inventory management, no vehicle maintenance—just pure revenue addition to your travel packages.',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
      reverse: false
    },
    {
      title: 'Vehicles ready for all occasions',
      description: 'From business sedans to luxury SUVs and spacious vans, we have the perfect vehicle for every client need. Airport transfers, city tours, corporate events, or special occasions—we have it covered.',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
      reverse: true
    },
    {
      title: 'Deliver top-notch client satisfaction',
      description: 'Enhance your service offering with our premium chauffeur services. Your clients will appreciate the seamless experience, professional service, and reliable transportation you provide through our partnership.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      reverse: false
    },
    {
      title: 'Boost your brand reputation',
      description: 'Partner with a globally recognized chauffeur service provider. Our reputation for excellence reflects positively on your brand, helping you attract and retain high-value clients who expect the best.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      reverse: true
    }
  ];

  const fleetItems = [
    {
      title: 'Business Class',
      description: 'Premium sedans perfect for business travelers and airport transfers.',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80'
    },
    {
      title: 'First Class',
      description: 'Luxury vehicles for VIP clients who demand the finest experience.',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80'
    },
    {
      title: 'Business Van',
      description: 'Spacious vans ideal for group travel and family vacations.',
      image: 'https://images.unsplash.com/photo-1519003300449-424ad0405076?w=800&q=80'
    }
  ];

  const faqs = [
    {
      question: 'What services can my travel agency offer?',
      answer: 'You can offer a complete range of chauffeur services including airport transfers, city tours, hourly hires, intercity transfers, and event transportation across 300+ cities worldwide.'
    },
    {
      question: 'How does commission and pricing work?',
      answer: 'We offer competitive commission rates on all bookings. Pricing is transparent and distance-based with no hidden fees. You will receive detailed commission statements monthly.'
    },
    {
      question: 'What support do you provide for travel agencies?',
      answer: 'We provide dedicated account management, 24/7 customer support, marketing materials, API integration support, and training for your team to ensure smooth operations.'
    },
    {
      question: 'How can I integrate Blacklane into my booking system?',
      answer: 'We offer comprehensive API documentation and technical support to integrate our services seamlessly into your existing booking platform or website.'
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
      const response = await fetch('http://localhost:5000/api/travel-agency/inquiry', {
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
    <div className="travel-agencies-page">
      {/* Hero Section */}
      <section className="hero-travel-section">
        <div className="hero-travel-overlay"></div>
        <div className="container">
          <div className="hero-travel-content">
            <h1 className="hero-travel-title">
              Global Chauffeur Services for Travel Agencies
            </h1>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-travel-section section">
        <div className="container">
          <h2 className="section-title-travel">Elevate Your Travel Agency Services</h2>
          
          <div className="services-travel-grid">
            {services.map((service, index) => (
              <div key={index} className="service-travel-card">
                <div className="service-travel-image">
                  <img src={service.image} alt={service.title} />
                </div>
                <div className="service-travel-content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="services-cta">
            <button className="btn-travel-primary">Discover our destinations</button>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial-travel-section section">
        <div className="container">
          <div className="testimonial-travel-box">
            <p className="testimonial-travel-quote">
              "We especially value the speed of booking and cost efficiency. We always include Rideserene in our corporate travel packages because of the reliability and service. It's a very important supplier to us here."
            </p>
            <p className="testimonial-travel-author">
              Travel Agency Partner
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      {contentSections.map((section, index) => (
        <section key={index} className={`content-travel-section section ${section.reverse ? 'reverse' : ''}`}>
          <div className="container">
            <div className="content-travel-layout">
              <div className="content-travel-image">
                <img src={section.image} alt={section.title} />
              </div>
              <div className="content-travel-text">
                <h2>{section.title}</h2>
                <p>{section.description}</p>
                {index === contentSections.length - 1 && (
                  <button className="btn-travel-secondary">Contact sales</button>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Fleet Section */}
      <section className="fleet-travel-section section">
        <div className="container">
          <h2 className="section-title-travel">Our modern fleet</h2>
          
          <div className="fleet-travel-grid">
            {fleetItems.map((item, index) => (
              <div key={index} className="fleet-travel-card">
                <div className="fleet-travel-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="fleet-travel-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="fleet-cta">
            <button className="btn-travel-primary">Discover our fleet</button>
          </div>
        </div>
      </section>

      {/* API Integration Section */}
      <section className="api-section section">
        <div className="container">
          <div className="api-content-layout">
            <div className="api-image">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" alt="API Integration" />
            </div>
            <div className="api-text">
              <h2>Explore our API integrations</h2>
              <p>
                Seamlessly integrate Rideserene global chauffeur network into your booking platform. 
                Our robust API provides real-time availability, instant booking confirmation, and 
                automated invoicing. Complete technical documentation and dedicated support ensure 
                smooth integration.
              </p>
              <button className="btn-travel-primary">Learn more</button>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Pages Section */}
      <section className="dedicated-pages-section section">
        <div className="container">
          <div className="dedicated-content-layout">
            <div className="dedicated-text">
              <h2>Check out our dedicated pages</h2>
              <p>
                Discover more about our services, coverage areas, and partnership opportunities. 
                Browse our destination guides, learn about our chauffeurs, and explore how we 
                can help your travel agency deliver exceptional transportation experiences.
              </p>
              <button className="btn-travel-primary">Explore pages</button>
            </div>
            <div className="dedicated-image">
              <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80" alt="Dedicated Pages" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-travel-section section">
        <div className="container">
          <h2 className="section-title-travel">Experience our travel agency benefits</h2>
          
          <div className="benefits-travel-grid">
            {features.map((feature, index) => (
              <div key={index} className="benefit-travel-card">
                <div className="benefit-travel-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-travel-form-section section">
        <div className="container">
          <h2 className="section-title-travel">Transform your client travel</h2>
          <p className="section-subtitle-travel">
            Partner with us to offer your clients premium chauffeur services worldwide. 
            Fill out the form below and our partnerships team will contact you shortly.
          </p>

          <form onSubmit={handleSubmit} className="travel-contact-form">
            <div className="form-row-travel">
              <div className="form-group-travel">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group-travel">
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

            <div className="form-row-travel">
              <div className="form-group-travel">
                <input
                  type="text"
                  name="company"
                  placeholder="Travel Agency Name"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group-travel">
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

            <div className="form-row-travel">
              <div className="form-group-travel">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone number (optional)"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group-travel">
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

            <div className="form-group-travel">
              <select
                name="interestedIn"
                value={formData.interestedIn}
                onChange={handleChange}
                required
              >
                <option value="">What best describes your interest?</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="api">API Integration</option>
                <option value="commission">Commission Rates</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>

            <div className="form-group-travel">
              <textarea
                name="message"
                placeholder="Tell us about your travel agency"
                value={formData.message}
                onChange={handleChange}
                rows="4"
              ></textarea>
            </div>

            <div className="form-footer-travel">
              <label className="privacy-checkbox-travel">
                <input type="checkbox" required />
                <span>I understand my information will be saved.</span>
              </label>
              <button type="submit" className="btn-travel-submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-travel-section section">
        <div className="container">
          <div className="faq-travel-content">
            <div className="faq-travel-list">
              <h2>Frequently Asked Questions</h2>
              {faqs.map((faq, index) => (
                <div key={index} className="faq-travel-item">
                  <button
                    className="faq-travel-question"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`faq-travel-icon ${openFaq === index ? 'open' : ''}`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="faq-travel-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="faq-travel-image">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80" alt="Travel Agency FAQ" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-travel-cta-section section">
        <div className="container">
          <div className="final-travel-cta-box">
            <h3>Ready to get started?</h3>
            <button className="btn-travel-primary-large">Contact us today</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TravelAgenciesPage;
