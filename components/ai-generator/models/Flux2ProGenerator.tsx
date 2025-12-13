'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayoutWrapper from '../base/GeneratorLayoutWrapper';
import { ExampleItem } from '../base/ExampleGallery';
import AdvancedSettings from '../base/AdvancedSettings';
import FormSelect from '../form/FormSelect';
import SeedInput from '../form/SeedInput';
import ImageUpload, { ImageItem } from '../form/ImageUpload';
import ModeSwitcher from '../form/ModeSwitcher';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWebHookGenerator } from '@/hooks/useWebHookGenerator';

// ==================== 类型定义 ====================

type Mode = 'text-to-image' | 'image-to-image';

interface Flux2ProGeneratorProps {
  modelSelector: React.ReactNode;
  defauldMode?: Mode;
  defaultParameters?: any;
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

export default function Flux2ProGenerator({ modelSelector, defauldMode = 'text-to-image', defaultParameters }: Flux2ProGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  // 模式状态
  const [mode, setMode] = useState<Mode>(defauldMode);

  // 表单状态
  const [prompt, setPrompt] = useState(defaultParameters?.prompt || '');
  const [inputImages, setInputImages] = useState<ImageItem[]>(
    defaultParameters?.images
      ? defaultParameters.images.map((url: string, index: number) => ({
          id: `image-${index}`,
          url,
          file: null,
        }))
      : []
  );
  const [size, setSize] = useState(defaultParameters?.size || '1024*1024');
  const [seed, setSeed] = useState(defaultParameters?.seed || '');
  const [isPrivate, setIsPrivate] = useState(false);

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

  // 当 defaultParameters 变化时更新表单状态
  useEffect(() => {
    if (defaultParameters) {
      if (defaultParameters.prompt) setPrompt(defaultParameters.prompt);
      if (defaultParameters.size) setSize(defaultParameters.size);
      if (defaultParameters.seed) setSeed(defaultParameters.seed);

      // 处理输入图片
      if (defaultParameters.images && Array.isArray(defaultParameters.images)) {
        const images = defaultParameters.images.map((url: string, index: number) => ({
          id: `image-${index}`,
          url,
          file: null,
        }));
        setInputImages(images);
      }
    }
  }, [defaultParameters]);


  // ==================== 事件处理函数 ====================

  // 选择示例
  const handleSelectExample = useCallback((example: ExampleItem) => {
    setPrompt(example.prompt);
  }, []);

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
  }, [generator, mode, prompt, size, seed, inputImages, isPrivate, tError]);

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
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={tForm('promptPlaceholder')}
          className="h-32 resize-none"
        />
      </div>

      {/* 图生图模式：输入图片上传 */}
      {mode === 'image-to-image' && (
        <ImageUpload
          value={inputImages}
          onChange={setInputImages}
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
          onChange={setSize}
          options={SIZE_OPTIONS}
          placeholder={tForm('sizePlaceholder')}
        />
      )}

      {/* 高级选项 */}
      <AdvancedSettings isPrivate={isPrivate} onPrivateChange={setIsPrivate}>
        <SeedInput value={seed} onChange={setSeed} />
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

