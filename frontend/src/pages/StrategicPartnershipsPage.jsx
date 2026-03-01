import { useState } from 'react';
import { Globe, Shield, Users, DollarSign, Settings, Leaf, CheckCircle } from 'lucide-react';
import './StrategicPartnershipsPage.css';

const StrategicPartnershipsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    partnershipType: '',
    message: ''
  });

  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/partnership/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Thank you for your interest in partnering with us! Our team will contact you soon.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          partnershipType: '',
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const partnershipTypes = [
    {
      icon: <Globe />,
      title: "Aviation",
      description: "Partner with leading chauffeur companies in First and Business Class ground",
      benefits: [
        "Seamless arrival service for top commercial airlines",
        "Access to high-grade fleet of top quality vehicles",
        "Work with licensed taxi drivers for peace-of-mind, safety, and drivers knowledge of the road"
      ]
    },
    {
      icon: <Users />,
      title: "Cruise",
      description: "Offer your guests a seamless experience with a best-trained chauffeur",
      benefits: [
        "Deliver your guests a seamless experience from port to hotel",
        "Take advantage of our map experience with port pick up and port pick-up",
        "Timely arrivals ensure a smooth boarding and pre-board process"
      ]
    },
    {
      icon: <DollarSign />,
      title: "Financial services",
      description: "Offer additional benefits to your high net worth customers",
      benefits: [
        "Competitive benefits for travel-booking for your customers and members",
        "Convenient offering for on-demand and pre-booked rides within their Financial Planner",
        "High net-worth customers value the Financial Planner"
      ]
    },
    {
      icon: <Settings />,
      title: "Hotel",
      description: "Elevate hospitality and provide your guests with seamless ground transportation options beyond the hotel doors",
      benefits: [
        "Treat your important guests to effortless chauffeured rides from the airport",
        "Offer guests the convenience and luxury of round-trip rides to the airport",
        "Rely on our global experience in driving travelers worldwide"
      ]
    }
  ];

  const corporateBenefits = [
    {
      icon: <Globe />,
      title: "Global coverage",
      description: "Consistent and reliable service in over 50 countries available in 100+ cities guaranteed"
    },
    {
      icon: <Shield />,
      title: "Compliance and safety",
      description: "Travel confidently in clean premium vehicles driven by licensed and vetted professionals"
    },
    {
      icon: <Users />,
      title: "Priority support",
      description: "Dedicated support team available 24/7 for any day-to-day needs and requests or adjustments"
    },
    {
      icon: <DollarSign />,
      title: "Competitive pricing",
      description: "Transparent pricing based on the shortest possible distance and travel time of the booking"
    },
    {
      icon: <Settings />,
      title: "Custom business solutions",
      description: "Bring a tailored custom booking solutions directly with API/CSV integration complementary services"
    },
    {
      icon: <Leaf />,
      title: "Sustainable travel",
      description: "We prioritize the use of EVs in select cities, and minimize our carbon footprint in others"
    }
  ];

  const faqs = [
    {
      question: "What types of partnerships does Rideserene offer?",
      answer: "We offer partnerships in Aviation, Cruise, Financial Services, and Hospitality sectors. Each partnership is tailored to meet the specific needs of your industry and customers."
    },
    {
      question: "How can I integrate your services with my existing platform?",
      answer: "We provide comprehensive API integration solutions that allow seamless booking integration into your existing systems. Our technical team will work with you throughout the implementation process."
    },
    {
      question: "What are the benefits of becoming a strategic partner?",
      answer: "Partners gain access to our global network of professional chauffeurs, competitive pricing, 24/7 support, and customized solutions tailored to their business needs."
    },
    {
      question: "How long does the partnership onboarding process take?",
      answer: "The onboarding process typically takes 2-4 weeks, depending on the complexity of integration and customization requirements. Our team ensures a smooth transition."
    },
    {
      question: "Do you provide marketing support for partners?",
      answer: "Yes, we provide co-marketing opportunities, branded materials, and promotional support to help you offer premium chauffeur services to your customers."
    }
  ];

  return (
    <div className="strategic-partnerships-page">
      {/* Hero Section */}
      <section className="sp-hero">
        <div className="sp-hero-overlay"></div>
        <div className="sp-hero-content">
          <h1>Partnership Opportunities with Rideserene</h1>
        </div>
      </section>

      {/* Partnership Types Section */}
      <section className="sp-types-section">
        <div className="sp-container">
          <h2>Become a Rideserene partner</h2>
          <div className="sp-types-grid">
            {partnershipTypes.map((type, index) => (
              <div key={index} className="sp-type-card">
                <div className="sp-type-icon">{type.icon}</div>
                <h3>{type.title}</h3>
                <p className="sp-type-description">{type.description}</p>
                <ul className="sp-type-benefits">
                  {type.benefits.map((benefit, idx) => (
                    <li key={idx}>
                      <CheckCircle size={16} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Benefits Section */}
      <section className="sp-benefits-section">
        <div className="sp-container">
          <h2>Experience our corporate benefits</h2>
          <div className="sp-benefits-grid">
            {corporateBenefits.map((benefit, index) => (
              <div key={index} className="sp-benefit-card">
                <div className="sp-benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="sp-testimonial-section">
        <div className="sp-container">
          <blockquote className="sp-testimonial">
            <p>
              "Emirates is committed to extend its premium quality. We offer complimentary Chauffeur-drive service to our First and Business Class customers in over 75 cities worldwide and thanks to Rideserene global presence, we can deliver this in more destinations."
            </p>
            <cite>Bill McPherson, Emirates Airlines, Former Vice President, Airport Services (Quotation)</cite>
          </blockquote>
        </div>
      </section>

      {/* API Integration Section */}
      <section className="sp-api-section">
        <div className="sp-container">
          <div className="sp-api-content">
            <div className="sp-api-image">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" alt="API Integration" />
            </div>
            <div className="sp-api-text">
              <h2>Explore our API integrations</h2>
              <p className="sp-api-intro">
                From instant bookings to streamlined cancellations, high-integration with global booking platforms made corporate travel seamless, safe, and, simplified without missing a beat.
              </p>
              <ul className="sp-api-features">
                <li>
                  <CheckCircle size={20} />
                  <span><strong>Versatile booking options:</strong> Exchange data via SOAP, openTravel, and via our API</span>
                </li>
                <li>
                  <CheckCircle size={20} />
                  <span><strong>Developed with full functionality:</strong></span>
                </li>
                <li>
                  <CheckCircle size={20} />
                  <span><strong>Top OBT compatibility:</strong> Leverage tools like SAP Concur and Amadeus for real-time bookings, directly integrated into your existing workflow</span>
                </li>
                <li>
                  <CheckCircle size={20} />
                  <span><strong>Instant alerts, real-time updates:</strong> Live pricing, availability, and trip details ensure a seamless car service experience, for you and your customers</span>
                </li>
              </ul>
              <button className="sp-cta-button">Learn more</button>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="sp-awards-section">
        <div className="sp-container">
          <div className="sp-awards-content">
            <div className="sp-awards-text">
              <h3>Award-winning<br />chauffeur service</h3>
            </div>
            <div className="sp-awards-logos">
              <div className="sp-award-logo">
                <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80" alt="LUX Award" />
              </div>
              <div className="sp-award-logo">
                <img src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80" alt="Business Travel Awards Europe 2024" />
              </div>
              <div className="sp-award-logo">
                <img src="https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&q=80" alt="Sustainable Award" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="sp-contact-section">
        <div className="sp-container">
          <div className="sp-contact-content">
            <div className="sp-contact-text">
              <h2>Join us as a chauffeur partner today</h2>
              <p>Own or manage properties vehicles? Let's talk</p>
            </div>
            <button className="sp-contact-button">Become a chauffeur partner</button>
          </div>
        </div>
      </section>

      {/* Partnership Inquiry Form */}
      <section className="sp-form-section">
        <div className="sp-container">
          <div className="sp-form-wrapper">
            <h2>Let's discuss partnership opportunities</h2>
            <p className="sp-form-intro">Fill out the form below and our partnership team will contact you within 24 hours.</p>
            <form onSubmit={handleSubmit} className="sp-form">
              <div className="sp-form-row">
                <div className="sp-form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="sp-form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="sp-form-row">
                <div className="sp-form-group">
                  <label htmlFor="company">Company Name *</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="sp-form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="sp-form-group">
                <label htmlFor="partnershipType">Partnership Type *</label>
                <select
                  id="partnershipType"
                  name="partnershipType"
                  value={formData.partnershipType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select partnership type</option>
                  <option value="aviation">Aviation</option>
                  <option value="cruise">Cruise</option>
                  <option value="financial">Financial Services</option>
                  <option value="hotel">Hotel</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="sp-form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your partnership interests and requirements..."
                ></textarea>
              </div>
              <button type="submit" className="sp-submit-button">Submit Inquiry</button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="sp-faq-section">
        <div className="sp-container">
          <h2>Frequently Asked Questions</h2>
          <div className="sp-faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="sp-faq-item">
                <button
                  className={`sp-faq-question ${openFaq === index ? 'active' : ''}`}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  {faq.question}
                  <span className="sp-faq-icon">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className="sp-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="sp-final-cta">
        <div className="sp-container">
          <h2>Ready to start a partnership?</h2>
          <p>Join our network of premium partners and offer your customers world-class chauffeur services</p>
          <button className="sp-cta-button">Contact Partnership Team</button>
        </div>
      </section>
    </div>
  );
};

export default StrategicPartnershipsPage;
