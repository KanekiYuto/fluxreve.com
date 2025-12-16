'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useCachedSession } from '@/hooks/useCachedSession';
import useModalStore from '@/store/useModalStore';
import { getConversionConfig } from '@/config/google-ads-conversions';
import LoadingAnimation from './LoadingAnimation';
import ErrorCard from './ErrorCard';
import CreditsCard from './CreditsCard';
import MediaGallery, { MediaGalleryRecord } from './MediaGallery';
import ExamplePreview, { ExampleItem } from './ExampleGallery';

interface GeneratorLayoutProps {
  // 头部模型选择器
  headerContent?: ReactNode;
  // 左侧表单内容
  formContent: ReactNode;
  // 生成按钮配置
  onGenerate: () => void;
  generateButtonText?: string;
  generateButtonClassName?: string;
  requiredCredits?: number;
  // 加载状态
  isLoading?: boolean;
  progress?: number;
  progressText?: string;
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
  results?: MediaGalleryRecord;
  // 示例配置
  examples?: ExampleItem[];
  onSelectExample?: (example: ExampleItem) => void;
  enableSelectExample?: boolean; // 是否启用"使用示例"功能，默认为 true
  // 模型信息
  modelName?: string;
}

export default function GeneratorLayout({
  headerContent,
  formContent,
  onGenerate,
  generateButtonText,
  generateButtonClassName = 'w-full rounded-xl px-6 py-3 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base gradient-bg',
  requiredCredits,
  isLoading = false,
  progress = 0,
  progressText,
  error,
  credits,
  isCreditsLoading,
  onCreditsRefresh,
  results,
  examples,
  onSelectExample,
  enableSelectExample = true,
  modelName,
}: GeneratorLayoutProps) {
  const tGenerate = useTranslations('ai-generator.generate');
  const tAuth = useTranslations('auth');

  const { data: session } = useCachedSession();
  const { openLoginModal } = useModalStore();

  // 处理生成按钮点击
  const handleGenerateClick = () => {
    if (!session) {
      openLoginModal();
      return;
    }

    // 调用谷歌广告转换追踪
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      // 根据模型名称获取对应的转换配置
      const conversionConfig = getConversionConfig(modelName);

      // 如果没有匹配的转换配置，直接执行生成
      if (!conversionConfig) {
        console.log('No conversion config matched, direct generation', { model: modelName });
        // onGenerate();
        return;
      }

      const callback = () => {
        // onGenerate();
      };

      const conversionData: any = {
        'send_to': conversionConfig.conversionId,
        'event_callback': callback,
        'value': conversionConfig.value,
        'currency': 'CNY',
      };

      (window as any).gtag('event', 'conversion', conversionData);

      console.log('Generation event triggered', {
        model: modelName,
        conversionId: conversionConfig.conversionId,
        value: conversionConfig.value
      });
    } else {
      console.log('gtag conversion event not triggered');
      // 如果 gtag 不可用，直接执行
      // onGenerate();
    }
  };

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
    if (results && results.items.length > 0) {
      return <MediaGallery {...results} />;
    }

    // 显示示例
    if (examples && examples.length > 0 && onSelectExample) {
      return (
        <ExamplePreview
          examples={examples}
          onSelectExample={onSelectExample}
          autoPlayInterval={0}
          enableSelectExample={enableSelectExample}
        />
      );
    }

    // 默认空状态
    return null;
  };

  // 渲染生成按钮
  const renderGeneratingButton = () => {
    // 用户未登录
    if (!session) {
      return (
        <button
          type="button"
          onClick={openLoginModal}
          className={generateButtonClassName}
        >
          {tAuth('loginToGenerate')}
        </button>
      )
    }

    // 生成中...
    if (isLoading) {
      return (
        <button
          type="button"
          className={generateButtonClassName}
        >
          {progressText || tGenerate('generating', { progress })}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleGenerateClick}
        className={generateButtonClassName}
      >
        {generateButtonText || tGenerate('generateImage', { credits: requiredCredits || 0 })}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      {/* 左右布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧 - 表单区域 */}
        <div className="space-y-4" data-form-container>
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
              {renderGeneratingButton()}
              {session && credits !== undefined && (
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
