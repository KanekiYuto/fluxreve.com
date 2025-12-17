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

interface GptImage15GeneratorProps {
  modelSelector: React.ReactNode;
  defauldMode?: Mode;
  defaultParameters?: any;
  onFormStateChange?: (state: any) => void;
}

// ==================== 常量配置 ====================

const IMAGE_SIZE_OPTIONS = [
  { value: '1024x1024', label: '1024×1024 (1:1)' },
  { value: '1536x1024', label: '1536×1024 (3:2)' },
  { value: '1024x1536', label: '1024×1536 (2:3)' },
];

const OUTPUT_FORMAT_OPTIONS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
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
    thumbnail: '/material/models/gpt-image-1.5/bd452c17-8932-4a36-bc11-79e759fbb041.png',
    images: ['https://pub-04d3b22080e84f99972445cc153d93a8.r2.dev/beta/image-to-image/gpt-image-1.5/dae97251-3c72-4bbf-882e-b94656669bc9-1765971884698.png'],
    prompt: 'Same workers, same beam, same lunch boxes - but they\'re all on their phones now. One is taking a selfie. One is on a call looking annoyed. Same danger, new priorities. A hard hat has AirPods.',
  },
];

// ==================== 主组件 ====================

export default function GptImage15Generator({ modelSelector, defauldMode = 'text-to-image', defaultParameters, onFormStateChange }: GptImage15GeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 国际化选项配置 ====================

  const QUALITY_OPTIONS = [
    { value: 'low', label: tForm('qualityOptions.low') },
    { value: 'medium', label: tForm('qualityOptions.medium') },
    { value: 'high', label: tForm('qualityOptions.high') },
  ];

  const BACKGROUND_OPTIONS = [
    { value: 'auto', label: tForm('backgroundOptions.auto') },
    { value: 'transparent', label: tForm('backgroundOptions.transparent') },
    { value: 'opaque', label: tForm('backgroundOptions.opaque') },
  ];

  // ==================== 状态管理 ====================

  // 模式状态
  const [mode, setMode] = useState<Mode>(defauldMode);

  // 使用持久化表单状态 Hook
  const { state, updateState } = usePersistentFormState('gpt-image-1.5', {
    prompt: defaultParameters?.prompt || '',
    inputImages: defaultParameters?.images
      ? defaultParameters.images.map((url: string, index: number) => ({
          id: `image-${index}`,
          url,
          file: null,
        }))
      : [],
    imageSize: defaultParameters?.image_size || '1024x1024',
    background: defaultParameters?.background || 'auto',
    quality: defaultParameters?.quality || 'high',
    numImages: defaultParameters?.num_images || '1',
    outputFormat: defaultParameters?.output_format || 'png',
    seed: defaultParameters?.seed || '',
    isPrivate: false,
  });

  // 从持久化状态中解包各个字段
  const prompt = state.prompt || '';
  const inputImages = state.inputImages || [];
  const imageSize = state.imageSize || '1024x1024';
  const background = state.background || 'auto';
  const quality = state.quality || 'high';
  const numImages = state.numImages || '1';
  const outputFormat = state.outputFormat || 'png';
  const seed = state.seed || '';
  const isPrivate = state.isPrivate || false;

  // 使用 WebHook 生成器 Hook
  const generator = useWebHookGenerator({
    apiEndpoint: mode === 'text-to-image'
      ? '/api/ai-generator/provider/fal/gpt-image-1.5/text-to-image'
      : '/api/ai-generator/provider/fal/gpt-image-1.5/image-to-image',
    serviceType: mode,
    serviceSubType: 'gpt-image-1.5',
    statusEndpoint: '/api/ai-generator/status',
    pollingConfig: {
      interval: 500,
      timeout: 300000,
    },
    buildRequestBody: (params) => {
      const body: any = {
        prompt: params.prompt,
        quality: params.quality,
        size: params.imageSize,
        background: params.background,
        num_images: parseInt(params.numImages, 10),
        output_format: params.outputFormat,
        is_private: params.isPrivate,
      };

      if (params.seed) {
        body.seed = parseInt(params.seed, 10);
      }

      // 图生图模式需要添加 image_urls
      if (mode === 'image-to-image' && params.images) {
        body.image_urls = params.images;
      }

      return body;
    },
    processResponse: (results) => (results || []).map((item: any) =>
      typeof item === 'string' ? item : item.url
    ),
    extractCreditsParams: (requestBody) => ({
      quality: requestBody.quality,
      size: requestBody.size,
      num_images: requestBody.num_images,
    }),
    currentParams: {
      prompt,
      imageSize,
      background,
      quality,
      numImages,
      outputFormat,
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
      imageSize,
      background,
      quality,
      numImages,
      outputFormat,
      seed,
      isPrivate,
    });
  }, [prompt, inputImages, imageSize, background, quality, numImages, outputFormat, seed, isPrivate]);

  // 当 defaultParameters 变化时更新表单状态
  useEffect(() => {
    if (defaultParameters) {
      const updates: any = {};

      if (defaultParameters.prompt) updates.prompt = defaultParameters.prompt;
      if (defaultParameters.image_size) updates.imageSize = defaultParameters.image_size;
      if (defaultParameters.background) updates.background = defaultParameters.background;
      if (defaultParameters.quality) updates.quality = defaultParameters.quality;
      if (defaultParameters.num_images) updates.numImages = String(defaultParameters.num_images);
      if (defaultParameters.output_format) updates.outputFormat = defaultParameters.output_format;
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
    const updates: any = { prompt: example.prompt };

    // 如果示例包含输入图片，也更新输入图片并切换到图生图模式
    if (example.images && example.images.length > 0) {
      updates.inputImages = example.images.map((url, index) => ({
        id: `example-image-${index}`,
        url,
        file: null,
      }));
      setMode('image-to-image');
    }

    updateState(updates);
  }, [updateState]);

  // 生成图像
  const handleGenerate = useCallback(() => {
    generator.handleGenerate(
      {
        prompt,
        imageSize,
        background,
        quality,
        numImages,
        outputFormat,
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
  }, [generator, mode, prompt, imageSize, background, quality, numImages, outputFormat, seed, inputImages, isPrivate, tError]);

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
          modelName="gpt-image-1.5"
          generatorType="image-to-image"
        />
      )}

      {/* 图片尺寸 */}
      <FormSelect
        id="imageSize"
        label={tForm('imageSize')}
        value={imageSize}
        onChange={(value) => updateState({ imageSize: value })}
        options={IMAGE_SIZE_OPTIONS}
        placeholder="Select image size"
      />

      {/* 质量 */}
      <FormSelect
        id="quality"
        label={tForm('quality')}
        value={quality}
        onChange={(value) => updateState({ quality: value })}
        options={QUALITY_OPTIONS}
        placeholder="Select quality"
      />

      {/* 背景 */}
      <FormSelect
        id="background"
        label={tForm('background')}
        value={background}
        onChange={(value) => updateState({ background: value })}
        options={BACKGROUND_OPTIONS}
        placeholder="Select background"
      />

      {/* 高级选项 */}
      <AdvancedSettings isPrivate={isPrivate} onPrivateChange={(value) => updateState({ isPrivate: value })}>
        {/* 生成图片数量 */}
        <FormSelect
          id="numImages"
          label={tForm('numImages')}
          value={numImages}
          onChange={(value) => updateState({ numImages: value })}
          options={NUM_IMAGES_OPTIONS}
          placeholder="Select number of images"
        />

        {/* 输出格式 */}
        <FormSelect
          id="outputFormat"
          label={tForm('outputFormat')}
          value={outputFormat}
          onChange={(value) => updateState({ outputFormat: value })}
          options={OUTPUT_FORMAT_OPTIONS}
          placeholder="Select output format"
        />

        {/* 随机种子 */}
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
      modelName="gpt-image-1.5"
    />
  );
}
