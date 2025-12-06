import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TaskData } from '../types';
import { getModelDisplayName } from '@/config/model-names';
import { siteConfig } from '@/config/site';
import { generateAlternates } from '@/lib/metadata';

/**
 * 生成页面 metadata
 */
export async function generatePageMetadata(task: TaskData, shareId: string, locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'share.metadata' });

  const prompt = task.parameters?.prompt || '';
  const model = getModelDisplayName(task.model);
  const firstImage = task.results?.[0]?.url;

  // 将 locale 转换为 OpenGraph 格式 (zh-CN -> zh_CN)
  const ogLocale = locale.replace('-', '_');

  // 生成备用语言列表（排除当前语言）
  const alternateLocales = siteConfig.locales
    .filter(l => l !== locale)
    .map(l => l.replace('-', '_'));

  // 生成优化的标题（确保不超过 60 字符）
  // 注意: layout.tsx 的 template 会自动添加 " | FluxReve", 需要预留这部分长度
  const maxTitleLength = 60;
  const templateSuffix = ` | ${siteConfig.name}`; // " | FluxReve"
  const modelPrefix = `${model} - `;
  const availableLength = maxTitleLength - modelPrefix.length - templateSuffix.length;
  const truncatedPrompt = prompt.length > availableLength
    ? `${prompt.substring(0, availableLength - 3)}...`
    : prompt;
  const title = `${modelPrefix}${truncatedPrompt}`;

  // 生成优化的描述（120-160 字符最佳）
  const descriptionPrefix = t('descriptionPrefix', { model });
  const maxDescriptionLength = 160;
  const availableDescLength = maxDescriptionLength - descriptionPrefix.length;
  const truncatedDescPrompt = prompt.length > availableDescLength
    ? `${prompt.substring(0, availableDescLength - 3)}...`
    : prompt;
  const description = `${descriptionPrefix}${truncatedDescPrompt}`;

  // 使用统一的 alternates 生成函数
  const alternates = generateAlternates(locale, `/t/${shareId}`);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title: truncatedPrompt,
      description: `${t('ogDescriptionPrefix', { model })}${prompt.substring(0, 80)}`,
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
      description: `${t('ogDescriptionPrefix', { model })}${prompt.substring(0, 80)}`,
      images: firstImage ? [firstImage] : [],
    },
  };
}
