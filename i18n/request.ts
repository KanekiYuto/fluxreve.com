import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * 文件名到键名的映射表
 */
const fileToKeyMap: Record<string, string> = {
  'nano-banana-pro': 'nanoBananaPro',
  'z-image': 'zImage',
  'flux-2-pro': 'flux2Pro',
  'seedream-v45': 'seedreamV45',
};

/**
 * 动态加载指定语言的所有翻译文件
 * @param locale - 语言代码 (en, zh-CN, zh-TW, ja, ko, ar, fr, de, it, es)
 * @returns 该语言的所有翻译消息对象
 */
async function loadMessages(locale: string) {
  // 翻译文件名称列表
  const messageFiles = [
    'admin',
    'ai-generator',
    'auth',
    'common',
    'dashboard',
    'explore',
    'help',
    'home',
    'nano-banana-pro',
    'z-image',
    'flux-2-pro',
    'seedream-v45',
    'task',
    'tasks',
    'notFound',
    'pricing',
    'privacy',
    'quota',
    'settings',
    'share',
    'subscription',
    'terms',
    'subscription-success',
  ];

  // 并行动态导入所有翻译文件
  const messages: Record<string, any> = {};

  try {
    // 使用 Promise.all 并行加载所有翻译文件
    const loadPromises = messageFiles.map(async (file) => {
      try {
        const module = await import(`@/messages/${locale}/${file}.json`);
        // 将文件名转换为驼峰命名
        const key = fileToKeyMap[file] || file;
        return { key, data: module.default };
      } catch (error) {
        console.error(`Failed to load translation file: ${locale}/${file}.json`, error);
        return null;
      }
    });

    const results = await Promise.all(loadPromises);

    // 合并所有成功加载的翻译
    results.forEach((result) => {
      if (result) {
        messages[result.key] = result.data;
      }
    });
  } catch (error) {
    console.error(`Error loading messages for locale: ${locale}`, error);
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
