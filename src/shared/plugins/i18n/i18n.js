import { createI18n } from 'vue-i18n';

const STORAGE_KEY = 'templateCustomizer--Lang';
const loadedLanguages = new Set();

const getDefaultLocale = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return saved;

  // Idioma por defecto: español
  const defaultLang = 'es';

  // Guardar el idioma por defecto en localStorage
  localStorage.setItem(STORAGE_KEY, defaultLang);

  return defaultLang;
};

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'es',
  messages: {},
  missing: (locale, key) => {
    console.warn(`Missing translation: ${locale}.${key}`);
  }
});

export const loadLanguageAsync = async (lang) => {
  if (!loadedLanguages.has(lang)) {
    const messages = await import(`./locales/${lang}.json`);
    i18n.global.setLocaleMessage(lang, messages.default);
    loadedLanguages.add(lang);
  }

  i18n.global.locale.value = lang;
  localStorage.setItem(STORAGE_KEY, lang);

  return lang;
};

export default i18n;
