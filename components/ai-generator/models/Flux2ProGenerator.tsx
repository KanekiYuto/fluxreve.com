'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayout from '../base/GeneratorLayout';
import { ExampleItem } from '../base/ExampleGallery';
import AdvancedSettings from '../base/AdvancedSettings';
import FormSelect from '../form/FormSelect';
import SeedInput from '../form/SeedInput';
import ImageUpload, { ImageItem } from '../form/ImageUpload';
import ModeSwitcher from '../form/ModeSwitcher';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWebHookGenerator } from '@/hooks/useWebHookGenerator';
import { usePersistentFormState } from '@/hooks/useGeneratorFormPersistence';

// ==================== 类型定义 ====================

type Mode = 'text-to-image' | 'image-to-image';

interface Flux2ProGeneratorProps {
  modelSelector: React.ReactNode;
  defauldMode?: Mode;
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

const EXAMPLES: ExampleItem[] = [
  {
    id: '1',
    thumbnail: '/material/models/flux-2-pro/76e0cb29-6a67-419a-a5a5-8d9f38daed13.jpg',
    prompt: 'Transform this artwork into a high-end modern art gallery style, inspired by MoMA and Tate Modern aesthetics. Keep the abstract composition but refine the brush textures with realistic acrylic and oil-paint strokes. Use a more minimalist palette with muted beige, charcoal black, deep indigo, and gentle sunset gradients. Increase negative space, enhance balance and visual rhythm, and give the overall piece a curated museum-exhibition feeling. Avoid adding new objects; focus on elevating artistic sophistication.',
    tags: ['art-gallery', 'minimalist', 'professional'],
  },
];

// ==================== 主组件 ====================

export default function Flux2ProGenerator({ modelSelector, defauldMode = 'text-to-image', defaultParameters, onFormStateChange }: Flux2ProGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  // 模式状态
  const [mode, setMode] = useState<Mode>(defauldMode);

  // 使用持久化表单状态 Hook
  const { state, updateState } = usePersistentFormState('flux-2-pro', {
    prompt: defaultParameters?.prompt || '',
    inputImages: defaultParameters?.images
      ? defaultParameters.images.map((url: string, index: number) => ({
          id: `image-${index}`,
          url,
          file: null,
        }))
      : [],
    size: defaultParameters?.size || '1024*1024',
    seed: defaultParameters?.seed || '',
    isPrivate: false,
  });

  // 从持久化状态中解包各个字段
  const prompt = state.prompt || '';
  const inputImages = state.inputImages || [];
  const size = state.size || '1024*1024';
  const seed = state.seed || '';
  const isPrivate = state.isPrivate || false;

  // 使用 WebHook 生成器 Hook
  const generator = useWebHookGenerator({
    apiEndpoint: mode === 'text-to-image'
      ? '/api/ai-generator/provider/wavespeed/flux-2-pro/text-to-image'
      : '/api/ai-generator/provider/wavespeed/flux-2-pro/image-to-image',
    serviceType: mode,
    serviceSubType: 'flux-2-pro',
    statusEndpoint: '/api/ai-generator/status',
    pollingConfig: {
      interval: 500,
      timeout: 300000,
    },
    buildRequestBody: (params) => ({
      prompt: params.prompt,
      size: params.size,
      seed: params.seed ? parseInt(params.seed, 10) : -1,
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
      seed: requestBody.seed,
    }),
    currentParams: {
      prompt,
      size,
      seed,
      images: mode === 'image-to-image' ? inputImages.map((img) => img.url) : undefined,
      isPrivate,
    },
  });

  // 通知父组件表单状态变化
  useEffect(() => {
    onFormStateChange?.({
      prompt,
      inputImages,
      size,
      seed,
      isPrivate,
    });
  }, [prompt, inputImages, size, seed, isPrivate]);

  // 当 defaultParameters 变化时更新表单状态
  useEffect(() => {
    if (defaultParameters) {
      const updates: any = {};

      if (defaultParameters.prompt) updates.prompt = defaultParameters.prompt;
      if (defaultParameters.size) updates.size = defaultParameters.size;
      if (defaultParameters.seed) updates.seed = defaultParameters.seed;

      // 处理输入图片
      if (defaultParameters.images && Array.isArray(defaultParameters.images)) {
        updates.inputImages = defaultParameters.images.map((url: string, index: number) => ({
          id: `image-${index}`,
          url,
          file: null,
        }));
      }

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
        seed,
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
  }, [generator, mode, prompt, size, seed, inputImages, isPrivate, tError, updateState]);

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
          modelName="flux-2-pro"
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
      modelName="flux-2-pro"
    />
  );
}

