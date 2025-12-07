import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { format } from 'date-fns';
import { getTranslations } from 'next-intl/server';
import { getModelDisplayName } from '@/config/model-names';
import { getSiteUrl } from '@/lib/urls';
import { fetchTaskData } from './lib/api';
import { generatePageMetadata } from './lib/metadata';
import { generateStructuredData } from './lib/utils';
import { PageProps } from './types/index';
import ProcessingPage from './components/ProcessingPage';
import ShareContent from './components/ShareContent';

// 强制动态渲染，确保 notFound() 返回真正的 404 状态码
export const dynamic = 'force-dynamic';

/**
 * 生成页面 metadata
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, taskId: shareId } = await params;
  const task = await fetchTaskData(shareId);

  // 任务不存在
  if (!task) {
    const t = await getTranslations({ locale, namespace: 'share.notFound' });
    return {
      title: t('title'),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // 任务未完成，不让搜索引擎收录
  if (task.status !== 'completed' || !task.results || !task.completed_at) {
    const t = await getTranslations({ locale, namespace: 'share.processing' });
    return {
      title: t('title'),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // NSFW 内容禁止搜索引擎索引
  if (task.is_nsfw) {
    const t = await getTranslations({ locale, namespace: 'share.nsfw' });
    return {
      title: t('imageAlt'),
      robots: {
        index: false,
        follow: false,
        noarchive: true,
        noimageindex: true,
      },
    };
  }

  return await generatePageMetadata(task, shareId, locale);
}

export default async function SharePage({ params }: PageProps) {
  const { locale, taskId: shareId } = await params;
  const t = await getTranslations({ locale, namespace: 'share.details' });
  const tNsfw = await getTranslations({ locale, namespace: 'share.nsfw' });
  const task = await fetchTaskData(shareId);

  // 任务不存在，返回 404
  if (!task) {
    notFound();
  }

  // 任务未完成
  if (task.status !== 'completed' || !task.results || !task.completed_at) {
    return <ProcessingPage />;
  }

  // 提取数据
  const rawPrompt = task.parameters?.prompt || '';
  const model = getModelDisplayName(task.model || 'Unknown Model');
  const resolution = task.parameters?.resolution;
  const aspectRatio = task.parameters?.aspect_ratio;
  const siteUrl = getSiteUrl();
  
  // NSFW 内容使用通用描述，避免敏感提示词被 SEO 收录
  const isNsfw = task.is_nsfw;
  const displayPrompt = isNsfw ? tNsfw('imageAlt') : rawPrompt;
  
  // NSFW 内容不生成结构化数据
  const structuredData = isNsfw ? null : generateStructuredData(task, rawPrompt, model, siteUrl);

  return (
    <>
      {/* 结构化数据（NSFW 内容不生成） */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      <article className="min-h-screen bg-bg py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* 主标题区域 */}
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 line-clamp-3">
              {displayPrompt}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                {model}
              </span>
              <span aria-hidden="true">•</span>
              <time dateTime={task.completed_at}>
                {format(new Date(task.completed_at), 'yyyy-MM-dd HH:mm')}
              </time>
            </div>
          </header>

          {/* 主内容区域：图片和信息左右布局 */}
          <ShareContent
            images={task.results || []}
            rawPrompt={rawPrompt}
            displayPrompt={displayPrompt}
            isNsfw={isNsfw}
            model={model}
            resolution={resolution}
            aspectRatio={aspectRatio}
            shareUrl={`${siteUrl}/t/${task.share_id}`}
            parameters={task.parameters}
            labels={{
              aiModel: t('aiModel'),
              resolution: t('resolution'),
              aspectRatio: t('aspectRatio'),
              generationResults: t('generationResults'),
              imagePreview: t('imagePreview'),
              parametersInfo: t('parametersInfo'),
            }}
          />
        </div>
      </article>
    </>
  );
}
