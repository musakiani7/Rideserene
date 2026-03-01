import { Smartphone, Car, Clock, Shield, DollarSign } from 'lucide-react';
import './ChauffeurHailingPage.css';

const ChauffeurHailingPage = () => {
  const features = [
    {
      icon: <Smartphone size={32} />,
      title: 'Convenience',
      description: 'Get a door-to-door chauffeured ride, right when you need with just a few taps in the Ride Serene Website.'
    },
    {
      icon: <Car size={32} />,
      title: 'Comfort',
      description: 'A private ride in a top-of-the-line vehicle makes every journey a pleasure, not just a means to an end.'
    },
    {
      icon: <Shield size={32} />,
      title: 'Quality',
      description: 'Making your experience excellent is our top priority. Enjoy the matchless service you deserve for all your travels.'
    },
    {
      icon: <Clock size={32} />,
      title: 'Your schedule, your pace',
      description: 'Depart when it suits you: no need to work around flight, flight, or rental car times. Plus, free cancellation up until 1 hour before your ride.'
    },
    {
      icon: <Shield size={32} />,
      title: 'Reliability',
      description: 'Book with certainty, then stay in the know with real-time ride status updates and chauffeur location tracking.'
    },
    {
      icon: <DollarSign size={32} />,
      title: 'Competitive rates',
      description: 'Access premium service at distance-based prices that are fair to you and our chauffeurs.'
    }
  ];

  return (
    <div className="chauffeur-hailing-page">
      {/* Hero Section */}
      <section className="hero-section-hailing">
        <div className="hero-overlay"></div>
        <div className="hero-content-hailing">
          <div className="container">
            <div className="hero-text-hailing">
              <h1 className="hero-title-hailing">Say hello to Chauffeur Hailing™!</h1>
              <button className="cta-btn-hero">Get the app</button>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="app-download-section section">
        <div className="container">
          <div className="app-download-content">
            <div className="app-download-text">
              <h2>Professional chauffeurs at your fingertips</h2>
              <p>Download the Rideserene® Chauffeur Hailing™ app to hail chauffeurs on demand across globe.</p>
              <div className="qr-badges-container">
                <div className="qr-code-box">
                  <img src="https://images.unsplash.com/photo-1618060932014-4deda4932554?w=400&q=80" alt="QR Code" />
                </div>
                <div className="app-badges-box">
                  <img src="/images/app-store.svg" alt="Download on App Store" />
                  <img src="/images/google-play.svg" alt="Get it on Google Play" />
                </div>
              </div>
            </div>
            <div className="app-download-image">
              <img src="https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80" alt="Chauffeur Hailing App" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-hailing">{feature.icon}</div>
                <h3 className="feature-title-hailing">{feature.title}</h3>
                <p className="feature-description-hailing">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* On-Demand Rides Section */}
      <section className="on-demand-section section">
        <div className="container">
          <div className="on-demand-content">
            <div className="on-demand-image">
              <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80" alt="Professional Chauffeur Service" />
            </div>
            <div className="on-demand-text">
              <h2>Convenient on-demand rides within minutes</h2>
              <p>
                When you need a safe way to get around the city, think Rideserene Chauffeur 
                Hailing™. You can book the top-of-the-line service you know and love, for 
                immediate pickup in cities listed below. The perfect combination of 
                traditional chauffeur service and ride-hailing, chauffeurs are available in 
                the new version of the Rideserene app® for iOS and Android.
              </p>
              <button className="cta-btn">Get the app</button>
            </div>
          </div>
        </div>
      </section>

      {/* Download App Bottom Section */}
      <section className="download-bottom-section section">
        <div className="container">
          <div className="download-bottom-content">
            <div className="download-bottom-text">
              <h2>Download the app</h2>
              <p>
                Book our Chauffeur Hailing™ service for safe rides around the city.
              </p>
              <div className="download-badges">
                <img src="/images/app-store.svg" alt="Download on App Store" />
                <img src="/images/google-play.svg" alt="Get it on Google Play" />
              </div>
            </div>
            <div className="download-bottom-image">
              <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80" alt="Mobile Apps" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChauffeurHailingPage;
