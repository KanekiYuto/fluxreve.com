import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
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

  // 获取当前请求头以记录访问
  const headersList = await headers();

  // 异步记录访问（不阻塞页面渲染）
  recordTaskView(task.task_id, headersList).catch(error => {
    console.error('Failed to record task view:', error);
  });

  // 任务未完成
  if (task.status !== 'completed' || !task.results || !task.completed_at) {
    return <ProcessingPage />;
  }

  // 提取数据
  const rawPrompt = task.parameters?.prompt || '';
  const model = getModelDisplayName(task.model);
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
              <span aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {task.view_count} {t('views')}
              </span>
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
            taskId={shareId}
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

/**
 * 记录任务访问
 * 异步函数，不阻塞页面渲染
 */
async function recordTaskView(taskId: string, headersList: Awaited<ReturnType<typeof headers>>): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${headersList.get('x-forwarded-proto') || 'https'}://${headersList.get('host')}`;
    const viewUrl = `${baseUrl}/api/ai-generator/tasks/${taskId}/view`;

    // 构建请求头，包含原始请求的信息
    const viewHeaders: Record<string, string> = {
      'User-Agent': headersList.get('user-agent') || '',
    };

    // 传递 IP 相关的 header
    const realIp = headersList.get('x-real-ip');
    if (realIp) {
      viewHeaders['x-real-ip'] = realIp;
    }

    const forwardedFor = headersList.get('x-forwarded-for');
    if (forwardedFor) {
      viewHeaders['x-forwarded-for'] = forwardedFor;
    }

    const cfCountry = headersList.get('cf-ipcountry');
    if (cfCountry) {
      viewHeaders['cf-ipcountry'] = cfCountry;
    }

    await fetch(viewUrl, {
      method: 'POST',
      headers: viewHeaders,
    });
  } catch (error) {
    console.error('Failed to record share view:', error);
  }
}
