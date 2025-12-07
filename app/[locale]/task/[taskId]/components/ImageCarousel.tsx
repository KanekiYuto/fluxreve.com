'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import useImagePreviewStore from '@/store/useImagePreviewStore';

interface ImageCarouselProps {
  images: Array<{
    url: string;
  }>;
  prompt: string;
  parameters?: {
    images?: string[];
    [key: string]: any;
  };
}

export default function ImageCarousel({ images, prompt, parameters }: ImageCarouselProps) {
  const t = useTranslations('task.details');
  const [currentIndex, setCurrentIndex] = useState(0);
  const openPreview = useImagePreviewStore((state) => state.open);

  // 获取参考图片数组
  const referenceImages = parameters?.images || [];

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  // 键盘事件监听
  useEffect(() => {
    if (images.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, goToPrevious, goToNext]);

  if (images.length === 0) {
    return null;
  }

  // 打开图片预览
  const handleImageClick = () => {
    const imageUrls = images.map((img) => img.url);
    openPreview(imageUrls, currentIndex);
  };

  // 打开参考图片预览
  const handleReferenceImageClick = (index: number) => {
    openPreview(referenceImages, index);
  };

  return (
    <div className="relative bg-surface-secondary rounded-2xl overflow-hidden border border-border/50">
      {/* 主图片区域 */}
      <div className="relative w-full aspect-square bg-muted group overflow-hidden">
        {/* 可点击的图片容器 */}
        <button
          type="button"
          onClick={handleImageClick}
          className="relative w-full h-full block cursor-pointer overflow-hidden"
          aria-label={t('imagePreview')}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[currentIndex].url}
            alt={`${prompt} - ${t('imageAlt')} ${currentIndex + 1}`}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            loading="eager"
          />

          {/* 悬停时显示放大图标 */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </div>
          </div>
        </button>

        {/* 图片计数器 */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* 左右切换按钮 */}
        {images.length > 1 && (
          <>
            {/* 左箭头 */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white transition-all flex items-center justify-center group cursor-pointer"
              aria-label={t('previousImage')}
            >
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 右箭头 */}
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white transition-all flex items-center justify-center group cursor-pointer"
              aria-label={t('nextImage')}
            >
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* 参考图片缩略图区域 */}
      {referenceImages.length > 0 && (
        <div className="relative z-10 px-4 py-3 border-t border-border/50 bg-background">
          <h4 className="text-sm font-medium text-foreground/70 mb-2">
            {t('referenceImages')}
          </h4>
          <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {referenceImages.map((imageUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleReferenceImageClick(index)}
                className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all cursor-pointer group bg-muted"
                aria-label={`${t('referenceImage')} ${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`${t('referenceImage')} ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
