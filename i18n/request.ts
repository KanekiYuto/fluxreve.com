import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// 静态导入所有语言的所有消息文件
import enAiGenerator from '@/messages/en/ai-generator.json';
import enAuth from '@/messages/en/auth.json';
import enCommon from '@/messages/en/common.json';
import enDashboard from '@/messages/en/dashboard.json';
import enHelp from '@/messages/en/help.json';
import enHome from '@/messages/en/home.json';
import enNanoBananaPro from '@/messages/en/nano-banana-pro.json';
import enNotFound from '@/messages/en/notFound.json';
import enPricing from '@/messages/en/pricing.json';
import enPrivacy from '@/messages/en/privacy.json';
import enQuota from '@/messages/en/quota.json';
import enSettings from '@/messages/en/settings.json';
import enShare from '@/messages/en/share.json';
import enSubscription from '@/messages/en/subscription.json';
import enTerms from '@/messages/en/terms.json';

import zhTWAiGenerator from '@/messages/zh-TW/ai-generator.json';
import zhTWAuth from '@/messages/zh-TW/auth.json';
import zhTWCommon from '@/messages/zh-TW/common.json';
import zhTWDashboard from '@/messages/zh-TW/dashboard.json';
import zhTWHelp from '@/messages/zh-TW/help.json';
import zhTWHome from '@/messages/zh-TW/home.json';
import zhTWNanoBananaPro from '@/messages/zh-TW/nano-banana-pro.json';
import zhTWNotFound from '@/messages/zh-TW/notFound.json';
import zhTWPricing from '@/messages/zh-TW/pricing.json';
import zhTWPrivacy from '@/messages/zh-TW/privacy.json';
import zhTWQuota from '@/messages/zh-TW/quota.json';
import zhTWSettings from '@/messages/zh-TW/settings.json';
import zhTWShare from '@/messages/zh-TW/share.json';
import zhTWSubscription from '@/messages/zh-TW/subscription.json';
import zhTWTerms from '@/messages/zh-TW/terms.json';

// 组织所有消息
const allMessages = {
  en: {
    'ai-generator': enAiGenerator,
    auth: enAuth,
    common: enCommon,
    dashboard: enDashboard,
    help: enHelp,
    home: enHome,
    nanoBananaPro: enNanoBananaPro,
    notFound: enNotFound,
    pricing: enPricing,
    privacy: enPrivacy,
    quota: enQuota,
    settings: enSettings,
    share: enShare,
    subscription: enSubscription,
    terms: enTerms,
  },
  'zh-TW': {
    'ai-generator': zhTWAiGenerator,
    auth: zhTWAuth,
    common: zhTWCommon,
    dashboard: zhTWDashboard,
    help: zhTWHelp,
    home: zhTWHome,
    nanoBananaPro: zhTWNanoBananaPro,
    notFound: zhTWNotFound,
    pricing: zhTWPricing,
    privacy: zhTWPrivacy,
    quota: zhTWQuota,
    settings: zhTWSettings,
    share: zhTWShare,
    subscription: zhTWSubscription,
    terms: zhTWTerms,
  },
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // 使用静态导入的消息
  const messages = allMessages[locale as keyof typeof allMessages];

  return {
    locale,
    messages,
  };
});
