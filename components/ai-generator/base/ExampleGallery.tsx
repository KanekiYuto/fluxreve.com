'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

// 示例数据类型定义
export interface ExampleItem {
  id: string;
  thumbnail: string;
  // 原图用于对比效果
  original?: string;
  // 输入图片（用于图生图示例）
  images?: string[];
  prompt: string;
  tags?: string[];
}

interface ExamplePreviewProps {
  examples: ExampleItem[];
  onSelectExample?: (example: ExampleItem) => void;
  autoPlayInterval?: number; // 自动播放间隔（毫秒），0 表示不自动播放
  enableSelectExample?: boolean; // 是否启用"使用示例"功能，默认为 true
}

export default function ExamplePreview({
  examples,
  onSelectExample,
  autoPlayInterval = 5000,
  enableSelectExample = true,
}: ExamplePreviewProps) {
  const t = useTranslations('ai-generator.examples');
  const tTags = useTranslations('ai-generator.tags');
  const [currentIndex, setCurrentIndex] = useState(0);
  // 对比滑块的位置（0-100%）
  const [comparisonPosition, setComparisonPosition] = useState(50);
  // 是否正在拖动对比滑块
  const [isDraggingComparison, setIsDraggingComparison] = useState(false);

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

  // 处理选择示例 - 添加滚动到提示词区域
  const handleSelectExampleWithScroll = (example: ExampleItem) => {
    onSelectExample?.(example);

    // 在下一个事件循环中滚动，确保 DOM 已更新
    setTimeout(() => {
      // 查找最近的提示词输入框或表单容器
      const promptInput = document.querySelector('textarea[id="prompt"]');
      if (promptInput) {
        promptInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 自动聚焦输入框
        (promptInput as HTMLTextAreaElement).focus();
      } else {
        // 如果找不到提示词输入，滚动到表单容器顶部
        const formContainer = document.querySelector('[data-form-container]');
        if (formContainer) {
          formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 0);
  };

  // 处理对比滑块鼠标按下
  const handleComparisonMouseDown = () => {
    setIsDraggingComparison(true);
  };

  // 处理对比滑块鼠标移动（仅在拖动时更新位置）
  const handleComparisonMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingComparison) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    setComparisonPosition(Math.max(0, Math.min(100, newPosition)));
  };

  // 处理对比滑块鼠标抬起
  const handleComparisonMouseUp = () => {
    setIsDraggingComparison(false);
  };

  // 处理对比滑块触摸开始
  const handleComparisonTouchStart = () => {
    setIsDraggingComparison(true);
  };

  // 处理对比滑块触摸移动（仅在拖动时更新位置）
  const handleComparisonTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingComparison) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const newPosition = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setComparisonPosition(Math.max(0, Math.min(100, newPosition)));
  };

  // 处理对比滑块触摸结束
  const handleComparisonTouchEnd = () => {
    setIsDraggingComparison(false);
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
        {/* 图片容器 - 自适应高度 */}
        <div className="relative w-full rounded-lg overflow-hidden bg-white">
          {/* 图片 */}
          <div
            className="group relative w-full cursor-pointer flex items-center justify-center user-select-none"
            onClick={() => handleSelectExampleWithScroll(currentExample)}
            onMouseMove={currentExample.original ? handleComparisonMouseMove : undefined}
            onMouseUp={currentExample.original ? handleComparisonMouseUp : undefined}
            onMouseLeave={currentExample.original ? handleComparisonMouseUp : undefined}
            onTouchMove={currentExample.original ? handleComparisonTouchMove : undefined}
            onTouchEnd={currentExample.original ? handleComparisonTouchEnd : undefined}
            onMouseDown={(e) => {
              if (currentExample.original) {
                e.preventDefault();
              }
            }}
          >
            <div className="relative w-full flex items-center justify-center">
              {/* 如果有原图，显示对比效果 */}
              {currentExample.original ? (
                <div className="relative w-full user-select-none">
                  {/* 底层：结果图 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentExample.thumbnail}
                    alt={currentExample.prompt}
                    className="w-full h-auto block pointer-events-none"
                    draggable={false}
                  />

                  {/* 上层：原图，通过 clip-path 透明遮罩实现对比 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentExample.original}
                    alt="Original"
                    className="absolute top-0 left-0 w-full h-full block pointer-events-none"
                    draggable={false}
                    style={{
                      clipPath: `inset(0 ${100 - comparisonPosition}% 0 0)`,
                    }}
                  />

                  {/* 对比滑块 */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white"
                    style={{
                      left: `${comparisonPosition}%`,
                      transform: 'translateX(-50%)',
                      cursor: 'ew-resize',
                    }}
                  >
                    {/* 滑块句柄 */}
                    <div
                      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center border-3 border-white transition-transform user-select-none ${
                        isDraggingComparison ? 'scale-125' : ''
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleComparisonMouseDown();
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleComparisonTouchStart();
                      }}
                      style={{
                        cursor: 'ew-resize',
                      }}
                    >
                      {/* 左右箭头 */}
                      <div className="flex gap-0.5 items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <div className="w-0.5 h-4 bg-gray-300" />
                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // 没有原图时显示普通图片
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={currentExample.thumbnail}
                  alt={currentExample.prompt}
                  className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                />
              )}

              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
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
              {enableSelectExample && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
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
              )}
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
        {enableSelectExample && (
          <Button
            type="button"
            onClick={() => handleSelectExampleWithScroll(currentExample)}
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
        )}
      </div>
    </div>
  );
}
