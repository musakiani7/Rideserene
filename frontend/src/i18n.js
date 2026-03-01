import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      requestOptions: {
        cache: 'no-store'
      }
    },
    react: {
      useSuspense: false // Changed to false to prevent white screen
    },
    // Add a longer timeout
    load: 'languageOnly',
    // Preload the default language
    preload: ['en'],
    // Return empty string for missing keys instead of showing key
    returnEmptyString: false,
    returnNull: false,
    saveMissing: false
  }).catch(err => {
    console.error('i18n initialization error:', err);
  });

export default i18n;
