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

// ==================== 类型定义 ====================

type Mode = 'text-to-image' | 'image-to-image';

interface SeedreamGeneratorProps {
  modelSelector: React.ReactNode;
  defauldMode?: Mode;
  defaultParameters?: any;
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

export default function SeedreamGenerator({ modelSelector, defauldMode = 'text-to-image', defaultParameters }: SeedreamGeneratorProps) {
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
  const [size, setSize] = useState(defaultParameters?.size || '2048*2048');
  const [isPrivate, setIsPrivate] = useState(false);

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

  // 当 defaultParameters 变化时更新表单状态
  useEffect(() => {
    if (defaultParameters) {
      if (defaultParameters.prompt) setPrompt(defaultParameters.prompt);
      if (defaultParameters.size) setSize(defaultParameters.size);

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
  }, [generator, mode, prompt, size, inputImages, isPrivate, tError]);

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
          onChange={setSize}
          options={SIZE_OPTIONS}
          placeholder={tForm('sizePlaceholder')}
        />
      )}

      {/* 高级选项 */}
      <AdvancedSettings isPrivate={isPrivate} onPrivateChange={setIsPrivate}>
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

