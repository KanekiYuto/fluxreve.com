'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getModelDisplayName } from '@/config/model-names';
import { ExploreTask } from '../types';

interface ExploreCardProps {
  task: ExploreTask;
}

/**
 * 从宽高比字符串中解析出数值
 * 例如 "16:9" 返回 1.777...
 */
function parseAspectRatio(aspectRatio?: string): number | null {
  if (!aspectRatio) {
    return null;
  }

  const parts = aspectRatio.split(':');
  if (parts.length === 2) {
    const width = parseFloat(parts[0]);
    const height = parseFloat(parts[1]);
    if (width > 0 && height > 0) {
      return width / height;
    }
  }

  return null;
}

/**
 * 计算相对时间 - 使用浏览器原生 API
 */
function getTimeAgo(date: Date, locale: string): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
}

export default function ExploreCard({ task }: ExploreCardProps) {
  const locale = useLocale();
  const t = useTranslations('explore');
  const hasImage = task.results && task.results.length > 0;
  const aspectRatioValue = parseAspectRatio(task.parameters?.aspect_ratio);
  const timeAgo = getTimeAgo(new Date(task.completedAt), locale);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [nsfwRevealed, setNsfwRevealed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const showNsfwOverlay = task.isNsfw && !nsfwRevealed;

  // 监听图片加载完成，获取实际尺寸
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const updateDimensions = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      }
    };

    // 如果图片已经加载过，直接获取
    if (img.complete) {
      updateDimensions();
    } else {
      // 否则监听加载事件
      img.addEventListener('load', updateDimensions);
      return () => img.removeEventListener('load', updateDimensions);
    }
  }, []);

  // 使用图片的实际宽高比，或使用参数中的宽高比，或默认 1:1
  const effectiveAspectRatio = imageDimensions
    ? imageDimensions.width / imageDimensions.height
    : aspectRatioValue || 1;

  if (!hasImage) {
    return null;
  }

  return (
    <div
      className="relative rounded-lg sm:rounded-xl overflow-hidden bg-surface-secondary border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* 图片区域 - 可点击跳转到分享页面 */}
      <Link href={`/t/${task.shareId}`} className="block group">
        <div className="relative w-full overflow-hidden" style={{
          aspectRatio: effectiveAspectRatio,
        } as React.CSSProperties}>
          {/* 图片 */}
          <img
            ref={imgRef}
            src={task.results[0].url}
            alt={showNsfwOverlay ? 'NSFW Content' : task.parameters.prompt}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              showNsfwOverlay ? 'blur-xl scale-105' : ''
            }`}
            loading="lazy"
            decoding="async"
          />

          {/* 模型徽章 */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
            {getModelDisplayName(task.model)}
          </div>

          {/* 多图标识 */}
          {task.results.length > 1 && (
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{task.results.length}</span>
            </div>
          )}

          {/* NSFW 内容遮罩和警告 */}
          {showNsfwOverlay && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
              {/* 警告图标 */}
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* 警告文本 */}
              <div className="text-white text-sm font-semibold mb-1">
                {t('nsfw.warning')}
              </div>
              <p className="text-white/70 text-xs text-center max-w-xs mb-4 px-2">
                {t('nsfw.description')}
              </p>

              {/* 查看按钮 */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setNsfwRevealed(true);
                }}
                className="px-4 py-2 rounded-lg font-medium text-xs transition-colors duration-200 cursor-pointer bg-white text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300"
              >
                {t('nsfw.confirm')}
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* 底部信息区域 */}
      <div className="p-3 bg-surface-secondary">
        <p className="text-xs sm:text-sm text-white line-clamp-2 mb-3">
          {showNsfwOverlay ? t('nsfw.badge') : task.parameters.prompt}
        </p>
        <div className="flex items-center justify-between gap-x-2 gap-y-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-text-muted">
            <span className="whitespace-nowrap">{timeAgo}</span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{task.viewCount}</span>
            </span>
          </div>
          <Link
            href={`/ai-generator?id=${task.shareId}`}
            className="text-xs px-2 py-1 rounded bg-primary hover:bg-primary/90 text-white font-medium transition-colors whitespace-nowrap"
          >
            {t('createSimilar')}
          </Link>
        </div>
      </div>
    </div>
  );
}
