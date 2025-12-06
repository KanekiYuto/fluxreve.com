'use client';

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import useImagePreviewStore from '@/store/useImagePreviewStore';
import { downloadImage } from '@/lib/download';

export default function ImagePreviewModal() {
  const { isOpen, images, currentIndex, close, next, prev, goTo } = useImagePreviewStore();

  // 键盘事件处理
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          close();
          break;
        case 'ArrowLeft':
          prev();
          break;
        case 'ArrowRight':
          next();
          break;
      }
    },
    [isOpen, close, prev, next]
  );

  // 注册键盘事件
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 点击遮罩层关闭
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      close();
    }
  };

  // 下载当前图片
  const handleDownload = async () => {
    if (images[currentIndex]) {
      await downloadImage(images[currentIndex]);
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      {/* 顶部工具栏 */}
      <div 
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 图片计数 */}
        <div className="text-white/80 text-sm font-medium">
          {hasMultipleImages && (
            <span>
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1">
          {/* 下载按钮 */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDownload();
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* 关闭按钮 */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              close();
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 图片展示区域 */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-16 pt-20 pb-24"
      >
        {/* 主图片 */}
        <img
          src={currentImage}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none animate-in zoom-in-95 duration-200"
          draggable={false}
          onClick={() => close()}
        />

        {/* 左箭头 */}
        {hasMultipleImages && currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors cursor-pointer"
            title="Previous (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* 右箭头 */}
        {hasMultipleImages && currentIndex < images.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors cursor-pointer"
            title="Next (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* 底部缩略图导航 */}
      {hasMultipleImages && (
        <div 
          className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center p-4 bg-gradient-to-t from-black/60 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 overflow-x-auto max-w-full px-4 py-2 scrollbar-dark">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(index);
                }}
                className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                  index === currentIndex
                    ? 'border-white opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-75'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

