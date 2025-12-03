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
import ImageCarousel from './components/ImageCarousel';
import ActionButtons from './components/ActionButtons';
import PromptCard from './components/PromptCard';
import InfoCard from './components/InfoCard';
import ProcessingPage from './components/ProcessingPage';

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

  return generatePageMetadata(task, shareId, locale);
}

export default async function SharePage({ params }: PageProps) {
  const { locale, taskId: shareId } = await params;
  const t = await getTranslations({ locale, namespace: 'share.details' });
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
  const prompt = task.parameters?.prompt || '';
  const model = getModelDisplayName(task.model || 'Unknown Model');
  const resolution = task.parameters?.resolution;
  const aspectRatio = task.parameters?.aspect_ratio;
  const siteUrl = getSiteUrl();
  const structuredData = generateStructuredData(task, prompt, model, siteUrl);

  return (
    <>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className="min-h-screen bg-bg py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* 主标题区域 */}
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {prompt}
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
          <section className="bg-surface-secondary rounded-2xl p-4 border border-border/50 mb-8">
            <h2 className="sr-only">{model} {t('generationResults')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：图片轮播 */}
              <div className="lg:col-span-2">
                <h3 className="sr-only">{t('imagePreview')}</h3>
                <ImageCarousel images={task.results} prompt={prompt} />
              </div>

              {/* 右侧：信息区域 */}
              <aside className="lg:col-span-1 flex flex-col justify-between gap-4">
                <div>
                  <h3 className="sr-only">{t('parametersInfo')}</h3>
                  {/* 详细信息网格 */}
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard label={t('aiModel')} value={model} fullWidth />
                    {resolution && <InfoCard label={t('resolution')} value={resolution.toUpperCase()} />}
                    {aspectRatio && <InfoCard label={t('aspectRatio')} value={aspectRatio} />}
                    <PromptCard prompt={prompt} />
                  </div>
                </div>

                {/* 操作按钮 */}
                <ActionButtons
                  shareUrl={`${siteUrl}/v/${task.share_id}`}
                  prompt={prompt}
                  imageUrl={task.results?.[0]?.url}
                  allImages={task.results?.map(img => img.url)}
                />
              </aside>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
