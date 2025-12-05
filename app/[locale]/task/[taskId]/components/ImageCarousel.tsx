'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface ImageCarouselProps {
  images: Array<{
    url: string;
  }>;
  prompt: string;
}

export default function ImageCarousel({ images, prompt }: ImageCarouselProps) {
  const t = useTranslations('task.details');
  const [currentIndex, setCurrentIndex] = useState(0);

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

  return (
    <div className="relative bg-surface-secondary rounded-2xl overflow-hidden border border-border/50">
      {/* 主图片区域 */}
      <div className="relative w-full aspect-square bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentIndex].url}
          alt={`${prompt} - ${t('imageAlt')} ${currentIndex + 1}`}
          className="w-full h-full object-contain"
          loading="eager"
        />

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
    </div>
  );
}
