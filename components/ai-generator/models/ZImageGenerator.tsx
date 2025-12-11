'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayout from '../base/GeneratorLayout';
import { ExampleItem } from '../base/ExampleGallery';
import AdvancedSettings from '../base/AdvancedSettings';
import FormSelect from '../form/FormSelect';
import SeedInput from '../form/SeedInput';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRequiredCredits } from '@/hooks/useRequiredCredits';
import { useImageGenerator, ErrorState } from '@/hooks/useImageGenerator';

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

  // 表单状态
  const [prompt, setPrompt] = useState(defaultParameters?.prompt || '');
  const [size, setSize] = useState(defaultParameters?.size || '1024*1024');
  const [seed, setSeed] = useState(defaultParameters?.seed || '');
  const [isPrivate, setIsPrivate] = useState(true);

  // 积分计算 - Z-Image Turbo 固定 5 积分
  const requiredCredits = useRequiredCredits('text-to-image', 'z-image', {
    size,
    seed,
  });

  // 使用通用图像生成 Hook
  const {
    isLoading,
    progress,
    generatedImages,
    taskInfo,
    error,
    credits,
    isCreditsLoading,
    generate,
    setError,
    refreshCredits,
  } = useImageGenerator();

  // 验证表单
  const validateForm = useCallback((): ErrorState | null => {
    if (!prompt.trim()) {
      return {
        title: tError('parameterError'),
        message: tError('promptRequired'),
      };
    }

    if (credits !== null && credits < requiredCredits) {
      return {
        title: tError('insufficientCredits'),
        message: tError('pleaseRecharge'),
        variant: 'credits',
        creditsInfo: {
          required: requiredCredits,
          current: credits,
        },
      };
    }

    return null;
  }, [prompt, credits, requiredCredits, tError]);

  // ==================== 事件处理函数 ====================

  // 选择示例
  const handleSelectExample = useCallback((example: ExampleItem) => {
    setPrompt(example.prompt);
  }, []);

  // 生成图像
  const handleGenerate = useCallback(async () => {
    // 表单验证
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // 构建请求参数
    const body: Record<string, any> = {
      prompt,
      size,
      enable_base64_output: false,
      enable_sync_mode: false,
      is_private: isPrivate,
    };

    // 如果设置了 seed，添加到参数中
    if (seed) {
      body.seed = parseInt(seed, 10);
    }

    // 调用生成方法
    await generate({
      endpoint: '/api/ai-generator/provider/wavespeed/z-image/turbo',
      body,
      currentPrompt: prompt,
    });
  }, [prompt, size, seed, isPrivate, validateForm, setError, generate]);

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
    <GeneratorLayout
      headerContent={modelSelector}
      formContent={formContent}
      onGenerate={handleGenerate}
      requiredCredits={requiredCredits}
      isLoading={isLoading}
      progress={progress}
      error={error}
      credits={credits}
      isCreditsLoading={isCreditsLoading}
      onCreditsRefresh={refreshCredits}
      generatedItems={generatedImages}
      taskInfo={taskInfo}
      examples={EXAMPLES}
      onSelectExample={handleSelectExample}
    />
  );
}
