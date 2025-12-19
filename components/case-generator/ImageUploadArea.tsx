'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import useImagePreviewStore from '@/store/useImagePreviewStore';
import useUserStore from '@/store/useUserStore';
import useModalStore from '@/store/useModalStore';
import { Loader2, X } from 'lucide-react';

interface ImageUploadAreaProps {
  /** 当前图片URL（受控） */
  value: string;
  /** 图片URL变化回调 */
  onChange: (imageUrl: string) => void;
  modelName?: string;
  generatorType?: string;
}

export default function ImageUploadArea({
  value,
  onChange,
  modelName,
  generatorType = 'ghibli-style'
}: ImageUploadAreaProps) {
  const t = useTranslations('case-generator');
  const [inputValue, setInputValue] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const openImagePreview = useImagePreviewStore((state) => state.open);
  const user = useUserStore((state) => state.user);
  const openLoginModal = useModalStore((state) => state.openLoginModal);

  // 检查用户是否已登录
  const checkUserLoggedIn = useCallback(() => {
    if (!user) {
      openLoginModal();
      return false;
    }
    return true;
  }, [user, openLoginModal]);

  // 显示的URL：优先显示用户输入，否则显示已确认的value
  const displayUrl = inputValue || value;

  // 上传文件到 R2
  const uploadFileToR2 = useCallback(async (file: File) => {
    if (!checkUserLoggedIn()) return null;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 构建上传 URL 参数
      const params = new URLSearchParams();
      if (generatorType) params.append('modelType', generatorType);
      if (modelName) params.append('modelName', modelName);

      const uploadUrl = `/api/upload${params.toString() ? '?' + params.toString() : ''}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return result.data.url;
      } else {
        console.error('Upload failed:', result.error);
        alert(`${t('uploadFailed')}: ${result.error}`);
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(t('uploadFailed'));
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [checkUserLoggedIn, generatorType, modelName, t]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const uploadedUrl = await uploadFileToR2(file);
      if (uploadedUrl) {
        setInputValue('');
        onChange(uploadedUrl);
      }
    }
  };

  const handleUrlSubmit = () => {
    if (inputValue.trim()) {
      onChange(inputValue.trim());
      setInputValue('');
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const uploadedUrl = await uploadFileToR2(file);
      if (uploadedUrl) {
        setInputValue('');
        onChange(uploadedUrl);
      }
    }
  };

  return (
    <div
      className="border-dashed border rounded-xl p-2 relative bg-background border-border transition-colors hover:border-primary/50"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* URL 输入框和操作按钮 */}
      <div className="space-y-2">
        <div className="flex flex-row items-center gap-2">
          <input
            type="text"
            value={displayUrl}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                handleUrlSubmit();
              }
            }}
            placeholder={t('urlPlaceholder')}
            className="flex-1 h-9 px-3 pr-20 rounded-md bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all gradient-border-focusable"
            disabled={isUploading}
          />

          {/* 右侧操作按钮 */}
          <div className="flex flex-row absolute right-2 top-2 gap-1">
            {/* 清空按钮 */}
            {(value || inputValue) && !isUploading && (
              <button
                type="button"
                onClick={handleClear}
                className="w-7 h-9 flex justify-center items-center group text-foreground hover:text-red-500"
                title={t('clear')}
              >
                <X className="w-5 h-5 group-hover:bg-red-500/10 rounded-md p-0.5" />
              </button>
            )}

            {/* 文件选择按钮 */}
            <label
              htmlFor="file-upload"
              className={`w-7 h-9 flex justify-center items-center group text-foreground ${isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <svg className="w-5 h-5 group-hover:bg-black/10 rounded-md p-0.5 dark:group-hover:bg-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </label>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>
        </div>

        {/* URL确认按钮 */}
        {inputValue.trim() && (
          <button
            onClick={handleUrlSubmit}
            className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
          >
            {t('generate')}
          </button>
        )}
      </div>

      {/* 提示文本或上传状态 */}
      {isUploading ? (
        <div className="flex items-center gap-2 mt-2 pl-1">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs font-medium text-muted-foreground">{t('generating')}</span>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className="block text-xs font-medium text-muted-foreground mt-2 pl-1 cursor-pointer hover:text-foreground transition-colors"
        >
          {t('uploadHint')}
        </label>
      )}

      {/* 图片预览 */}
      {value && !isUploading && (
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => openImagePreview([value], 0)}
            className="relative group cursor-pointer rounded-lg overflow-hidden"
          >
            <img
              src={value}
              alt="preview"
              className="w-[100px] h-[100px] rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {/* 悬停遮罩 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center rounded-lg">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
