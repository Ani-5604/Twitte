import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from './locales/en.json';
import es from './locales/es.json';
import hi from './locales/hi.json';
import pt from './locales/pt.json';
import fr from './locales/fr.json';
import zh from './locales/zh.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    hi: { translation: hi },
    pt: { translation: pt },
    fr: { translation: fr },
    zh: { translation: zh },
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
