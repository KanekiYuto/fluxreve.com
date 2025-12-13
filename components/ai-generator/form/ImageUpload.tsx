'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FolderOpen, Trash2, Plus, Loader2, ZoomIn } from 'lucide-react';
import useImagePreviewStore from '@/store/useImagePreviewStore';
import useUserStore from '@/store/useUserStore';
import useModalStore from '@/store/useModalStore';

// ==================== 类型定义 ====================

export interface ImageItem {
  /** 图片唯一 ID */
  id: string;
  /** 图片 URL */
  url: string;
  /** 文件名 (可选) */
  name?: string;
  /** 是否正在上传 */
  uploading?: boolean;
}

interface ImageUploadProps {
  /** 已上传的图片列表 */
  value: ImageItem[];
  /** 图片列表变化回调 */
  onChange: (images: ImageItem[]) => void;
  /** 标签 */
  label?: string;
  /** 最大上传数量 */
  maxCount?: number;
  /** 是否必填 */
  required?: boolean;
  /** 组件 ID */
  id?: string;
  /** AI 模型名称（用于上传分类） */
  modelName?: string;
  /** 生成器类型（如：'text-to-image'、'image-to-image'） */
  generatorType?: string;
}

// ==================== 主组件 ====================

export default function ImageUpload({
  value,
  onChange,
  label,
  maxCount = 10,
  required = false,
  id,
  modelName,
  generatorType,
}: ImageUploadProps) {
  const t = useTranslations('ai-generator.form');
  const valueRef = useRef<ImageItem[]>(value);
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

  // 获取所有有效图片的 URL
  const getValidImageUrls = useCallback(() => {
    return value.filter((img) => img.url && !img.uploading).map((img) => img.url);
  }, [value]);

  // 打开图片预览
  const handleImagePreview = useCallback(
    (imageUrl: string) => {
      const validUrls = getValidImageUrls();
      const index = validUrls.indexOf(imageUrl);
      if (index !== -1) {
        openImagePreview(validUrls, index);
      }
    },
    [getValidImageUrls, openImagePreview]
  );

  // 保持 ref 与 value 同步
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // 添加新的空白图片项
  const handleAddItem = useCallback(() => {
    if (value.length >= maxCount) return;

    const newImage: ImageItem = {
      id: `new-${Date.now()}`,
      url: '',
    };

    onChange([...value, newImage]);
  }, [value, maxCount, onChange]);

  // 更新图片 URL
  const handleUpdateUrl = useCallback(
    (id: string, url: string) => {
      onChange(value.map((img) => (img.id === id ? { ...img, url } : img)));
    },
    [value, onChange]
  );

  // 删除图片
  const handleRemove = useCallback(
    (id: string) => {
      onChange(value.filter((img) => img.id !== id));
    },
    [value, onChange]
  );

  // 文件上传（针对特定图片项）
  const handleFileChange = useCallback(
    async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
      // 检查用户是否已登录
      if (!checkUserLoggedIn()) return;

      const file = e.target.files?.[0];
      if (!file) return;

      // 设置上传中状态
      onChange(
        value.map((img) =>
          img.id === id ? { ...img, uploading: true, url: URL.createObjectURL(file), name: file.name } : img
        )
      );

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
          // 更新为真实 URL
          const updatedImages = valueRef.current.map((img) =>
            img.id === id
              ? {
                  id: result.data.key,
                  url: result.data.url,
                  name: result.data.file_name,
                  uploading: false,
                }
              : img
          );
          onChange(updatedImages);
        } else {
          console.error('Upload failed:', result.error);
          onChange(valueRef.current.map((img) => (img.id === id ? { ...img, uploading: false, url: '' } : img)));
          alert(`Upload failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        onChange(valueRef.current.map((img) => (img.id === id ? { ...img, uploading: false, url: '' } : img)));
        alert('Upload failed, please try again');
      }

    },
    [value, onChange, checkUserLoggedIn]
  );

  // 打开文件选择（针对特定图片项）
  const handleSelectFiles = useCallback((id: string) => {
    // 检查用户是否已登录
    if (!checkUserLoggedIn()) return;

    const input = document.getElementById(`file-input-${id}`) as HTMLInputElement;
    input?.click();
  }, [checkUserLoggedIn]);

  // 处理拖拽进入
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 处理文件拖放
  const handleDrop = useCallback(
    async (id: string, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 检查用户是否已登录
      if (!checkUserLoggedIn()) return;

      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // 设置上传中状态
      onChange(
        value.map((img) =>
          img.id === id ? { ...img, uploading: true, url: URL.createObjectURL(file), name: file.name } : img
        )
      );

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
          // 更新为真实 URL
          const updatedImages = valueRef.current.map((img) =>
            img.id === id
              ? {
                  id: result.data.key,
                  url: result.data.url,
                  name: result.data.file_name,
                  uploading: false,
                }
              : img
          );
          onChange(updatedImages);
        } else {
          console.error('Upload failed:', result.error);
          onChange(valueRef.current.map((img) => (img.id === id ? { ...img, uploading: false, url: '' } : img)));
          alert(`Upload failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        onChange(valueRef.current.map((img) => (img.id === id ? { ...img, uploading: false, url: '' } : img)));
        alert('Upload failed, please try again');
      }
    },
    [value, onChange, checkUserLoggedIn]
  );

  return (
    <div className="w-full space-y-3">
      {/* 标签 */}
      {label && (
        <Label htmlFor={id} className="text-base flex items-center font-normal">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {/* 图片项列表 */}
      <div className="space-y-2">
        {value.map((image) => (
          <div
            key={image.id}
            className="border-dashed border rounded-xl p-2 relative bg-background border-border transition-colors hover:border-primary/50"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(image.id, e)}
          >
            {/* URL 输入框和操作按钮 */}
            <div className="flex flex-row items-center gap-2">
              <Input
                type="text"
                value={image.url}
                onChange={(e) => handleUpdateUrl(image.id, e.target.value)}
                placeholder={t('imageUrlPlaceholder')}
                className="pr-16 !text-xs cursor-text"
                disabled={image.uploading}
              />

              {/* 右侧操作按钮 */}
              <div className="flex flex-row absolute right-2 top-2">
                {/* 文件选择按钮 */}
                <button
                  type="button"
                  className="w-6 h-9 flex justify-center items-center cursor-pointer group text-foreground"
                  onClick={() => handleSelectFiles(image.id)}
                >
                  <FolderOpen className="w-6 h-6 group-hover:bg-black/10 rounded-md p-1 dark:group-hover:bg-white/10" />
                </button>

                {/* 删除按钮 */}
                <button
                  type="button"
                  className="w-9 h-9 flex justify-center items-center cursor-pointer group text-foreground"
                  onClick={() => handleRemove(image.id)}
                >
                  <Trash2 className="w-6 h-6 group-hover:bg-black/10 rounded-md p-1 dark:group-hover:bg-white/10" />
                </button>
              </div>
            </div>

            {/* 提示文本 */}
            <p
              className="text-xs font-medium text-muted-foreground mt-2 pl-1 cursor-pointer hover:text-foreground transition-colors"
              onClick={() => handleSelectFiles(image.id)}
            >
              {t('uploadHint')}
            </p>

            {/* 图片预览 */}
            {image.url && !image.uploading && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleImagePreview(image.url)}
                  className="relative group cursor-pointer rounded-lg overflow-hidden"
                >
                  <img
                    src={image.url}
                    alt="preview"
                    width={100}
                    height={100}
                    className="rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  {/* 悬停遮罩 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center rounded-lg">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* 上传中状态 */}
            {image.uploading && (
              <div className="flex gap-2 mt-2 items-center">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">{t('uploading')}</span>
              </div>
            )}

            {/* 隐藏的文件输入 */}
            <input
              id={`file-input-${image.id}`}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(image.id, e)}
              className="hidden"
            />
          </div>
        ))}
      </div>

      {/* 添加新项按钮 */}
      {value.length < maxCount && (
        <Button
          type="button"
          onClick={handleAddItem}
          className="rounded-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t('addItem')}
        </Button>
      )}
    </div>
  );
}
