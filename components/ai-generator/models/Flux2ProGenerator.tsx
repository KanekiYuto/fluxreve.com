'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayout from '../base/GeneratorLayout';
import { ExampleItem } from '../base/ExampleGallery';
import AdvancedSettings from '../base/AdvancedSettings';
import FormSelect from '../form/FormSelect';
import SeedInput from '../form/SeedInput';
import ImageUpload, { ImageItem } from '../form/ImageUpload';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRequiredCredits } from '@/hooks/useRequiredCredits';
import { useImageGenerator, ErrorState } from '@/hooks/useImageGenerator';

// ==================== 类型定义 ====================

type Mode = 'text-to-image' | 'image-to-image';

interface Flux2ProGeneratorProps {
  modelSelector: React.ReactNode;
  defauldMode?: Mode;
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

export default function Flux2ProGenerator({ modelSelector, defauldMode = 'text-to-image' }: Flux2ProGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  // 模式状态
  const [mode, setMode] = useState<Mode>(defauldMode);

  // 表单状态
  const [prompt, setPrompt] = useState('');
  const [inputImages, setInputImages] = useState<ImageItem[]>([]);
  const [size, setSize] = useState('1024*1024');
  const [seed, setSeed] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  // 积分计算 - Flux 2 Pro 固定 25 积分
  const requiredCredits = useRequiredCredits(mode, 'flux-2-pro', {
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

    // 图生图模式需要至少一张输入图片
    if (mode === 'image-to-image' && inputImages.length === 0) {
      return {
        title: tError('parameterError'),
        message: 'Please upload at least one input image',
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
  }, [prompt, mode, inputImages, credits, requiredCredits, tError]);

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

    // 根据模式选择不同的 API 端点
    const endpoint =
      mode === 'text-to-image'
        ? '/api/ai-generator/provider/wavespeed/flux-2-pro/text-to-image'
        : '/api/ai-generator/provider/wavespeed/flux-2-pro/image-to-image';

    // 构建请求参数
    const body: Record<string, any> = {
      prompt,
      enable_base64_output: false,
      enable_sync_mode: false,
      is_private: isPrivate,
    };

    // 文生图模式的参数
    if (mode === 'text-to-image') {
      body.size = size;
    }

    // 图生图模式的参数
    if (mode === 'image-to-image') {
      body.images = inputImages.map((img) => img.url);
    }

    // 如果设置了 seed，添加到参数中
    if (seed) {
      body.seed = parseInt(seed, 10);
    }

    // 调用生成方法
    await generate({
      endpoint,
      body,
      currentPrompt: prompt,
    });
  }, [mode, prompt, size, seed, inputImages, isPrivate, validateForm, setError, generate]);

  // ==================== 渲染函数 ====================

  const formContent = (
    <div className="space-y-6">
      {/* 模式切换 Tab */}
      <div className="flex gap-1 p-1 bg-[#161618] border border-[#27272A] rounded-lg">
        <button
          type="button"
          onClick={() => setMode('text-to-image')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${mode === 'text-to-image'
            ? 'bg-primary text-white shadow-sm'
            : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
            }`}
        >
          {tForm('mode.textToImage')}
        </button>
        <button
          type="button"
          onClick={() => setMode('image-to-image')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${mode === 'image-to-image'
            ? 'bg-primary text-white shadow-sm'
            : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]'
            }`}
        >
          {tForm('mode.imageToImage')}
        </button>
      </div>

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

