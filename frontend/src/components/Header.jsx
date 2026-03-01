import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { t } = useTranslation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  // Close mobile menu on route change / link click (handled by closeMenu on each Link)
  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => document.body.classList.remove('mobile-menu-open');
  }, [isMenuOpen]);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-text">RIDESERENE</span>
          </Link>
          <p className="tagline">The premium chauffeur marketplace</p>
        </div>

        {/* Mobile overlay: tap outside to close menu */}
        {isMenuOpen && (
          <div className="nav-overlay" onClick={closeMenu} aria-hidden="true" />
        )}

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <div className="nav-item">
            <button 
              className="nav-link" 
              onClick={() => toggleDropdown('services')}
            >
              {t('header.ourServices')} <ChevronDown size={16} className={activeDropdown === 'services' ? 'chevron-up' : ''} />
            </button>
            {activeDropdown === 'services' && (
              <div className="dropdown">
                <Link to="/services/city-to-city" onClick={closeMenu}>{t('services.cityToCity')}</Link>
                <Link to="/services/chauffeur-hailing" onClick={closeMenu}>{t('services.chauffeurHailing')}</Link>
                <Link to="/services/airport-transfers" onClick={closeMenu}>{t('services.airportTransfers')}</Link>
                <Link to="/services/hourly-hire" onClick={closeMenu}>{t('services.hourlyHire')}</Link>
                <Link to="/services/chauffeur-services" onClick={closeMenu}>{t('services.chauffeurServices')}</Link>
                <Link to="/services/limousine-services" onClick={closeMenu}>{t('services.limousineServices')}</Link>
              </div>
            )}
          </div>

          <div className="nav-item">
            <button 
              className="nav-link"
              onClick={() => toggleDropdown('business')}
            >
              {t('header.forBusiness')} <ChevronDown size={16} className={activeDropdown === 'business' ? 'chevron-up' : ''} />
            </button>
            {activeDropdown === 'business' && (
              <div className="dropdown">
                <Link to="/business/overview" onClick={closeMenu}>{t('businessMenu.overview')}</Link>
                <Link to="/business/corporate-accounts" onClick={closeMenu}>{t('businessMenu.corporations')}</Link>
                <Link to="/business/travel-agencies" onClick={closeMenu}>{t('businessMenu.travelAgencies')}</Link>
                <Link to="/business/strategic-partnerships" onClick={closeMenu}>{t('businessMenu.strategicPartnerships')}</Link>
                <Link to="/business/events" onClick={closeMenu}>{t('businessMenu.events')}</Link>
              </div>
            )}
          </div>

          <div className="nav-item">
            <button 
              className="nav-link"
              onClick={() => toggleDropdown('chauffeurs')}
            >
              {t('header.forChauffeurs')} <ChevronDown size={16} className={activeDropdown === 'chauffeurs' ? 'chevron-up' : ''} />
            </button>
            {activeDropdown === 'chauffeurs' && (
              <div className="dropdown">
                <Link to="/become-chauffeur" onClick={closeMenu}>{t('footer.becomeAChauffeur')}</Link>
                <Link to="/chauffeur-login" onClick={closeMenu}>{t('footer.chauffeurLogin')}</Link>
              </div>
            )}
          </div>

          <Link to="/login" className="btn btn-outline sign-in-btn" onClick={closeMenu}>
            <User size={18} />
            {t('header.signIn')}
          </Link>
        </nav>

        <button 
          type="button"
          className="mobile-menu-toggle" 
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
};

export default Header;

