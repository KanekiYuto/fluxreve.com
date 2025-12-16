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

interface ZImageGeneratorProps {
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
];

const EXAMPLES: ExampleItem[] = [
  {
    id: '1',
    thumbnail: '/material/models/z-image/08dc49c7-1873-41a3-b368-17706ad303a3.jpeg',
    prompt: 'Wong Kar-wai film style, a lonely man smoking a cigarette in a narrow Hong Kong hallway, 1990s. Greenish fluorescent lighting, heavy shadows, moody atmosphere. Slight motion blur to create a dreamlike quality. Film grain, vignetting, emotional, cinematic composition, dutch angle shot.',
    tags: ['film-style', 'moody', 'retro'],
  },
];

// ==================== 主组件 ====================

export default function ZImageGenerator({ modelSelector, defaultParameters, onFormStateChange }: ZImageGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  // 使用持久化表单状态 Hook
  const { state, updateState } = usePersistentFormState('z-image', {
    prompt: defaultParameters?.prompt || '',
    size: defaultParameters?.size || '1024*1024',
    seed: defaultParameters?.seed || '',
    isPrivate: false,
  });

  // 从持久化状态中解包各个字段
  const prompt = state.prompt || '';
  const size = state.size || '1024*1024';
  const seed = state.seed || '';
  const isPrivate = state.isPrivate || false;

  // 使用 WebHook 生成器 Hook
  const generator = useWebHookGenerator({
    apiEndpoint: '/api/ai-generator/provider/wavespeed/z-image/turbo',
    serviceType: 'text-to-image',
    serviceSubType: 'z-image',
    statusEndpoint: '/api/ai-generator/status',
    pollingConfig: {
      interval: 500,
      timeout: 300000,
    },
    buildRequestBody: (params) => ({
      prompt: params.prompt,
      size: params.size,
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
      seed: requestBody.seed,
    }),
    currentParams: {
      prompt,
      size,
      seed,
      isPrivate,
    },
  });

  // 通知父组件表单状态变化，用于自动保存到 sessionStorage
  useEffect(() => {
    if (onFormStateChange) {
      onFormStateChange({
        prompt,
        size,
        seed,
        isPrivate,
      });
    }
  }, [prompt, size, seed, isPrivate]);

  // ==================== 事件处理函数 ====================

  const handleSelectExample = useCallback((example: ExampleItem) => {
    updateState({ prompt: example.prompt });
  }, [updateState]);

  const handleGenerate = useCallback(() => {
    generator.handleGenerate(
      {
        prompt,
        size,
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
  }, [generator, prompt, size, seed, isPrivate, tError, updateState]);

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
      modelName="z-image"
    />
  );
}
