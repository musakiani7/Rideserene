import { useState } from 'react';
import { Users, Calendar, Shield, Headphones, ClipboardList, Globe, Award, CheckCircle } from 'lucide-react';
import './EventsPage.css';

const EventsPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    supportType: '',
    eventType: '',
    eventDate: '',
    estimatedDate: '',
    guestCount: '',
    comments: '',
    numberOfRides: '',
    serviceRequired: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/events/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Thank you for your event inquiry! Our team will contact you soon with a personalized quote.');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          countryCode: '+1',
          supportType: '',
          eventType: '',
          eventDate: '',
          estimatedDate: '',
          guestCount: '',
          comments: '',
          numberOfRides: '',
          serviceRequired: ''
        });
      } else {
        alert(data.message || 'Failed to submit event inquiry. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit event inquiry. Please check your connection and try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const features = [
    {
      icon: <Users />,
      title: "Your chauffeur, your pace",
      description: "Flexible service to go and when. Work on the move with your chauffeur waiting to your timescale, wherever it feels right for you."
    },
    {
      icon: <Calendar />,
      title: "Effortless city travel",
      description: "Navigating a new city? Skip the chaos, confusion and finding parking. Your chauffeur manages all logistics, so you can travel efficiently without the stress."
    },
    {
      icon: <Shield />,
      title: "Focus on what matters",
      description: "Whether it's meeting preparation, catch up on work, answer your business emails, or unwind in comfort while traveling securely door-to-door."
    }
  ];

  const services = [
    {
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
      title: "Corporate conferences and trade shows",
      description: "Seamlessly transport executives, VIPs, and attendees to and from your event. We work with you on services for practical implementation, with our options tailor-made for you."
    },
    {
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
      title: "Luxurious in white-ties and chauffeur dress",
      description: "Make a grand entrance at your gala, wedding, or high-profile event. Our professional chauffeurs service is to provide reliable, comfortable transport, that's elegantly stylish."
    },
    {
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
      title: "Incredibly and decisively at events",
      description: "From concerts to sporting events, ensure your guests or VIP clients arrive on time, relaxed, and relaxed with our true transportation service."
    },
    {
      image: "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=800&q=80",
      title: "Chauffeurs and sophisticated transportation",
      description: "Whether it's a multi-day conference or a single night event, we provide sophisticated transportation to every special event safe and fun to ride this service."
    }
  ];

  const benefits = [
    {
      icon: <Users />,
      title: "Dedicated events team",
      description: "Our global Event Services team is available for any event, large or small, global or local, helping you every step."
    },
    {
      icon: <ClipboardList />,
      title: "Tailored logistics management",
      description: "We'll design an event transportation plan that fits your specific needs—meeting your goals and service proposals that are tailor-fit for your unique needs."
    },
    {
      icon: <Award />,
      title: "Chauffeur excellence",
      description: "Our chauffeurs are fully licensed and trained, professional and courteous. Our chauffeurs are of the highest quality and are held to the same standards world-wide."
    },
    {
      icon: <Headphones />,
      title: "24/7 event support",
      description: "Our on-site-located Customer Care and Events Team are available to provide round-the-clock support for phone or email."
    },
    {
      icon: <ClipboardList />,
      title: "Personalization and coordination",
      description: "We can accommodate VIP requests, group travel management, last-minute schedule changes, we also offer under coordination support."
    },
    {
      icon: <Globe />,
      title: "Global availability",
      description: "Operating globally, we can be anywhere for your event in over 50 countries, 100+ cities across all key event hubs, in NYC, London, and Dubai."
    }
  ];

  const supportedEvents = [
    "Corporate conferences, summits and board meetings",
    "Weddings, galas, and private celebrations",
    "Luxury TMCs and hospitality providers",
    "Film productions and entertainment industry events"
  ];

  return (
    <div className="events-page">
      {/* Hero Section */}
      <section className="events-hero">
        <div className="events-hero-overlay"></div>
        <div className="events-hero-content">
          <h1>Premium, Global Event Chauffeur Service</h1>
        </div>
      </section>

      {/* Features Section */}
      <section className="events-features-section">
        <div className="events-container">
          <div className="events-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="events-feature-card">
                <div className="events-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="events-booking-section">
        <div className="events-container">
          <div className="events-booking-content">
            <div className="events-booking-image">
              <img src="https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&q=80" alt="Event Planning" />
            </div>
            <div className="events-booking-text">
              <p>
                <strong>Booking executed effortlessly</strong> on our event site <strong>dedicated to the best safety</strong> gives you the highest level of ride comfort. Our event services team have Blacklane events or a grand VIP attracting <strong>quality events, concerts</strong> and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="events-services-section">
        <div className="events-container">
          <h2>Seamless, elegant event chauffeur service</h2>
          <div className="events-services-grid">
            {services.map((service, index) => (
              <div key={index} className="events-service-card">
                <div className="events-service-image">
                  <img src={service.image} alt={service.title} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Work With Us Section */}
      <section className="events-why-section">
        <div className="events-container">
          <h2>Why work with us?</h2>
          <div className="events-benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="events-benefit-card">
                <div className="events-benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Support Section */}
      <section className="events-support-section">
        <div className="events-container">
          <div className="events-support-content">
            <div className="events-support-image">
              <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80" alt="Event Support" />
            </div>
            <div className="events-support-text">
              <h2>Who we support</h2>
              <ul className="events-support-list">
                {supportedEvents.map((item, index) => (
                  <li key={index}>
                    <CheckCircle size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="events-global-section">
        <div className="events-container">
          <div className="events-global-content">
            <div className="events-global-text">
              <h2>Our global reach</h2>
              <p>
                Rideserene Event Services provides event organizers provides consistent and reliable service in over 50 countries. Whether it's over a weekend conference or a week-long festival, we've planned and flawlessly implemented sales conferences, incentive, corporate events and PR/PR charging cabins and PR/PR.
              </p>
              <p>
                Chauffeurs are vetted, licensed and have multiple badges (additional training including defensive driving, etiquette, and language skills), and English proficiency is a must. We employ best-in-class technology, communication tools to make efficient ride-on-service event chauffeur every-service and always every-event reservation fully on-point always within budget.
              </p>
            </div>
            <div className="events-global-map">
              <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80" alt="Global Coverage Map" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="events-testimonial-section">
        <div className="events-container">
          <blockquote className="events-testimonial">
            <p>
              "Once you've experienced the Rideserene service, there's no reason to look elsewhere. You're looked after from start to finish."
            </p>
            <cite>- Laura Morris, Travel Counsellors</cite>
          </blockquote>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="events-form-section">
        <div className="events-container">
          <div className="events-form-wrapper">
            <h2>Contact our Events Team</h2>
            <p className="events-form-intro">
              Submit your event-related queries and our Global Events Team will be in touch. To arrange a booking request, email <a href="mailto:events@example.com">Rideserene@gmail.com</a>
            </p>
            <form onSubmit={handleSubmit} className="events-form">
              <div className="events-form-row">
                <div className="events-form-group">
                  <label htmlFor="firstName">First name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="events-form-group">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="events-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="events-form-group">
                <label htmlFor="phone">Phone number</label>
                <div className="events-phone-input">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="events-country-code"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+49">🇩🇪 +49</option>
                  </select>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="events-form-row">
                <div className="events-form-group">
                  <label htmlFor="supportType">Support type</label>
                  <select
                    id="supportType"
                    name="supportType"
                    value={formData.supportType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="new-event">New Event Planning</option>
                    <option value="existing">Existing Event Support</option>
                    <option value="consultation">Consultation</option>
                    <option value="quote">Request Quote</option>
                  </select>
                </div>
                <div className="events-form-group">
                  <label htmlFor="eventType">Event type</label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="conference">Corporate Conference</option>
                    <option value="wedding">Wedding</option>
                    <option value="gala">Gala/Awards</option>
                    <option value="concert">Concert/Festival</option>
                    <option value="sporting">Sporting Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="events-form-row">
                <div className="events-form-group">
                  <label htmlFor="eventDate">Event date (DD.MM.YYYY)</label>
                  <input
                    type="text"
                    id="eventDate"
                    name="eventDate"
                    placeholder="DD.MM.YYYY"
                    value={formData.eventDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="events-form-group">
                  <label htmlFor="estimatedDate">Estimated date (DD.MM.YYYY)</label>
                  <input
                    type="text"
                    id="estimatedDate"
                    name="estimatedDate"
                    placeholder="DD.MM.YYYY"
                    value={formData.estimatedDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="events-form-group">
                <label htmlFor="guestCount">How many guests or VIPs are being transported?</label>
                <input
                  type="text"
                  id="guestCount"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                />
              </div>

              <div className="events-form-group">
                <label htmlFor="comments">Additional notes and comments</label>
                <textarea
                  id="comments"
                  name="comments"
                  rows="4"
                  value={formData.comments}
                  onChange={handleChange}
                  placeholder="Please provide any additional details about your event..."
                ></textarea>
              </div>

              <div className="events-form-group">
                <label htmlFor="numberOfRides">Estimated budget</label>
                <input
                  type="text"
                  id="numberOfRides"
                  name="numberOfRides"
                  value={formData.numberOfRides}
                  onChange={handleChange}
                />
              </div>

              <div className="events-form-group">
                <label htmlFor="serviceRequired">
                  Please provide details of your event requirements
                </label>
                <textarea
                  id="serviceRequired"
                  name="serviceRequired"
                  rows="5"
                  value={formData.serviceRequired}
                  onChange={handleChange}
                  placeholder="Describe your transportation needs, pickup locations, timelines, special requests, etc."
                ></textarea>
              </div>

              <div className="events-form-captcha">
                <div className="captcha-box">
                  <input type="checkbox" id="captcha" required />
                  <label htmlFor="captcha">I'm not a robot</label>
                </div>
                <div className="recaptcha-logo">
                  <span>reCAPTCHA</span>
                </div>
              </div>

              <button type="submit" className="events-submit-button">Submit Request</button>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="events-final-cta">
        <div className="events-container">
          <h2>Ready to elevate your event transportation?</h2>
          <p>Let our dedicated events team create a seamless transportation experience for your guests</p>
          <button className="events-cta-button">Contact Events Team</button>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
