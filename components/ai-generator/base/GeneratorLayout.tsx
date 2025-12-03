'use client';

import { ReactNode } from 'react';
import LoadingAnimation from './LoadingAnimation';
import ErrorCard from './ErrorCard';
import CreditsCard from './CreditsCard';
import MediaGallery, { MediaItem, TaskInfo } from './MediaGallery';
import ExamplePreview, { ExampleItem } from './ExampleGallery';

interface GeneratorLayoutProps {
  // 头部模型选择器
  headerContent?: ReactNode;
  // 左侧表单内容
  formContent: ReactNode;
  // 生成按钮
  generateButton: ReactNode;
  // 加载状态
  isLoading?: boolean;
  progress?: number;
  // 错误状态
  error?: {
    title: string;
    message: string;
    variant?: 'error' | 'credits';
    creditsInfo?: { required: number; current: number };
  };
  // 积分信息
  credits?: number | null;
  isCreditsLoading?: boolean;
  onCreditsRefresh?: () => void;
  // 生成结果
  generatedItems?: MediaItem[];
  taskInfo?: TaskInfo;
  // 示例配置
  examples?: ExampleItem[];
  onSelectExample?: (example: ExampleItem) => void;
}

export default function GeneratorLayout({
  headerContent,
  formContent,
  generateButton,
  isLoading = false,
  progress = 0,
  error,
  credits,
  isCreditsLoading,
  onCreditsRefresh,
  generatedItems,
  taskInfo,
  examples,
  onSelectExample,
}: GeneratorLayoutProps) {
  // 根据状态决定显示的内容
  const renderPreviewContent = () => {
    // 优先显示错误
    if (error) {
      return (
        <ErrorCard
          title={error.title}
          message={error.message}
          variant={error.variant || 'error'}
          creditsInfo={error.creditsInfo}
        />
      );
    }

    // 显示加载状态
    if (isLoading) {
      return <LoadingAnimation progress={progress} />;
    }

    // 显示生成结果
    if (generatedItems && generatedItems.length > 0 && taskInfo) {
      return <MediaGallery items={generatedItems} taskInfo={taskInfo} />;
    }

    // 显示示例
    if (examples && examples.length > 0 && onSelectExample) {
      return (
        <ExamplePreview
          examples={examples}
          onSelectExample={onSelectExample}
          autoPlayInterval={0}
        />
      );
    }

    // 默认空状态
    return null;
  };
  return (
    <div className="space-y-6">
      {/* 左右布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧 - 表单区域 */}
        <div className="space-y-4">
          {/* 模型选择器头部 */}
          {headerContent}

          {/* 表单内容区域 */}
          <div className="rounded-xl gradient-border">
            <div className="px-4 py-4 space-y-4">
              {formContent}
            </div>
          </div>

          {/* 生成按钮区域 - 粘性定位在底部 */}
          <div className="sticky bottom-2 rounded-xl p-4 gradient-border">
            <div className="space-y-3">
              {generateButton}
              {credits !== undefined && (
                <CreditsCard
                  credits={credits}
                  isLoading={isCreditsLoading}
                  onRefresh={onCreditsRefresh}
                />
              )}
            </div>
          </div>
        </div>

        {/* 右侧 - 预览区域 */}
        <div className="relative">
          <div className="rounded-xl p-6 overflow-hidden gradient-border">
            {renderPreviewContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
