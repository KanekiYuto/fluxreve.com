/**
 * 语言配置 - 需要与 config/locales.js 保持同步
 */
export const locales = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ar', 'fr', 'de', 'it', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
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

// RTL 语言列表
export const rtlLocales = ['ar', 'he'] as const;
