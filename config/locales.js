/**
 * 语言配置 - 与 i18n/config.ts 保持同步
 * 这个文件用于 JavaScript 配置（如 next-sitemap.config.js）
 */

const locales = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ar', 'fr', 'de', 'it', 'es'];
const defaultLocale = 'en';

const localeNames = {
  en: 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  es: 'Español',
};

const rtlLocales = ['ar', 'he'];

module.exports = {
  locales,
  defaultLocale,
  localeNames,
  rtlLocales,
};
