'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface BeforeAfterComparisonProps {
  beforeImage: string | null;
  afterImage: string | null;
  isLoading: boolean;
  imageOpacity: number;
}

export default function BeforeAfterComparison({
  beforeImage,
  afterImage,
  isLoading,
  imageOpacity,
}: BeforeAfterComparisonProps) {
  const t = useTranslations('case-generator');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 统一处理位置更新的函数
  const updateSliderPosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  // 鼠标事件处理
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (e.touches.length > 0) {
      updateSliderPosition(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault(); // 防止页面滚动
    if (e.touches.length > 0) {
      updateSliderPosition(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="lg:col-span-7 relative rounded-2xl overflow-hidden bg-surface-secondary/20 border border-white/5 self-start">
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] cursor-ew-resize select-none touch-none"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* After 图片 */}
        <div className="absolute inset-0" style={{ opacity: imageOpacity, transition: 'opacity 0.3s ease-in-out' }}>
          <img
            src={afterImage || '/examples/ghibli-1.jpg'}
            alt="After"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-md text-white text-xs font-medium">
            {t('after')}
          </div>
        </div>

        {/* Before 图片 */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, opacity: imageOpacity, transition: 'opacity 0.3s ease-in-out' }}
        >
          <img
            src={beforeImage || '/examples/ghibli-1.jpg'}
            alt="Before"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-md text-white text-xs font-medium">
            {t('before')}
          </div>
        </div>

        {/* 加载遮罩 */}
        {isLoading && (
          <div className="absolute inset-0 bg-surface-secondary/50 backdrop-blur-sm flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {/* 滑块 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-auto">
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
