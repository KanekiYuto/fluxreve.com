'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Share2, Download } from 'lucide-react';
import { downloadImage, downloadImages } from '@/lib/download';
import { getTaskDuration, formatDuration } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ShareToX from '@/components/ui/share-to-x';

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio';
}

export interface TaskInfo {
  task_id?: string;
  prompt: string;
  created_at: string;
  started_at?: string;
  completed_at: string;
  duration_ms?: number | null;
}

interface MediaGalleryProps {
  items: MediaItem[];
  taskInfo: TaskInfo;
}

export default function MediaGallery({
  items,
  taskInfo,
}: MediaGalleryProps) {
  const t = useTranslations('ai-generator.results');
  const [copied, setCopied] = useState(false);
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [morePopoverOpen, setMorePopoverOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // 获取分享 URL
  const shareUrl = taskInfo.task_id && typeof window !== 'undefined'
    ? `${window.location.origin}/v/${taskInfo.task_id}`
    : typeof window !== 'undefined'
      ? window.location.href
      : '';

  // 复制链接
  const handleCopyLink = async () => {
    if (copied || !shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // 下载当前图片
  const handleDownload = async (imageUrl: string) => {
    if (downloading) return;

    setDownloading(true);
    try {
      await downloadImage(imageUrl);
      setMorePopoverOpen(false);
    } catch (err) {
      console.error('Failed to download image:', err);
    } finally {
      setDownloading(false);
    }
  };

  // 下载全部图片
  const handleDownloadAll = async () => {
    if (downloadingAll) return;

    setDownloadingAll(true);
    try {
      await downloadImages(items.map(item => item.url));
      setMorePopoverOpen(false);
    } catch (err) {
      console.error('Failed to download all images:', err);
    } finally {
      setDownloadingAll(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{t('title')}</div>
        <span className="text-sm text-muted-foreground">{t('fileCount', { count: items.length })}</span>
      </div>

      {/* 媒体展示 */}
      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl overflow-hidden bg-surface-secondary border border-border/50"
          >
            {/* PC端：左右布局，移动端：上下布局 */}
            <div className="flex flex-col lg:flex-row lg:divide-x divide-border/50">
              {/* 左侧/上部分：图片区域 */}
              <div className="relative bg-muted flex items-center justify-center lg:w-1/2">
                {item.type === 'image' && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={taskInfo.prompt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                {item.type === 'video' && (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                )}
                {item.type === 'audio' && (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-32">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                    <span className="text-sm">音频文件</span>
                  </div>
                )}
              </div>

              {/* 右侧/下部分：信息和操作区域 */}
              <div className="flex flex-col lg:w-1/2">
                {/* 信息区域 */}
                <div className="flex-1 p-4 lg:p-5 space-y-3">
                  {/* 提示词 */}
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/20">
                    <p className="text-xs text-text-muted mb-1.5">{t('prompt')}</p>
                    <p className="text-sm text-white/90 leading-relaxed line-clamp-3">
                      {taskInfo.prompt}
                    </p>
                  </div>

                  {/* 参数网格 */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* 生成耗时 */}
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/10">
                      <p className="text-xs text-text-muted mb-1.5">{t('generationTime')}</p>
                      <p className="text-sm text-white font-semibold truncate">
                        {formatDuration(getTaskDuration({
                          durationMs: taskInfo.duration_ms,
                          startedAt: taskInfo.started_at ? new Date(taskInfo.started_at) : new Date(taskInfo.created_at),
                          completedAt: new Date(taskInfo.completed_at),
                        }))}
                      </p>
                    </div>

                    {/* 完成时间 */}
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/10">
                      <p className="text-xs text-text-muted mb-1.5">{t('completedTime')}</p>
                      <p className="text-sm text-white font-semibold truncate">
                        {new Date(taskInfo.completed_at).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 操作按钮区域 */}
                <div className="p-4 bg-card/30">
                  <div className="flex items-center justify-end gap-1">
                    {/* 复制链接按钮 */}
                    <button
                      onClick={handleCopyLink}
                      className="p-1.5 rounded-md hover:bg-zinc-700/50 transition-colors cursor-pointer"
                      aria-label={copied ? 'Link copied' : 'Copy link'}
                    >
                      {copied ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      )}
                    </button>

                    {/* 分享按钮 */}
                    <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
                      <PopoverTrigger asChild>
                        <button
                          className="p-1.5 rounded-md hover:bg-zinc-700/50 transition-colors cursor-pointer"
                          aria-label="Share"
                        >
                          <Share2 className="w-4 h-4 text-white" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-1 bg-zinc-800 border-zinc-700"
                        align="start"
                        arrowClassName="fill-zinc-800"
                      >
                        <div className="flex flex-col gap-2">
                          <ShareToX
                            text={taskInfo.prompt}
                            url={shareUrl}
                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-700/50 transition-colors text-white text-sm"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* 更多操作按钮 */}
                    <Popover open={morePopoverOpen} onOpenChange={setMorePopoverOpen}>
                      <PopoverTrigger asChild>
                        <button
                          className="p-1.5 rounded-md hover:bg-zinc-700/50 transition-colors cursor-pointer"
                          aria-label="More actions"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-1 bg-zinc-800 border-zinc-700"
                        align="start"
                        arrowClassName="fill-zinc-800"
                      >
                        <div className="flex flex-col gap-1">
                          {/* 下载当前图片 */}
                          <button
                            type="button"
                            onClick={() => handleDownload(item.url)}
                            disabled={downloading}
                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-700/50 transition-colors text-white text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloading ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            {t('downloadCurrent')}
                          </button>

                          {/* 下载全部图片 */}
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={handleDownloadAll}
                              disabled={downloadingAll}
                              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-700/50 transition-colors text-white text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingAll ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                              {t('downloadAll', { count: items.length })}
                            </button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
