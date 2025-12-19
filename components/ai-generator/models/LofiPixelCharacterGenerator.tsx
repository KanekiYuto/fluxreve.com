'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayout from '../base/GeneratorLayout';
import { ExampleItem } from '../base/ExampleGallery';
import AdvancedSettings from '../base/AdvancedSettings';
import ImageUpload, { ImageItem } from '../form/ImageUpload';
import { useWebHookGenerator } from '@/hooks/useWebHookGenerator';

// ==================== 类型定义 ====================

interface LofiPixelCharacterGeneratorProps {
  modelSelector: React.ReactNode;
}

// ==================== 常量配置 ====================

const EXAMPLES: ExampleItem[] = [
  {
    id: '1',
    thumbnail: '/material/models/lofi-pixel-character-mini-card/631bfbb9-d1df-41cb-af6c-0e4e47e36b73.jpg',
    // thumbnail: '/material/models/lofi-pixel-character-mini-card/421dd669-5fa8-441b-a742-306be5907724.jpeg',
    // original: '/material/models/lofi-pixel-character-mini-card/631bfbb9-d1df-41cb-af6c-0e4e47e36b73.jpg',
    prompt: '',
    tags: ['retro', 'professional'],
  },
];

// ==================== 主组件 ====================

export default function LofiPixelCharacterGenerator({
  modelSelector,
}: LofiPixelCharacterGeneratorProps) {

  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');
  const tModels = useTranslations('ai-generator.models');

  // ==================== 状态管理 ====================

  // 表单状态
  const [inputImages, setInputImages] = useState<ImageItem[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

  // 使用 WebHook 生成器 Hook
  const generator = useWebHookGenerator({
    apiEndpoint: '/api/ai-generator/provider/wavespeed/lofi-pixel-character-mini-card',
    serviceType: 'image-effects',
    serviceSubType: 'lofi-pixel-character-mini-card',
    statusEndpoint: '/api/ai-generator/status',
    pollingConfig: {
      interval: 500,
      timeout: 300000,
    },
    buildRequestBody: (params) => ({
      image: params.image,
      enable_base64_output: false,
      is_private: params.isPrivate,
    }),
    processResponse: (results) => (results || []).map((item: any) =>
      typeof item === 'string' ? item : item.url
    ),
    extractCreditsParams: () => ({}),
    currentParams: {
      image: inputImages[0]?.url,
      isPrivate,
    },
  });


  // ==================== 事件处理函数 ====================

  // 生成效果图像
  const handleGenerate = useCallback(() => {
    generator.handleGenerate(
      {
        image: inputImages[0]?.url,
      },
      {
        validateCredits: true,
        customValidation: (params: any) => {
          if (!params.image) {
            return {
              type: 'validation_error',
              title: tError('parameterError'),
              message: tForm('uploadImageRequired'),
            };
          }
          return null;
        },
      }
    );
  }, [generator, inputImages, tError, tForm]);

  // ==================== 渲染函数 ====================

  const formContent = (
    <div className="space-y-6">
      {/* 上传图片 */}
      <ImageUpload
        value={inputImages}
        onChange={setInputImages}
        label={tForm('uploadImage')}
        maxCount={1}
        required
        id="inputImages"
        modelName="lofi-pixel-character"
        generatorType="image-effects"
      />

      {/* 高级选项 */}
      <AdvancedSettings isPrivate={isPrivate} onPrivateChange={setIsPrivate}>
        <></>
      </AdvancedSettings>
    </div>
  );

  // ==================== 主渲染 ====================

  return (
    <GeneratorLayout
      headerContent={modelSelector}
      formContent={formContent}
      onGenerate={handleGenerate}
      requiredCredits={generator.requiredCredits}
      isLoading={generator.isLoading}
      progress={generator.progress}
      error={generator.error}
      results={generator.results}
      examples={EXAMPLES}
      onSelectExample={() => { }}
      enableSelectExample={false}
    />
  );
}
