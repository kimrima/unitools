import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import koTranslations from './locales/ko.json';
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import jaTranslations from './locales/ja.json';
import frTranslations from './locales/fr.json';

export const supportedLocales = ['ko', 'en', 'es', 'ja', 'fr'] as const;
export type SupportedLocale = typeof supportedLocales[number];

export const defaultLocale: SupportedLocale = 'en';

export const localeNames: Record<SupportedLocale, string> = {
  ko: '한국어',
  en: 'English',
  es: 'Espanol',
  ja: '日本語',
  fr: 'Francais',
};

const resources = {
  ko: { translation: koTranslations },
  en: { translation: enTranslations },
  es: { translation: esTranslations },
  ja: { translation: jaTranslations },
  fr: { translation: frTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLocale,
    supportedLngs: supportedLocales,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['path', 'navigator', 'htmlTag'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
  });

export function isValidLocale(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}

export function getLocaleFromPath(path: string): SupportedLocale {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && isValidLocale(firstSegment)) {
    return firstSegment;
  }
  
  return defaultLocale;
}

export function getBrowserLocale(): SupportedLocale {
  const browserLang = navigator.language.split('-')[0];
  return isValidLocale(browserLang) ? browserLang : defaultLocale;
}

export default i18n;
