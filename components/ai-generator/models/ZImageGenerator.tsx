'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayoutWrapper from '../base/GeneratorLayoutWrapper';
import { ExampleItem } from '../base/ExampleGallery';
import AdvancedSettings from '../base/AdvancedSettings';
import FormSelect from '../form/FormSelect';
import SeedInput from '../form/SeedInput';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWebHookGenerator } from '@/hooks/useWebHookGenerator';

// ==================== 类型定义 ====================

interface ZImageGeneratorProps {
  modelSelector: React.ReactNode;
  defaultParameters?: any;
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

export default function ZImageGenerator({ modelSelector, defaultParameters }: ZImageGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  const [prompt, setPrompt] = useState(defaultParameters?.prompt || '');
  const [size, setSize] = useState(defaultParameters?.size || '1024*1024');
  const [seed, setSeed] = useState(defaultParameters?.seed || '');
  const [isPrivate, setIsPrivate] = useState(false);

  // 当 defaultParameters 变化时更新表单状态
  useEffect(() => {
    if (defaultParameters) {
      if (defaultParameters.prompt) setPrompt(defaultParameters.prompt);
      if (defaultParameters.size) setSize(defaultParameters.size);
      if (defaultParameters.seed) setSeed(defaultParameters.seed);
    }
  }, [defaultParameters]);

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

  // ==================== 事件处理函数 ====================

  const handleSelectExample = useCallback((example: ExampleItem) => {
    setPrompt(example.prompt);
  }, []);

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
  }, [generator, prompt, size, seed, isPrivate, tError]);

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
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={tForm('promptPlaceholder')}
          className="h-32 resize-none"
        />
      </div>

      {/* 尺寸选择 */}
      <FormSelect
        id="size"
        label={tForm('size')}
        value={size}
        onChange={setSize}
        options={SIZE_OPTIONS}
        placeholder={tForm('sizePlaceholder')}
      />

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
