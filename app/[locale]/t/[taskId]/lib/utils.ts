import { TaskData } from '../types';
import { siteConfig } from '@/config/site';

/**
 * 生成 Schema.org 结构化数据
 */
export function generateStructuredData(task: TaskData, prompt: string, model: string, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: prompt,
    description: `AI generated images using ${model}`,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteUrl,
    },
    dateCreated: task.created_at,
    image: task.results?.map((result) => ({
      '@type': 'ImageObject',
      contentUrl: result.url,
      description: prompt,
      creator: {
        '@type': 'SoftwareApplication',
        name: model,
      },
    })) || [],
  };
}
