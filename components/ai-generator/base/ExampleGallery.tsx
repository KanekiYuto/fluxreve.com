'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

// 示例数据类型定义
export interface ExampleItem {
  id: string;
  thumbnail: string;
  prompt: string;
  tags?: string[];
}

interface ExamplePreviewProps {
  examples: ExampleItem[];
  onSelectExample?: (example: ExampleItem) => void;
  autoPlayInterval?: number; // 自动播放间隔（毫秒），0 表示不自动播放
}

export default function ExamplePreview({
  examples,
  onSelectExample,
  autoPlayInterval = 5000,
}: ExamplePreviewProps) {
  const t = useTranslations('ai-generator.examples');
  const tTags = useTranslations('ai-generator.tags');
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自动播放
  useEffect(() => {
    if (autoPlayInterval > 0 && examples.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % examples.length);
      }, autoPlayInterval);

      return () => clearInterval(timer);
    }
  }, [autoPlayInterval, examples.length]);

  // 上一个
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + examples.length) % examples.length);
  };

  // 下一个
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % examples.length);
  };

  // 跳转到指定索引
  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (examples.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">{t('noExamples')}</p>
        </div>
      </div>
    );
  }

  const currentExample = examples[currentIndex];

  return (
    <div className="h-full flex flex-col">
      {/* 头部说明 */}
      <div className="text-center mb-6">
        <div className="text-lg font-bold text-foreground mb-2">{t('title')}</div>
        <div className="text-sm text-muted-foreground">{t('description')}</div>
      </div>

      {/* 轮播主体 */}
      <div className="flex-1 flex flex-col">
        {/* 图片容器 - 固定宽高比 */}
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
          {/* 图片 */}
          <div
            className="group relative w-full h-full cursor-pointer"
            onClick={() => onSelectExample?.(currentExample)}
          >
            <div className="relative w-full h-full bg-bg-elevated">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentExample.thumbnail}
                alt={currentExample.prompt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  {/* 提示词 */}
                  <p className="text-white text-sm line-clamp-3 mb-3 drop-shadow-lg [text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]">{currentExample.prompt}</p>

                  {/* 标签 */}
                  {currentExample.tags && currentExample.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {currentExample.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center justify-center h-6 px-2.5 bg-black/50 text-white text-[11px] font-medium rounded border border-white/20 backdrop-blur-sm shadow-lg"
                        >
                          {tTags(tag)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 悬浮提示 */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-12 h-12 text-white mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                  <p className="text-white text-base font-medium">{t('clickToUse')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 左右切换按钮 */}
          {examples.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* 指示点和计数 */}
        {examples.length > 1 && (
          <div className="mt-4 flex items-center justify-between">
            {/* 指示点 */}
            <div className="flex gap-2">
              {examples.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDotClick(index)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    index === currentIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-border hover:bg-border/80'
                  }`}
                  aria-label={t('goToExample', { index: index + 1 })}
                />
              ))}
            </div>

            {/* 计数 */}
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {examples.length}
            </span>
          </div>
        )}

        {/* 使用按钮 */}
        <Button
          type="button"
          onClick={() => onSelectExample?.(currentExample)}
          className="mt-4 w-full cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
          {t('useExample')}
        </Button>
      </div>
    </div>
  );
}
