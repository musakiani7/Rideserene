import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Plane, Calendar, MapPin, Clock, Shield, ChevronLeft, ChevronRight, CheckCircle, ArrowRight, Info } from 'lucide-react';
import AutocompleteInput from '../components/AutocompleteInput';
import './ChauffeurServicesPage.css';

const ChauffeurServicesPage = () => {
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

  const [currentSlide, setCurrentSlide] = useState({
    business: 0,
    first: 0,
    businessVan: 0
  });

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

  const features = [
    {
      icon: <DollarSign />,
      title: "Competitive rates",
      description: "No hidden fees. Our prices are always fixed. We offer flat-rate for all services prices that are fair to you and our chauffeurs."
    },
    {
      icon: <Plane />,
      title: "Seamless airport travel",
      description: "Professional meet and greet, complimentary wait time and flight tracking."
    },
    {
      icon: <Calendar />,
      title: "Travel on your terms",
      description: "Select the vehicle that suits your schedule. It's quick and easy for you to cancel or make changes to any ride."
    }
  ];

  const vehicleClasses = [
    {
      name: "Business Class",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
      description: "Mercedes E-Class, Audi A6, or similar. 91% or similar",
      features: [
        "Fits up to 3 people",
        "For 2 carry-ons large, or 2 standard check-in, or 3 extra for one checked bags",
        "Available in most of our business districts"
      ]
    },
    {
      name: "First Class",
      image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80",
      description: "Mercedes S-Class, BMW 7 Series, Audi A8 or similar",
      features: [
        "Fits up to 3 people",
        "For 2 carry-ons large, or 2 standard check-in, or 3 extra for one checked bags",
        "Available in most of our business districts"
      ]
    },
    {
      name: "Business Van/SUV",
      image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80",
      description: "Mercedes V-Class or similar",
      features: [
        "Fits up to 5 people",
        "For 4 carry-ons large",
        "Available in select cities"
      ]
    }
  ];

  const nextSlide = (vehicle) => {
    setCurrentSlide({
      ...currentSlide,
      [vehicle]: (currentSlide[vehicle] + 1) % 5
    });
  };

  const prevSlide = (vehicle) => {
    setCurrentSlide({
      ...currentSlide,
      [vehicle]: currentSlide[vehicle] === 0 ? 4 : currentSlide[vehicle] - 1
    });
  };

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="chauffeur-services-page">
      {/* Hero Section with Booking */}
      <section className="cs-hero">
        <div className="cs-hero-content">
          <div className="cs-hero-text">
            <h1>Your Professional Chauffeur Service</h1>
          </div>
          <div className="cs-booking-card">
            <form className="cs-booking-form" onSubmit={handleSearch}>
              <div className="cs-ride-type-cards">
                <button
                  type="button"
                  className={`cs-ride-type-card ${rideType === 'one-way' ? 'active' : ''}`}
                  onClick={() => setRideType('one-way')}
                >
                  <div className="cs-card-content">
                    <ArrowRight size={24} />
                    <span>One way</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`cs-ride-type-card ${rideType === 'by-hour' ? 'active' : ''}`}
                  onClick={() => setRideType('by-hour')}
                >
                  <div className="cs-card-content">
                    <Clock size={24} />
                    <span>By the hour</span>
                  </div>
                </button>
              </div>

              <div className="cs-form-fields">
                <div className="cs-form-group">
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
                  <div className="cs-form-group">
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
                  <div className="cs-form-group">
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

                <div className="cs-form-row">
                  <div className="cs-form-group">
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

                  <div className="cs-form-group">
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

              <div className="cs-info-box">
                <Info size={16} />
                <span>Chauffeur will wait 15 minutes free of charge</span>
              </div>

              <button type="submit" className="cs-search-button">Search</button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="cs-features-section">
        <div className="cs-container">
          <div className="cs-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="cs-feature-card">
                <div className="cs-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Classes Section */}
      <section className="cs-classes-section">
        <div className="cs-container">
          <h2>Discover our service classes</h2>
          <div className="cs-classes-grid">
            {vehicleClasses.map((vehicle, index) => (
              <div key={index} className="cs-class-card">
                <div className="cs-class-carousel">
                  <button 
                    className="cs-carousel-btn prev"
                    onClick={() => prevSlide(vehicle.name.toLowerCase().replace(/\s+/g, '-'))}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="cs-class-image">
                    <img src={vehicle.image} alt={vehicle.name} />
                  </div>
                  <button 
                    className="cs-carousel-btn next"
                    onClick={() => nextSlide(vehicle.name.toLowerCase().replace(/\s+/g, '-'))}
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="cs-carousel-dots">
                    {[0, 1, 2, 3, 4].map((dot) => (
                      <span 
                        key={dot} 
                        className={currentSlide[vehicle.name.toLowerCase().replace(/\s+/g, '-')] === dot ? 'active' : ''}
                      ></span>
                    ))}
                  </div>
                </div>
                <h3>{vehicle.name}</h3>
                <p className="cs-class-description">{vehicle.description}</p>
                <ul className="cs-class-features">
                  {vehicle.features.map((feature, idx) => (
                    <li key={idx}>
                      <CheckCircle size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* World Class Section */}
      <section className="cs-world-section">
        <div className="cs-container">
          <div className="cs-world-content">
            <div className="cs-world-image">
              <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80" alt="World Class Service" />
            </div>
            <div className="cs-world-text">
              <h2>World class chauffeurs going the extra mile</h2>
              <p>
                Every day, our chauffeurs go above and beyond — it's simply in their DNA. It's for those unforgettable experiences that customers such as you continue to use our service time and time again. What makes them so much more than your blue pill rides is the care they put into making every aspect of your travel experience enjoyable. Of course, the comfort of the ride and their polite and respectful manner goes without saying, but their willingness to book a chauffeur ride for yourself your client, or a colleague.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chauffeur Hire Worldwide */}
      <section className="cs-hire-section">
        <div className="cs-container">
          <div className="cs-hire-content">
            <div className="cs-hire-text">
              <h2>Chauffeur hire worldwide</h2>
              <p>
                There's no more comfortable, reliable and stylish way to travel than by Rideserene chauffeur services. Wherever you are, no matter the service. Lifted by a local limousine provider that is dedicated to upholding our high standards and a membership of top-quality drivers in your service. It doesn't matter whether it's an important business meeting that you feel free to ask your totally knowledgeable chauffeur for tips and suggestions on what to see or local special just the right advice. The Rideserene network of chauffeurs in local areas covers different zones across five continents and Asia, so you can select our professional chauffeur service across multiple continents, wherever life happens to take you. Rideserene chauffeurs are meticulous in their dedication to providing first-rate, five-star service — whether for a smooth, stress-free ride.
              </p>
            </div>
            <div className="cs-hire-image">
              <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80" alt="Chauffeur Hire" />
            </div>
          </div>
        </div>
      </section>

      {/* Travel Section */}
      <section className="cs-travel-section">
        <div className="cs-container">
          <div className="cs-travel-content">
            <div className="cs-travel-image">
              <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80" alt="Travel" />
            </div>
            <div className="cs-travel-text">
              <h2>Travel from A to B in your city by private chauffeur</h2>
              <p>
                A stylish Rideserene limousine service is the perfect way to get yourself around a city with the greatest of class, a comfortable and stylish solution for your business travel or a special excursion out. For longer distances, we've got airport transfer service or professional private chauffeur service. For cross traveling in larger groups, we offer a Business Van service the perfect vehicle for traveling with colleagues and enjoying our down-to-down, door-to-door service. Once you book, your chauffeur will be there to meet every mode of transport is required, for which we offer our First Class service.Rideserene fleet of stylish black cars are also available for hourly hire. You decide what you prefer to have approach the best chauffeur service instantly-contact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Airport Section */}
      <section className="cs-airport-section">
        <div className="cs-container">
          <div className="cs-airport-content">
            <div className="cs-airport-text">
              <h2>Professional chauffeur service to and from the airport</h2>
              <p>
                If you've just touched down after a long-haul flight, <strong>Rideserene first airport transfer service</strong> is in some markets for nothing better, no paid large luggage fees, no stress. All you have to do is relax and feel pampered at this difficult start in hand, to allow you to your waiting vehicle. Use our accessible website or sleek smartphone app to simply create an effortless service, and the price you see is the price you pay. You can even book a chauffeur for a luxury service without the luxury prices and we don't believe in hidden fees – honesty and transparency is our policy with every guest. This means that your ride to the airport can be calm and confident, knowing where you're going to be, something of particular consideration to corporate travelers. Book your <strong>professional and private car service</strong> today!
              </p>
            </div>
            <div className="cs-airport-image">
              <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80" alt="Airport Service" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cs-final-cta">
        <div className="cs-container">
          <h2>Experience professional chauffeur service worldwide</h2>
          <p>Book your premium ride in over 50 countries and 100+ cities with professional chauffeurs</p>
          <button type="button" className="cs-cta-button" onClick={() => navigate('/become-chauffeur')}>Book Your Ride Now</button>
        </div>
      </section>
    </div>
  );
};

export default ChauffeurServicesPage;
