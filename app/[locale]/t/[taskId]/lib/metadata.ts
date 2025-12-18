import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TaskData } from '../types';
import { getModelDisplayName } from '@/config/model-names';
import { siteConfig } from '@/config/site';
import { generateAlternates } from '@/lib/metadata';

// SEO 最佳实践常量
const SEO_LIMITS = {
  TITLE_MAX: 60,
  DESCRIPTION_MAX: 160,
  OG_DESCRIPTION_MAX: 80,
} as const;

/**
 * 截断文本，超出长度时添加省略号
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * 将语言代码转换为 OpenGraph 格式
 * @example 'zh-CN' -> 'zh_CN'
 */
function toOpenGraphLocale(locale: string): string {
  return locale.replace('-', '_');
}

/**
 * 生成备用语言列表（排除当前语言）
 */
function getAlternateLocales(currentLocale: string): string[] {
  return siteConfig.locales
    .filter(locale => locale !== currentLocale)
    .map(toOpenGraphLocale);
}

/**
 * 生成页面标题
 * 注意: layout.tsx 的 template 会自动添加 " | FluxReve"
 */
function generateTitle(prompt: string, model: string): string {
  const templateSuffix = ` | ${siteConfig.name}`;
  const modelPrefix = `${model} - `;
  const availableLength = SEO_LIMITS.TITLE_MAX - modelPrefix.length - templateSuffix.length;

  const truncatedPrompt = truncateText(prompt, availableLength);
  return `${modelPrefix}${truncatedPrompt}`;
}

/**
 * 生成页面描述
 */
function generateDescription(prompt: string, descriptionPrefix: string): string {
  const availableLength = SEO_LIMITS.DESCRIPTION_MAX - descriptionPrefix.length;
  const truncatedPrompt = truncateText(prompt, availableLength);
  return `${descriptionPrefix}${truncatedPrompt}`;
}

/**
 * 生成 OpenGraph 描述
 */
function generateOgDescription(prompt: string, ogPrefix: string): string {
  const truncatedPrompt = truncateText(prompt, SEO_LIMITS.OG_DESCRIPTION_MAX);
  return `${ogPrefix}${truncatedPrompt}`;
}

/**
 * 生成图片 metadata
 */
function generateImageMetadata(imageUrl: string | undefined, alt: string) {
  if (!imageUrl) return [];

  return [{
    url: imageUrl,
    width: 1024,
    height: 1024,
    alt,
  }];
}

/**
 * 生成页面 metadata
 */
export async function generatePageMetadata(
  task: TaskData,
  shareId: string,
  locale: string
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'share.metadata' });

  // 提取基础数据
  const prompt = task.parameters?.prompt || '';
  const model = getModelDisplayName(task.model);
  const firstImage = task.results?.[0]?.url;

  // 生成标题和描述
  const title = generateTitle(prompt, model);
  const description = generateDescription(prompt, t('descriptionPrefix', { model }));
  const ogDescription = generateOgDescription(prompt, t('ogDescriptionPrefix', { model }));
  const truncatedPrompt = truncateText(prompt, SEO_LIMITS.TITLE_MAX);

  // 生成 alternates
  const alternates = generateAlternates(locale, `/t/${shareId}`);

  // 生成 locale 相关数据
  const ogLocale = toOpenGraphLocale(locale);
  const alternateLocales = getAlternateLocales(locale);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title: truncatedPrompt,
      description: ogDescription,
      url: alternates.canonical,
      images: generateImageMetadata(firstImage, prompt),
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
      description: ogDescription,
      images: firstImage ? [firstImage] : [],
    },
  };
}
