import { Metadata } from 'next';
import { TaskData } from '../types';
import { getModelDisplayName } from '@/config/model-names';
import { siteConfig } from '@/config/site';
import { generateAlternates } from '@/lib/metadata';

/**
 * 生成页面 metadata
 */
export function generatePageMetadata(task: TaskData, shareId: string, locale: string): Metadata {
  const prompt = task.parameters?.prompt || 'AI Generated Image';
  const model = getModelDisplayName(task.model || 'Unknown Model');
  const firstImage = task.results?.[0]?.url;

  // 将 locale 转换为 OpenGraph 格式 (zh-CN -> zh_CN)
  const ogLocale = locale.replace('-', '_');

  // 生成备用语言列表（排除当前语言）
  const alternateLocales = siteConfig.locales
    .filter(l => l !== locale)
    .map(l => l.replace('-', '_'));

  // 生成优化的标题（确保不超过 60 字符）
  const maxTitleLength = 60;
  const suffix = ` | ${siteConfig.name}`;
  const modelPrefix = `${model} - `;
  const availableLength = maxTitleLength - suffix.length - modelPrefix.length;
  const truncatedPrompt = prompt.length > availableLength
    ? `${prompt.substring(0, availableLength - 3)}...`
    : prompt;
  const title = `${modelPrefix}${truncatedPrompt}${suffix}`;

  // 生成优化的描述（120-160 字符最佳）
  const description = `使用 ${model} AI 模型生成的高质量图片。${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`;

  // 使用统一的 alternates 生成函数
  const alternates = generateAlternates(locale, `/v/${shareId}`);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title: truncatedPrompt,
      description: `${model} AI 生成 | ${prompt.substring(0, 80)}`,
      url: alternates.canonical,
      images: firstImage ? [
        {
          url: firstImage,
          width: 1024,
          height: 1024,
          alt: prompt,
        },
      ] : [],
      type: siteConfig.openGraph.type,
      siteName: siteConfig.openGraph.siteName,
      locale: ogLocale,
      alternateLocale: alternateLocales,
    },
    twitter: {
      card: siteConfig.twitter.card,
      site: siteConfig.twitter.site,
      creator: siteConfig.twitter.creator,
      title: truncatedPrompt,
      description: `${model} AI 生成 | ${prompt.substring(0, 80)}`,
      images: firstImage ? [firstImage] : [],
    },
  };
}
