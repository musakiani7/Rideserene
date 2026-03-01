import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h3 className="footer-logo">RIDESERENE</h3>
            <p className="footer-tagline">{t('footer.tagline')}</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Our Services</h4>
              <Link to="/services/city-to-city">City to City</Link>
              <Link to="/services/airport-transfers">Airport Transfers</Link>
              <Link to="/services/chauffeur-hailing">Chauffeur Hailing</Link>
              <Link to="/services/chauffeur-services">Chauffeur Services</Link>
            </div>
            <div className="footer-column">
              <h4>Our Business</h4>
              <Link to="/business/overview">Overview</Link>
              <Link to="/business/events">Events</Link>
              <Link to="/business/corporate-accounts">Corporate Account</Link>
            </div>
            <div className="footer-column">
              <h4>Explore</h4>
              <Link to="/become-chauffeur">{t('footer.becomeAChauffeur')}</Link>
              <Link to="/chauffeur-login">{t('footer.chauffeurLogin')}</Link>
              <Link to="/login">Customer Login</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2026 RideSerene. All rights reserved. Powered By Unicres Solutions</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
