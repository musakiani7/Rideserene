import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Search, ChevronDown, Shield, ArrowRight } from 'lucide-react';
import AutocompleteInput from '../components/AutocompleteInput';
import './CityToCityPage.css';

const CityToCityPage = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState('one-way');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    duration: '2',
    fromPlaceId: '',
    toPlaceId: '',
    fromLat: '',
    fromLng: '',
    toLat: '',
    toLng: ''
  });

  const topCities = [
    { name: 'New York', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80', price: 'From $150' },
    { name: 'Los Angeles', image: 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800&q=80', price: 'From $200' },
    { name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', price: 'From €180' },
    { name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', price: 'From AED 500' }
  ];

  const topRoutes = [
    { from: 'New York', to: 'Philadelphia' },
    { from: 'London', to: 'Oxford' },
    { from: 'Paris', to: 'Reims' },
    { from: 'Dubai', to: 'Abu Dhabi' },
    { from: 'New York', to: 'East Hampton' },
    { from: 'Manchester', to: 'Liverpool' },
    { from: 'Nice', to: 'Saint-Tropez' },
    { from: 'Brisbane', to: 'Gold Coast' }
  ];

  const faqs = [
    { question: 'How do I get a quote?', answer: 'You can get an instant quote by entering your trip details in the booking form above.' },
    { question: 'How much does it a city-to-city trip?', answer: 'Prices vary based on distance and vehicle type. Enter your route for an instant quote.' },
    { question: 'What is the cancellation policy?', answer: 'Free cancellation up to 24 hours before your scheduled pickup time.' },
    { question: 'What vehicles does Ride Serene use?', answer: 'We offer Business Class sedans, Business Van/SUVs, and First Class luxury vehicles.' },
    { question: 'Where will I receive the chauffeur\'s contact information?', answer: 'Contact information is sent via email and SMS 24 hours before pickup.' },
    { question: 'What happens if my trip is delayed?', answer: 'Contact us immediately and we\'ll do our best to accommodate schedule changes.' },
    { question: 'What if I do not find my chauffeur at the agreed pickup point?', answer: 'Call our 24/7 support team for immediate assistance in locating your chauffeur.' },
    { question: 'Does the chauffeur speak English?', answer: 'All our chauffeurs speak English fluently along with local languages.' },
    { question: 'Can I add child seats to the booking?', answer: 'Yes, child seats can be added during booking at no extra charge.' }
  ];

  const [openFaq, setOpenFaq] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.from) {
      alert('Please enter a pickup location (From).');
      return;
    }
    if (tripType === 'one-way' && !formData.to) {
      alert('Please enter a destination (To).');
      return;
    }

    // Build query string
    const params = new URLSearchParams();
    params.set('rideType', tripType);
    params.set('from', formData.from);
    if (tripType === 'one-way') params.set('to', formData.to);
    if (formData.date) params.set('date', formData.date);
    if (formData.time) params.set('time', formData.time);
    if (tripType === 'by-hour') params.set('duration', formData.duration);

    navigate(`/search?${params.toString()}`);
  };

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="city-to-city-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="container">
            <div className="hero-text">
              <h1 className="hero-title">City-to-City Long Distance Car Service</h1>
            </div>
            
            {/* Booking Form */}
            <div className="booking-form-card">
              <div className="trip-type-selector">
                <button 
                  type="button"
                  className={`trip-type-btn ${tripType === 'one-way' ? 'active' : ''}`}
                  onClick={() => setTripType('one-way')}
                >
                  <ArrowRight size={20} style={{ marginRight: '8px' }} />
                  One way
                </button>
                <button 
                  type="button"
                  className={`trip-type-btn ${tripType === 'by-hour' ? 'active' : ''}`}
                  onClick={() => setTripType('by-hour')}
                >
                  <Clock size={20} style={{ marginRight: '8px' }} />
                  By the hour
                </button>
              </div>

              <form onSubmit={handleSearch} className="booking-form">
                <div className="form-group-inline">
                  <label>
                    <MapPin size={20} />
                    From
                  </label>
                  <AutocompleteInput
                    id="from"
                    name="from"
                    placeholder="Address, airport, hotel, ..."
                    value={formData.from}
                    onChange={handleInputChange}
                    types={["(cities)"]}
                    returnPlaceDetails={true}
                    onSelect={({ prediction, details }) => {
                      setFormData((prev) => ({
                        ...prev,
                        from: (details && details.formatted_address) || (prediction && prediction.description) || prev.from,
                        fromPlaceId: prediction?.place_id || prev.fromPlaceId,
                        fromLat: details && details.geometry && details.geometry.location ? details.geometry.location.lat() : prev.fromLat,
                        fromLng: details && details.geometry && details.geometry.location ? details.geometry.location.lng() : prev.fromLng,
                      }));
                    }}
                  />
                </div>

                {tripType === 'one-way' && (
                  <div className="form-group-inline">
                    <label>
                      <MapPin size={20} />
                      To
                    </label>
                    <AutocompleteInput
                      id="to"
                      name="to"
                      placeholder="Address, airport, hotel, ..."
                      value={formData.to}
                      onChange={handleInputChange}
                      types={["(cities)"]}
                      returnPlaceDetails={true}
                      onSelect={({ prediction, details }) => {
                        setFormData((prev) => ({
                          ...prev,
                          to: (details && details.formatted_address) || (prediction && prediction.description) || prev.to,
                          toPlaceId: prediction?.place_id || prev.toPlaceId,
                          toLat: details && details.geometry && details.geometry.location ? details.geometry.location.lat() : prev.toLat,
                          toLng: details && details.geometry && details.geometry.location ? details.geometry.location.lng() : prev.toLng,
                        }));
                      }}
                    />
                  </div>
                )}

                {tripType === 'by-hour' && (
                  <div className="form-group-inline">
                    <label>
                      <Clock size={20} />
                      Duration
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                      <option value="5">5 hours</option>
                      <option value="6">6 hours</option>
                      <option value="8">8 hours</option>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours (Full day)</option>
                    </select>
                  </div>
                )}

                <div className="form-group-inline">
                  <label>
                    <Calendar size={20} />
                    Date
                  </label>
                  <input 
                    type="date" 
                    name="date"
                    value={formData.date || today}
                    onChange={handleInputChange}
                    min={today}
                    required
                  />
                </div>

                <div className="form-group-inline">
                  <label>
                    <Clock size={20} />
                    Pickup time
                  </label>
                  <input 
                    type="time" 
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <p className="booking-note">
                  Chauffeur will wait 15 minutes free of charge.
                </p>

                <button type="submit" className="search-btn">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* App Section */}
      <section className="app-section section">
        <div className="container">
          <div className="app-content">
            <div className="app-text">
              <h2>Effortless travel at your fingertips</h2>
              <p>Book, track and manage your journey safely on our Rideserene app.</p>
              <div className="app-badges">
                <img src="/images/app-store.svg" alt="Download on App Store" />
                <img src="/images/google-play.svg" alt="Get it on Google Play" />
              </div>
              <div className="qr-code">
                <img src="/images/qr-code.png" alt="QR Code" />
              </div>
            </div>
            <div className="app-image">
              <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80" alt="Blacklane App" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section section">
        <div className="container">
          <h2 className="section-title">Long distance car service, the better way between cities</h2>
          <p style={{ textAlign: "center" }}>
            Whether you're commuting between cities, regional trains, or rail rentals, 
            long-distance journeys are logistically complicated and involve a lot of waiting. 
            Road trips make travel more convenient and also offer unmatched flexibility; 
            they save you time and money whilst keeping you safe.
          </p>

          <div className="benefits-grid">
            <div className="benefit-item">
              <h3>Get the schedule.</h3>
              <p>Your chauffeur lifts parking fees, when you can cancel up until an hour before your ride starts.</p>
            </div>

            <div className="benefit-item">
              <h3>Easy travel from door to door.</h3>
              <p>Travel is stress-free as you can rely on premium chauffeur service; enjoy peace of mind knowing you'll arrive safely at your destination on time, without having to search for parking at the last minute.</p>
            </div>

            <div className="benefit-item">
              <h3>No surprise additional costs.</h3>
              <p>Intercity trips/book easily online and avoid any unpleasant surprises; you pay one amount at checkout covering your entire trip, including tolls and fees, with no extra charge or hidden costs.</p>
            </div>

            <div className="benefit-item">
              <h3>Competitive rates.</h3>
              <p>Prices are set fairly and transparently, you pay less and get more value for your money and overall cost is less compared to typical short distance or taxi rides.</p>
            </div>

            <div className="benefit-item">
              <h3>Multiple pickups.</h3>
              <p>With us long-distance city transfer can be combined with multiple stops at no added cost; when you book a multi-stop trip, we will even arrange a separate chauffeur to take you to your next destination in a vehicle that best suits your group size.</p>
            </div>

            <div className="benefit-item">
              <h3>Flexible travel.</h3>
              <p>Intercity trips allow you to change your plans at the last minute if needed; enjoy the freedom to travel at a moment's notice or to cancel up to an hour before your scheduled time if your plans are adjusted.</p>
            </div>
          </div>

          <div className="route-map">
            <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1200&q=80" alt="City Routes Map" />
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="global-section section">
        <div className="container">
          <h2 className="section-title">Global reach</h2>
          <p className="section-description">
            Rideserene is the leading reliable, professional, safe and punctual 
            door-to-door chauffeured car service. Available in over 50 countries, 
            in more than 300 cities and all global major cities, we offer the 
            highest quality chauffeur service that takes you from location A to B 
            in unmatched comfort.
          </p>
          
          <div className="global-map">
            <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1400&q=80" alt="Global Coverage Map" />
          </div>

          <div className="global-stats">
            <div className="stat-item">
              <p><strong>Check out over 50 cities</strong> Offering city-to-city drives</p>
            </div>
            <div className="stat-item">
              <p><strong>Check out city-to-city routes</strong> That you can take</p>
            </div>
          </div>

          <p className="global-note">
            Explore some of the most famous areas regions in the world with Rideserene 
            intercity transfer service.
          </p>
        </div>
      </section>

      {/* Routes Section */}
      <section className="routes-section section">
        <div className="container">
          <div className="routes-header">
            <h2>City-to-City routes</h2>
          </div>

          <div className="routes-subsection">
            <div className="routes-subheader">
              <h3>Top cities</h3>
              <a href="/search" className="see-all">See all →</a>
            </div>
            <div className="cities-grid">
              {topCities.map((city, index) => (
                <div key={index} className="city-card">
                  <div className="city-image">
                    <img src={city.image} alt={city.name} />
                  </div>
                  <div className="city-info">
                    <h4>{city.name}</h4>
                    <p>{city.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="routes-subsection">
            <div className="routes-subheader">
              <h3>Top routes</h3>
              <a href="/search" className="see-all">See all →</a>
            </div>
            <div className="routes-grid">
              {topRoutes.map((route, index) => (
                <div key={index} className="route-card">
                  <span>{route.from}</span>
                  <span className="route-arrow">→</span>
                  <span>{route.to}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="route-search">
            <p>Have a route in mind?</p>
            <p className="route-search-subtitle">Enter your route and find a chauffeur to drive you there.</p>
            <button className="book-city-btn">Book a City-to-City ride</button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section section">
        <div className="container">
          <div className="faq-content">
            <div className="faq-list">
              <h2>Frequently asked questions</h2>
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <button 
                    className="faq-question"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown 
                      size={20} 
                      className={`faq-icon ${openFaq === index ? 'open' : ''}`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="faq-image">
              <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80" alt="Professional Chauffeur Service" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section section">
        <div className="container">
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="rating">★★★★★</div>
              <h3>"Best car service ever..."</h3>
              <p>To finally be back on service i have really missed and chauffeur. I was really looking forward to pick up out from JFK to Cambridge and it was everything i would highly recommend this service to all!</p>
            </div>
            <div className="testimonial-card">
              <div className="rating">★★★★★</div>
              <h3>"Order is Abu Dhabi"</h3>
              <p>Amazing service lovely Thomas made us feel welcomed and comfortable. Clean car and very professional. We were provided with bottles to Abu Dhabi and Port was. This was our first order and it will not be the last...</p>
            </div>
            <div className="testimonial-card">
              <div className="rating">★★★★★</div>
              <h3>"Truly on the club"</h3>
              <p>The day trip was great. We rode to our event. When inquire, pick-up was from JFK to take and to back home and got to see the sights on the ride up the coast.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section className="download-section section">
        <div className="container">
          <div className="download-content">
            <div className="download-text">
              <h2>Download the app</h2>
              <p>Unlock a seamless experience as we notify you when your chauffeur is on the go or has arrived. Download our user-friendly mobile app to track your journey in real-time on the go - all in the palm of your hand.</p>
              <div className="download-badges">
                <img src="/images/app-store.svg" alt="Download on App Store" />
                <img src="/images/google-play.svg" alt="Get it on Google Play" />
              </div>
            </div>
            <div className="download-image">
              <img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80" alt="Blacklane Mobile App" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CityToCityPage;
