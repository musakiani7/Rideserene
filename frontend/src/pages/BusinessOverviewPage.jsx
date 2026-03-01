import { Globe, DollarSign, Clock, Users, FileText, Leaf, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './BusinessOverviewPage.css';

const BusinessOverviewPage = () => {
  const services = [
    {
      title: 'Corporate travel',
      description: 'Whether meeting clients, taking a business trip, or going to a conference, we\'ll cover your corporate transportation needs.',
      link: '/business/corporate-travel',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80'
    },
    {
      title: 'Travel agencies',
      description: 'Add an extra revenue source to your travel agency by offering memorable door-to-door experiences to your clients.',
      link: '/business/travel-agencies',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
    },
    {
      title: 'Complimentary services',
      description: 'Give your customers the gift of a luxury transport service with our custom business solutions and priority support.',
      link: '/business/partnerships',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80'
    }
  ];

  const benefits = [
    {
      icon: <Globe size={32} />,
      title: 'Global reliability',
      description: 'Count on instant confirmation and high-quality service for your clients in over 50 countries.'
    },
    {
      icon: <DollarSign size={32} />,
      title: 'Competitive rates',
      description: 'Access premium service at distance-based prices that are fair to you and our chauffeurs.'
    },
    {
      icon: <Clock size={32} />,
      title: 'Unrivaled flexibility',
      description: 'Take the stress out of business travel management with our flexible cancellation policies.'
    },
    {
      icon: <Users size={32} />,
      title: 'Priority support',
      description: 'Our corporate clients always receive multi-lingual and 24/7 support.'
    },
    {
      icon: <FileText size={32} />,
      title: 'Simplified travel management',
      description: 'Our bespoke booking portal makes managing travel quick and easy.'
    },
    {
      icon: <Leaf size={32} />,
      title: 'Sustainability',
      description: 'We proudly offer an array of electric vehicles. Additionally, we ensure our chauffeurs offset emissions.'
    }
  ];

  const awards = [
    { name: 'LUX', image: 'https://images.unsplash.com/photo-1624024165901-e9c2e6c22b2d?w=400&q=80' },
    { name: 'Business Travel Awards Europe 2024', image: 'https://images.unsplash.com/photo-1590682680588-0d1ae8c8b0c8?w=400&q=80' },
    { name: 'Travel Technology Award', image: 'https://images.unsplash.com/photo-1607326957265-28967e2b2c6f?w=400&q=80' }
  ];

  return (
    <div className="business-overview-page">
      {/* Hero Section */}
      <section className="hero-business-section">
        <div className="hero-business-overlay"></div>
        <div className="container">
          <div className="hero-business-content">
            <h1 className="hero-business-title">
              Discover Reliable Corporate Transportation Services
            </h1>
          </div>
        </div>
      </section>

      {/* Award Section */}
      <section className="award-intro-section section">
        <div className="container">
          <h2 className="section-title-business">Award-winning global chauffeur services</h2>
          
          <div className="services-grid-business">
            {services.map((service, index) => (
              <div key={index} className="service-card-business">
                <div className="service-image-business">
                  <img src={service.image} alt={service.title} />
                </div>
                <div className="service-content-business">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <Link to={service.link} className="service-link-business">
                    Discover {service.title.toLowerCase()} <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* Testimonial Section */}
      <section className="testimonial-business-section section">
        <div className="container">
          <div className="testimonial-business-box">
            <p className="testimonial-business-quote">
              "I can always rely on Rideserene to provide our customers with a reliable, professional, and elegant service, with new and clean vehicles that always leave a good impression."
            </p>
            <p className="testimonial-business-author">
              Witta Wente, Project Manager, American Express Meetings & Events
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="why-choose-section section">
        <div className="container">
          <h2 className="section-title-business">Why choose Blacklane?</h2>
          
          <div className="benefits-grid-business">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card-business">
                <div className="benefit-icon-business">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="contact-cta-section section">
        <div className="container">
          <div className="contact-cta-content">
            <div className="contact-cta-text">
              <h3>Have any questions?</h3>
              <p>Feel free to get in contact with us in 60 minutes</p>
            </div>
            <button className="contact-cta-btn">Get in touch</button>
          </div>
        </div>
      </section>

      {/* Awards Footer Section */}
      <section className="awards-section section">
        <div className="container">
          <div className="awards-content">
            <div className="awards-text">
              <h3>Award-winning</h3>
              <h3>chauffeur service</h3>
            </div>
            <div className="awards-logos">
              {awards.map((award, index) => (
                <div key={index} className="award-logo">
                  <img src={award.image} alt={award.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessOverviewPage;
