'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayoutWrapper from '../base/GeneratorLayoutWrapper';
import { ExampleItem } from '../base/ExampleGallery';
import AdvancedSettings from '../base/AdvancedSettings';
import FormSelect from '../form/FormSelect';
import SeedInput from '../form/SeedInput';
import LoraSelector, { LoraConfig } from '../base/LoraSelector';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWebHookGenerator } from '@/hooks/useWebHookGenerator';
import { usePersistentFormState } from '@/hooks/useGeneratorFormPersistence';

// ==================== 类型定义 ====================

interface ZImageLoraGeneratorProps {
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
  { value: '1024*1536', label: '1024×1536 (2:3)' },
  { value: '1536*1024', label: '1536×1024 (3:2)' },
];

const EXAMPLES: ExampleItem[] = [
  {
    id: '1',
    thumbnail: '/material/models/z-image-lora/5bea9816-d8ec-4952-88e9-7e6f33f4402a.jpeg',
    prompt: 'A high-resolution portrait photograph of a young East Asian woman with short, dark, layered hair and soft, expressive eyes, captured in a moody, intimate setting. She wears a black sleeveless top with delicate lace detailing and a thin gold necklace, her gaze fixed directly at the camera with a subtle, contemplative expression. The shallow depth of field blurs the background, which hints at festive or party lighting with warm glows and indistinct shapes, emphasizing her as the sole focus. The lighting is soft and directional, highlighting her facial features with a cinematic, naturalistic quality. A close-up, medium shot with a slightly low angle, evoking a moody, stylish, and emotionally resonant atmosphere.',
    tags: [],
  },
];

// ==================== 主组件 ====================

export default function ZImageLoraGenerator({ modelSelector, defaultParameters, onFormStateChange }: ZImageLoraGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  // 使用持久化表单状态 Hook
  const { state, updateState } = usePersistentFormState('z-image-lora', {
    prompt: defaultParameters?.prompt || '',
    size: defaultParameters?.size || '1024*1536',
    seed: defaultParameters?.seed || '',
    loras: [],
    isPrivate: false,
  });

  // 从持久化状态中解包各个字段
  const prompt = state.prompt || '';
  const size = state.size || '1024*1536';
  const seed = state.seed || '';
  const loras = state.loras || [];
  const isPrivate = state.isPrivate || false;

  // 使用 WebHook 生成器 Hook
  const generator = useWebHookGenerator({
    apiEndpoint: '/api/ai-generator/provider/wavespeed/z-image/turbo-lora',
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
      loras: params.loras,
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
      loras,
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
        loras,
        isPrivate,
      });
    }
  }, [prompt, size, seed, loras, isPrivate]);

  // ==================== LoRA 管理函数 ====================

  // 更新 LoRA 配置
  const handleLoraChange = useCallback((newLoras: LoraConfig[]) => {
    updateState({ loras: newLoras });
  }, [updateState]);

  // ==================== 事件处理函数 ====================

  // 选择示例
  const handleSelectExample = useCallback((example: ExampleItem) => {
    updateState({ prompt: example.prompt });
  }, [updateState]);

  // 生成图像
  const handleGenerate = useCallback(() => {
    // 转换 LoRA 配置格式，只传递 ID 和 scale，其他信息由后端查询
    const lorasForApi = loras.map((lora: LoraConfig) => ({
      id: lora.id,
      scale: lora.scale,
    }));

    generator.handleGenerate(
      {
        prompt,
        size,
        seed,
        loras: lorasForApi,
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
  }, [generator, prompt, size, seed, loras, isPrivate, tError, updateState]);

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

      {/* LoRA 配置 */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          LoRA {tForm('configuration')}
        </Label>
        <LoraSelector
          model="z-image-lora"
          selected={loras}
          onChange={handleLoraChange}
        />
      </div>

      {/* 高级选项 */}
      <AdvancedSettings isPrivate={isPrivate} onPrivateChange={(value) => updateState({ isPrivate: value })}>
        <SeedInput value={seed} onChange={(value) => updateState({ seed: value })} />
      </AdvancedSettings>
    </div>
  );

  // ==================== 主渲染 ====================

  return (
    <GeneratorLayoutWrapper
      modelSelector={modelSelector}
      formContent={formContent}
      onGenerate={handleGenerate}
      examples={EXAMPLES}
      onSelectExample={handleSelectExample}
      generator={generator}
    />
  );
}

