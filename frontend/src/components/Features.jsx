import { Shield, Car, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Features.css';

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Shield size={40} />,
      title: t('Safety first'),
      description: t('Travel confidently knowing your safety is our top priority. We handle every detail with care to make sure your journey is nothing short of exceptional')
    },
    {
      icon: <Car size={40} />,
      title: t('Private travel solutions'),
      description: t('Discover your one-stop travel shop: long-distance rides, one way or return, by the hour, airport transfers, and more.')
    },
    {
      icon: <Leaf size={40} />,
      title: t('Sustainable travel'),
      description: t('Breathe easy knowing all ride emissions are offset, as part of our global carbon offset program — the industry’s first.')
    }
  ];

  return (
    <section className="features section">
      <div className="container">
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

