import { Link } from 'react-router-dom';
import { Car, Clock, Plane, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Services.css';

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      id: 1,
      icon: <MapPin size={32} />,
      title: t('Hourly and full day hire'),
      description: t('For by-the-hour bookings or daily chauffeur hire, choose one of our tailored services for total flexibility, reliability and comfort.'),
      link: '/services/city-to-city'
    },
    {
      id: 2,
      icon: <Car size={32} />,
      title: t('City-to-city rides'),
      description: t('Your stress-free solution for long-distance rides with professional chauffeurs across the globe.'),
      link: '/services/chauffeur-hailing',
      
    },
    {
      id: 3,
      icon: <Plane size={32} />,
      title: t('Airport transfers'),
      description: t('With additional wait time and flight tracking in case of delays, our service is optimized to make every airport transfer a breeze.'),
      link: '/services/airport-transfers'
    },
    {
      id: 4,
      icon: <Clock size={32} />,
      title: t('Chauffeur hailing'),
      description: t('Enjoy the quality of a traditional chauffeur, with the convenience of riding within minutes of booking.'),
      link: '/services/hourly-hire'
    }
  ];

  return (
    <section className="services section">
      <div className="container">
        <h2 className="section-title">{t('Services')}</h2>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <div className="service-header">
                <h3 className="service-title">
                  {service.title}
                  {service.badge && <span className="badge">{service.badge}</span>}
                </h3>
              </div>
              <p className="service-description">{service.description}</p>
              <Link to={service.link} className="service-link">
                Learn More →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

