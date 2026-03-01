import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Plane, Globe, Calendar, Clock, Users, ChevronDown, ChevronLeft, ChevronRight, Shield, MapPin, ArrowRight, Info } from 'lucide-react';
import AutocompleteInput from '../components/AutocompleteInput';
import './AirportTransferPage.css';

const AirportTransferPage = () => {
  const navigate = useNavigate();
  const [rideType, setRideType] = useState('one-way');
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const serviceClasses = [
    {
      name: 'Business Van',
      description: 'Mercedes V-Class, Volkswagen Caravelle Excecutive, Toyota Alphard, or similar',
      passengers: 'Fits up to 5 people',
      features: [
        'Plus 15 min/10 miles free if standard check-up on 1 extra large size or more',
        'Book for larger parties, lots of luggage, or families'
      ],
      image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80'
    },
    {
      name: 'Electric Class',
      description: 'Audi e-tron, Tesla Model X, Tesla Model S, or similar',
      passengers: 'Fits up to 3 people',
      features: [
        'Plus 45 min/30 miles free if standard check-up on 1 extra large size or more',
        'Available in more of our business districts'
      ],
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80'
    }
  ];

  const features = [
    {
      icon: <DollarSign size={32} />,
      title: 'Competitive rates',
      description: 'Access premium service at distance-based prices that are fair to you and our chauffeurs.'
    },
    {
      icon: <Plane size={32} />,
      title: 'Seamless airport travel',
      description: 'Relax with 1 hour of complimentary wait time and flight tracking.'
    },
    {
      icon: <Globe size={32} />,
      title: 'Travel on your terms',
      description: 'Stay flexible and in charge of your travel schedule. It\'s quick and easy for you to cancel our service changes to stay vital.'
    }
  ];

  const faqs = [
    {
      question: 'What does an airport transfer do?',
      answer: 'An airport transfer provides door-to-door transportation between the airport and your destination. Our professional chauffeurs track your flight and adjust pickup times accordingly.'
    },
    {
      question: 'Is a month booking an airport transfer?',
      answer: 'Yes, you can book airport transfers up to a month in advance through our platform. We recommend booking as early as possible to ensure availability.'
    },
    {
      question: 'What is a pool airport transfer?',
      answer: 'A pool airport transfer is a shared ride service where multiple passengers traveling to similar destinations share the same vehicle, reducing costs while maintaining quality service.'
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % serviceClasses.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + serviceClasses.length) % serviceClasses.length);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.from) {
      alert('Please enter a pickup location (From).');
      return;
    }
    if (rideType === 'one-way' && !formData.to) {
      alert('Please enter a destination (To).');
      return;
    }

    // Build query string
    const params = new URLSearchParams();
    params.set('rideType', rideType);
    params.set('from', formData.from);
    if (rideType === 'one-way') params.set('to', formData.to);
    if (formData.date) params.set('date', formData.date);
    if (formData.time) params.set('time', formData.time);
    if (rideType === 'by-hour') params.set('duration', formData.duration);

    navigate(`/search?${params.toString()}`);
  };

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="airport-transfer-page">
      {/* Hero Section with Booking Form */}
      <section className="hero-section-airport">
        <div className="hero-overlay"></div>
        <div className="hero-content-airport">
          <div className="hero-text-airport">
            <h1 className="hero-title-airport">Airport Transfer Service Worldwide</h1>
          </div>
          
          {/* Booking Form */}
          <div className="booking-form-card-airport">
                <form className="booking-form-airport" onSubmit={handleSearch}>
                  <div className="ride-type-cards-airport">
                    <button
                      type="button"
                      className={`ride-type-card-airport ${rideType === 'one-way' ? 'active' : ''}`}
                      onClick={() => setRideType('one-way')}
                    >
                      <div className="card-content-airport">
                        <ArrowRight size={24} />
                        <span>One way</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`ride-type-card-airport ${rideType === 'by-hour' ? 'active' : ''}`}
                      onClick={() => setRideType('by-hour')}
                    >
                      <div className="card-content-airport">
                        <Clock size={24} />
                        <span>By the hour</span>
                      </div>
                    </button>
                  </div>

                  <div className="form-fields-airport">
                    <div className="form-group-airport">
                      <label htmlFor="from">
                        <MapPin size={18} />
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

                    {rideType === 'one-way' && (
                      <div className="form-group-airport">
                        <label htmlFor="to">
                          <MapPin size={18} />
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

                    {rideType === 'by-hour' && (
                      <div className="form-group-airport">
                        <label htmlFor="duration">
                          <Clock size={18} />
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

                    <div className="form-row-airport">
                      <div className="form-group-airport">
                        <label htmlFor="date">
                          <Calendar size={18} />
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData.date || today}
                          onChange={handleInputChange}
                          min={today}
                          required
                        />
                      </div>

                      <div className="form-group-airport">
                        <label htmlFor="time">
                          <Clock size={18} />
                          Pickup time
                        </label>
                        <input
                          type="time"
                          id="time"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-info-airport">
                    <Info size={16} />
                    <span>1 hour free wait time included with flight tracking</span>
                  </div>

                  <button type="submit" className="btn btn-primary search-btn-airport">
                    Search
                  </button>
                </form>
              </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-airport-section section">
        <div className="container">
          <div className="features-airport-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-airport-card">
                <div className="feature-airport-icon">{feature.icon}</div>
                <h3 className="feature-airport-title">{feature.title}</h3>
                <p className="feature-airport-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Classes Section */}
      <section className="service-classes-section section">
        <div className="container">
          <h2 className="section-title">Discover our service classes</h2>
          
          <div className="service-carousel">
            <button className="carousel-btn prev" onClick={prevSlide}>
              <ChevronLeft size={24} />
            </button>
            
            <div className="service-slides">
              {serviceClasses.map((service, index) => (
                <div 
                  key={index} 
                  className={`service-slide ${index === currentSlide ? 'active' : ''}`}
                >
                  <div className="service-image">
                    <img src={service.image} alt={service.name} />
                  </div>
                  <div className="service-details">
                    <h3>{service.name}</h3>
                    <p className="service-description">{service.description}</p>
                    <p className="service-passengers">✓ {service.passengers}</p>
                    <ul className="service-features">
                      {service.features.map((feature, idx) => (
                        <li key={idx}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="carousel-btn next" onClick={nextSlide}>
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="carousel-dots">
            {serviceClasses.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Airport Transfer in Global Cities */}
      <section className="global-cities-section section">
        <div className="container">
          <div className="global-cities-content">
            <div className="global-cities-text">
              <h2>Airport transfer in global cities</h2>
              <p>
                Experience your Rideserene in cities worldwide. Rely on a safe and professional 
                airport transfer in over 600 cities across the globe with Rideserene: punctual 
                arrivals, reliable and luxurious vehicles, and helpful customer support are 
                hallmarks of the experience. Our chauffeurs stay on top of the details of your 
                flight, so they can be ready to collect you after a delay or to find some extra 
                time if you land ahead of schedule. Whether you use public transport maps in 
                Shanghai with local connections. Rideserene offers a service that will take you 
                to your destination directly, from the airport, no matter your destination, 
                and regardless of the time of day. We offer transfers available at any airport 
                in any delivery schedule as you control. They've hand-picked and locally 
                researched globally, so that no matter where you go you will always be driven 
                as safely as possible.
              </p>
            </div>
            <div className="global-cities-image">
              <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80" alt="Business Travelers" />
            </div>
          </div>
        </div>
      </section>

      {/* Get to or from Airport Section */}
      <section className="get-to-airport-section section">
        <div className="container">
          <div className="get-to-airport-content">
            <div className="get-to-airport-image">
              <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80" alt="Airport Transfer" />
            </div>
            <div className="get-to-airport-text">
              <h2>Get to or from the airport</h2>
              <p>
                Discover why our acclaimed airport service offers the very highest possible 
                standards for all passengers. Whether you're stepping out of LAX or Guarulhos 
                airport into the heart of the city, the arrival of a Rideserene chauffeur is 
                the start of an exceptional customer experience. We offer convenient and 
                comfortable door-to-door travel, plus the flexibility to book with multiple 
                stops enroute to your hotel with family or colleagues if Rideserene Business. 
                You can be chauffeured by to-class people, together with guests at every lab 
                arrival and departure point worldwide. Punctuality, class, and comfort—to 
                experience of light and comfort - a great idea for special occasions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Airport Shuttle Booking Section */}
      <section className="shuttle-booking-section section">
        <div className="container">
          <div className="shuttle-booking-content">
            <div className="shuttle-booking-text">
              <h2>Airport shuttle booking</h2>
              <p>
                Booking a Rideserene is incredibly simple just tap the app, or a few seconds 
                on our website. We believe that travel should be as painless as possible, and 
                so shouldn't Rideserene searches, or use the smartphone app to bypass anti 
                rental desks. The necessary documents will provide this on the website and 
                there's even a step-by-step guide. Our prices are fair and transparent; what 
                you see includes the calculated fare and payment details, you will receive an 
                email of confirmation along your electronically. Rideserene picks itself on 
                transparency; which means you know in advance of your journey precisely where 
                your chauffeur will be to the place you stay it great way to kick off your 
                journey.
              </p>
            </div>
            <div className="shuttle-booking-image">
              <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80" alt="Chauffeur Service" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-airport-section section">
        <div className="container">
          <div className="faq-airport-content">
            <div className="faq-airport-list">
              <h2>Frequently Asked Questions</h2>
              {faqs.map((faq, index) => (
                <div key={index} className="faq-airport-item">
                  <button 
                    className="faq-airport-question"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown 
                      size={20} 
                      className={`faq-airport-icon ${openFaq === index ? 'open' : ''}`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="faq-airport-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="faq-airport-image">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" alt="Airport Transfer FAQ" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AirportTransferPage;
