'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayout from '../base/GeneratorLayout';
import { ExampleItem } from '../base/ExampleGallery';
import AdvancedSettings from '../base/AdvancedSettings';
import FormSelect from '../form/FormSelect';
import SeedInput from '../form/SeedInput';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWebHookGenerator } from '@/hooks/useWebHookGenerator';
import { usePersistentFormState } from '@/hooks/useGeneratorFormPersistence';

// ==================== 类型定义 ====================

interface FluxSchnellGeneratorProps {
  modelSelector: React.ReactNode;
  defaultParameters?: any;
  onFormStateChange?: (state: any) => void;
}

// ==================== 常量配置 ====================

const SIZE_OPTIONS = [
  { value: '1024*1024', label: '1024×1024 (1:1)' },
  { value: '1024*768', label: '1024×768 (4:3)' },
  { value: '768*1024', label: '768×1024 (3:4)' },
  { value: '1344*768', label: '1344×768 (16:9)' },
  { value: '768*1344', label: '768×1344 (9:16)' },
  { value: '1536*1024', label: '1536×1024 (3:2)' },
  { value: '1024*1536', label: '1024×1536 (2:3)' },
];

const NUM_IMAGES_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
];

const EXAMPLES: ExampleItem[] = [
  {
    id: '1',
    thumbnail: '/material/models/flux-schnell/66d18a4b-723c-4c9e-b5fe-f6811213ef2b.webp',
    prompt: 'A glamorous young woman with long, wavy blonde hair and smokey eye makeup, posing in a luxury hotel room. She\'s wearing a sparkly gold cocktail dress and holding up a white card with "FluxReve" written on it in elegant calligraphy. Soft, flattering lighting enhances her radiant complexion.',
    tags: ['portrait', 'photorealistic', 'professional'],
  },
];

// ==================== 主组件 ====================

export default function FluxSchnellGenerator({ modelSelector, defaultParameters, onFormStateChange }: FluxSchnellGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  // 使用持久化表单状态 Hook
  const { state, updateState } = usePersistentFormState('flux-schnell', {
    prompt: defaultParameters?.prompt || '',
    size: defaultParameters?.size || '1024*1024',
    numImages: defaultParameters?.numImages || '1',
    seed: defaultParameters?.seed || '',
    isPrivate: false,
  });

  // 从持久化状态中解包各个字段
  const prompt = state.prompt || '';
  const size = state.size || '1024*1024';
  const numImages = state.numImages || '1';
  const seed = state.seed || '';
  const isPrivate = state.isPrivate || false;

  // 使用 WebHook 生成器 Hook
  const generator = useWebHookGenerator({
    apiEndpoint: '/api/ai-generator/provider/wavespeed/flux-schnell/text-to-image',
    serviceType: 'text-to-image',
    serviceSubType: 'flux-schnell',
    statusEndpoint: '/api/ai-generator/status',
    pollingConfig: {
      interval: 500,
      timeout: 300000,
    },
    buildRequestBody: (params) => ({
      prompt: params.prompt,
      size: params.size,
      num_images: parseInt(params.numImages, 10),
      seed: params.seed ? parseInt(params.seed, 10) : -1,
      enable_base64_output: false,
      enable_sync_mode: false,
      is_private: params.isPrivate,
    }),
    processResponse: (results) => (results || []).map((item: any) =>
      typeof item === 'string' ? item : item.url
    ),
    extractCreditsParams: (requestBody) => ({
      size: requestBody.size,
      num_images: requestBody.num_images,
      seed: requestBody.seed,
    }),
    currentParams: {
      prompt,
      size,
      numImages,
      seed,
      isPrivate,
    },
  });

  // 通知父组件表单状态变化
  useEffect(() => {
    onFormStateChange?.({
      prompt,
      size,
      numImages,
      seed,
      isPrivate,
    });
  }, [prompt, size, numImages, seed, isPrivate]);

  // 当 defaultParameters 变化时更新表单状态
  useEffect(() => {
    if (defaultParameters) {
      const updates: any = {};

      if (defaultParameters.prompt) updates.prompt = defaultParameters.prompt;
      if (defaultParameters.size) updates.size = defaultParameters.size;
      if (defaultParameters.numImages) updates.numImages = defaultParameters.numImages;
      if (defaultParameters.seed) updates.seed = defaultParameters.seed;

      if (Object.keys(updates).length > 0) {
        updateState(updates);
      }
    }
  }, [defaultParameters, updateState]);

  // ==================== 事件处理函数 ====================

  // 选择示例
  const handleSelectExample = useCallback((example: ExampleItem) => {
    updateState({ prompt: example.prompt });
  }, [updateState]);

  // 生成图像
  const handleGenerate = useCallback(() => {
    generator.handleGenerate(
      {
        prompt,
        size,
        numImages,
        seed,
        isPrivate,
      },
      {
        validateCredits: true,
        customValidation: (params: any) => {
          if (!params.prompt.trim()) {
            return {
              type: 'validation_error',
              title: tError('parameterError'),
              message: tError('promptRequired'),
            };
          }

          return null;
        },
      }
    );
  }, [generator, prompt, size, numImages, seed, isPrivate, tError]);

  // ==================== 渲染函数 ====================

  const formContent = (
    <div className="space-y-6">
      {/* 提示词输入 */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium">
          {tForm('prompt')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => updateState({ prompt: e.target.value })}
          placeholder={tForm('promptPlaceholder')}
          className="h-32 resize-none"
        />
      </div>

      {/* 尺寸选择 */}
      <FormSelect
        id="size"
        label={tForm('size')}
        value={size}
        onChange={(value) => updateState({ size: value })}
        options={SIZE_OPTIONS}
        placeholder={tForm('sizePlaceholder')}
      />

      {/* 生成数量 */}
      <FormSelect
        id="numImages"
        label={tForm('numImages')}
        value={numImages}
        onChange={(value) => updateState({ numImages: value })}
        options={NUM_IMAGES_OPTIONS}
        placeholder={tForm('selectPlaceholder')}
      />

      {/* 高级选项 */}
      <AdvancedSettings isPrivate={isPrivate} onPrivateChange={(value) => updateState({ isPrivate: value })}>
        <SeedInput value={seed} onChange={(value) => updateState({ seed: value })} />
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
      credits={generator.credits}
      isCreditsLoading={generator.creditsLoading}
      onCreditsRefresh={generator.refreshCredits}
      results={generator.results}
      examples={EXAMPLES}
      onSelectExample={handleSelectExample}
    />
  );
}
