'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayoutWrapper from '../base/GeneratorLayoutWrapper';
import { ExampleItem } from '../base/ExampleGallery';
import AdvancedSettings from '../base/AdvancedSettings';
import FormSelect from '../form/FormSelect';
import ImageUpload, { ImageItem } from '../form/ImageUpload';
import ModeSwitcher from '../form/ModeSwitcher';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWebHookGenerator } from '@/hooks/useWebHookGenerator';
import { usePersistentFormState } from '@/hooks/useGeneratorFormPersistence';

// ==================== 类型定义 ====================

type Mode = 'text-to-image' | 'image-to-image';

interface SeedreamGeneratorProps {
  modelSelector: React.ReactNode;
  defauldMode?: Mode;
  defaultParameters?: any;
  onFormStateChange?: (state: any) => void;
}

// ==================== 常量配置 ====================

const SIZE_OPTIONS = [
  { value: '2048*2048', label: '2048×2048 (1:1)' },
  { value: '1024*1024', label: '1024×1024 (1:1)' },
  { value: '2048*1536', label: '2048×1536 (4:3)' },
  { value: '1536*2048', label: '1536×2048 (3:4)' },
  { value: '2048*1152', label: '2048×1152 (16:9)' },
  { value: '1152*2048', label: '1152×2048 (9:16)' },
  { value: '2048*1365', label: '2048×1365 (3:2)' },
  { value: '1365*2048', label: '1365×2048 (2:3)' },
];

const EXAMPLES: ExampleItem[] = [
  {
    id: '1',
    thumbnail: '/material/models/seedream-v4.5/9db03d1f-303f-48f1-8f50-35387938358e.jpeg',
    prompt: 'Draw the following system of two linear equations in two variables and their corresponding solution steps on the blackboard: 5x + 2y = 26; 2x - y = 5.',
    tags: ['education', 'math', 'text-render'],
  },
];

// ==================== 主组件 ====================

export default function SeedreamGenerator({ modelSelector, defauldMode = 'text-to-image', defaultParameters, onFormStateChange }: SeedreamGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  // 模式状态
  const [mode, setMode] = useState<Mode>(defauldMode);

  // 表单状态（使用持久化）
  const { state, updateState } = usePersistentFormState('seedream-v4.5', {
    prompt: defaultParameters?.prompt || '',
    inputImages: defaultParameters?.images
      ? defaultParameters.images.map((url: string, index: number) => ({
          id: `image-${index}`,
          url,
          file: null,
        }))
      : [],
    size: defaultParameters?.size || '2048*2048',
    isPrivate: false,
  });

  // 从 state 中提取表单字段
  const { prompt, inputImages, size, isPrivate } = state;

  // 使用 WebHook 生成器 Hook
  const generator = useWebHookGenerator({
    apiEndpoint: mode === 'text-to-image'
      ? '/api/ai-generator/provider/wavespeed/seedream-v4.5/text-to-image'
      : '/api/ai-generator/provider/wavespeed/seedream-v4.5/image-to-image',
    serviceType: mode,
    serviceSubType: 'seedream-v4.5',
    statusEndpoint: '/api/ai-generator/status',
    pollingConfig: {
      interval: 500,
      timeout: 300000,
    },
    buildRequestBody: (params) => ({
      prompt: params.prompt,
      size: params.size,
      images: params.images,
      enable_base64_output: false,
      enable_sync_mode: false,
      is_private: params.isPrivate,
    }),
    processResponse: (results) => (results || []).map((item: any) =>
      typeof item === 'string' ? item : item.url
    ),
    extractCreditsParams: (requestBody) => ({
      size: requestBody.size,
    }),
    currentParams: {
      prompt,
      size,
      images: mode === 'image-to-image' ? inputImages.map((img) => img.url) : undefined,
      isPrivate,
    },
  });

  // 通知父组件表单状态变化
  useEffect(() => {
    if (onFormStateChange) {
      onFormStateChange(state);
    }
  }, [state]);


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
        images: mode === 'image-to-image' ? inputImages.map((img) => img.url) : undefined,
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

          if (mode === 'image-to-image' && inputImages.length === 0) {
            return {
              type: 'validation_error',
              title: tError('parameterError'),
              message: 'Please upload at least one input image',
            };
          }

          return null;
        },
      }
    );
  }, [generator, mode, prompt, size, inputImages, isPrivate, updateState, tError]);

  // ==================== 渲染函数 ====================

  const formContent = (
    <div className="space-y-6">
      {/* 模式切换 */}
      <ModeSwitcher mode={mode} onModeChange={setMode} />

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

      {/* 图生图模式：输入图片上传 */}
      {mode === 'image-to-image' && (
        <ImageUpload
          value={inputImages}
          onChange={(images) => updateState({ inputImages: images })}
          label={tForm('uploadImage')}
          maxCount={5}
          required
          id="inputImages"
          modelName="seedream"
          generatorType="image-to-image"
        />
      )}

      {/* 尺寸选择（仅文生图模式） */}
      {mode === 'text-to-image' && (
        <FormSelect
          id="size"
          label={tForm('size')}
          value={size}
          onChange={(value) => updateState({ size: value })}
          options={SIZE_OPTIONS}
          placeholder={tForm('sizePlaceholder')}
        />
      )}

      {/* 高级选项 */}
      <AdvancedSettings isPrivate={isPrivate} onPrivateChange={(value) => updateState({ isPrivate: value })}>
        {/* Seedream 暂无额外高级选项 */}
        <></>
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

