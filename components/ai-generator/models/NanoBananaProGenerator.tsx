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
type Resolution = '1k' | '2k' | '4k';
type OutputFormat = 'png' | 'jpg';

interface NanoBananaProGeneratorProps {
  modelSelector: React.ReactNode;
  defauldMode?: Mode;
  defaultParameters?: any;
  onFormStateChange?: (state: any) => void;
}

// ==================== 常量配置 ====================

const ASPECT_RATIO_VALUES = [
  { value: '1:1', width: 1024, height: 1024 },
  { value: '16:9', width: 1344, height: 768 },
  { value: '9:16', width: 768, height: 1344 },
  { value: '4:3', width: 1152, height: 896 },
  { value: '3:4', width: 896, height: 1152 },
  { value: '21:9', width: 1536, height: 640 },
] as const;

const RESOLUTION_OPTIONS = [
  { value: '1k', label: '1K' },
  { value: '2k', label: '2K' },
  { value: '4k', label: '4K' },
];

const OUTPUT_FORMAT_OPTIONS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
];

const EXAMPLES: ExampleItem[] = [
  {
    id: '1',
    thumbnail: '/material/models/nano-banana-pro/401001f3-5834-4de4-ba30-f2438b8538eb.webp ',
    prompt: 'Ultra-realistic U.S. one-dollar bill with Elon Musk as the central engraved portrait, traditional dollar engraving linework, micro-details, authentic paper texture, realistic wear and tear, cinematic lighting, 8K, sharp focus',
    tags: ['currency', 'portrait', 'photorealistic'],
  },
];

// ==================== 主组件 ====================

export default function NanoBananaProGenerator({ modelSelector, defauldMode = 'text-to-image', defaultParameters, onFormStateChange }: NanoBananaProGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  // 模式状态
  const [mode, setMode] = useState<Mode>(defauldMode);

  // 使用持久化表单状态 Hook
  const { state, updateState } = usePersistentFormState('nano-banana-pro', {
    prompt: defaultParameters?.prompt || '',
    inputImages: defaultParameters?.images
      ? defaultParameters.images.map((url: string, index: number) => ({
        id: `image-${index}`,
        url,
        file: null,
      }))
      : [],
    aspectRatio: defaultParameters?.aspect_ratio || '1:1',
    seed: defaultParameters?.seed || '',
    resolution: (defaultParameters?.resolution || '1k') as Resolution,
    outputFormat: (defaultParameters?.output_format || 'png') as OutputFormat,
    isPrivate: false,
  });

  // 从持久化状态中解包各个字段
  const prompt = state.prompt || '';
  const inputImages = state.inputImages || [];
  const aspectRatio = state.aspectRatio || '1:1';
  const seed = state.seed || '';
  const resolution = state.resolution || '1k';
  const outputFormat = state.outputFormat || 'png';
  const isPrivate = state.isPrivate || false;

  // 使用 WebHook 生成器 Hook
  const generator = useWebHookGenerator({
    apiEndpoint: mode === 'text-to-image'
      ? '/api/ai-generator/provider/wavespeed/nano-banana-pro/text-to-image'
      : '/api/ai-generator/provider/wavespeed/nano-banana-pro/image-to-image',
    serviceType: mode,
    serviceSubType: 'nano-banana-pro',
    statusEndpoint: '/api/ai-generator/status',
    pollingConfig: {
      interval: 500,
      timeout: 300000,
    },
    buildRequestBody: (params) => ({
      prompt: params.prompt,
      aspect_ratio: params.aspect_ratio,
      resolution: params.resolution,
      seed: params.seed ? parseInt(params.seed, 10) : -1,
      output_format: params.output_format,
      images: params.images,
      enable_base64_output: false,
      enable_sync_mode: false,
      is_private: params.isPrivate,
    }),
    processResponse: (results) => (results || []).map((item: any) =>
      typeof item === 'string' ? item : item.url
    ),
    extractCreditsParams: (requestBody) => ({
      aspect_ratio: requestBody.aspect_ratio,
      resolution: requestBody.resolution,
      seed: requestBody.seed,
    }),
    currentParams: {
      prompt,
      aspect_ratio: aspectRatio,
      resolution,
      seed,
      output_format: outputFormat,
      images: mode === 'image-to-image' ? inputImages.map((img) => img.url) : undefined,
      isPrivate,
    },
  });

  // 通知父组件表单状态变化，用于自动保存到 sessionStorage
  useEffect(() => {
    if (onFormStateChange) {
      onFormStateChange({
        prompt,
        inputImages,
        aspectRatio,
        seed,
        resolution,
        outputFormat,
        isPrivate,
      });
    }
  }, [prompt, inputImages, aspectRatio, seed, resolution, outputFormat, isPrivate]);

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
        aspect_ratio: aspectRatio,
        resolution,
        seed,
        output_format: outputFormat,
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
  }, [generator, mode, prompt, aspectRatio, resolution, seed, outputFormat, inputImages, isPrivate, tError, updateState]);

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

      {/* 图片生图模式：输入图片上传 */}
      {mode === 'image-to-image' && (
        <ImageUpload
          value={inputImages}
          onChange={(images) => updateState({ inputImages: images })}
          label={tForm('uploadImage')}
          maxCount={5}
          required
          id="inputImages"
          modelName="nano-banana-pro"
          generatorType="image-to-image"
        />
      )}

      {/* 分辨率选择 */}
      <FormSelect
        id="resolution"
        label={tForm('resolution')}
        value={resolution}
        onChange={(value) => updateState({ resolution: value as Resolution })}
        options={RESOLUTION_OPTIONS}
        placeholder={tForm('resolutionPlaceholder')}
      />

      {/* 高级选项 */}
      <AdvancedSettings isPrivate={isPrivate} onPrivateChange={(value) => updateState({ isPrivate: value })}>
        {/* 宽高比选择 */}
        <FormSelect
          id="aspectRatio"
          label={tForm('aspectRatio')}
          value={aspectRatio}
          onChange={(value) => updateState({ aspectRatio: value })}
          options={ASPECT_RATIO_VALUES.map((ratio) => ({
            value: ratio.value,
            label: tForm(`aspectRatios.${ratio.value}`)
          }))}
          placeholder={tForm('aspectRatioPlaceholder')}
        />

        {/* 输出格式选择 */}
        <FormSelect
          id="outputFormat"
          label={tForm('outputFormat')}
          value={outputFormat}
          onChange={(value) => updateState({ outputFormat: value as OutputFormat })}
          options={OUTPUT_FORMAT_OPTIONS}
          placeholder={tForm('outputFormatPlaceholder')}
        />

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
      results={generator.results}
      examples={EXAMPLES}
      onSelectExample={handleSelectExample}
      modelName="nano-banana-pro"
    />
  );
}