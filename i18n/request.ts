import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * 动态加载指定语言的所有翻译文件
 * @param locale - 语言代码 (en, zh-CN, zh-TW, ja)
 * @returns 该语言的所有翻译消息对象
 */
async function loadMessages(locale: string) {
  // 翻译文件名称列表
  const messageFiles = [
    'ai-generator',
    'auth',
    'common',
    'dashboard',
    'help',
    'home',
    'nano-banana-pro',
    'notFound',
    'pricing',
    'privacy',
    'quota',
    'settings',
    'share',
    'subscription',
    'terms',
  ];

  // 动态导入所有翻译文件
  const messages: Record<string, any> = {};

  for (const file of messageFiles) {
    try {
      const module = await import(`@/messages/${locale}/${file}.json`);
      // 将文件名转换为驼峰命名（如 nano-banana-pro -> nanoBananaPro）
      const key = file === 'nano-banana-pro' ? 'nanoBananaPro' : file;
      messages[key] = module.default;
    } catch (error) {
      console.error(`Failed to load translation file: ${locale}/${file}.json`, error);
    }
  }

  return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // 验证语言是否支持，否则使用默认语言
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // 动态加载该语言的所有翻译文件
  const messages = await loadMessages(locale);

  return {
    locale,
    messages,
  };
});
