import { useTranslation } from 'react-i18next';
import Services from '../components/Services';
import './ServicesPage.css';

const ServicesPage = () => {
  const { t } = useTranslation();

  return (
    <main className="services-page">
      <div className="services-page-header">
        <h1>{t('header.ourServices')}</h1>
        <p>{t('footer.tagline')}</p>
      </div>
      <Services />
    </main>
  );
};

export default ServicesPage;
