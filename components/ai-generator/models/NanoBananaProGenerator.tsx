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
type Resolution = '1k' | '2k' | '4k';
type OutputFormat = 'png' | 'jpg';

interface NanoBananaProGeneratorProps {
  modelSelector: React.ReactNode;
  defauldMode?: Mode;
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

export default function NanoBananaProGenerator({ modelSelector, defauldMode = 'text-to-image' }: NanoBananaProGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  // 模式状态
  const [mode, setMode] = useState<Mode>(defauldMode);

  // 表单状态
  const [prompt, setPrompt] = useState('');
  const [inputImages, setInputImages] = useState<ImageItem[]>([]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [seed, setSeed] = useState('');
  const [resolution, setResolution] = useState<Resolution>('1k');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [isPrivate, setIsPrivate] = useState(false);

  // 积分计算
  const requiredCredits = useRequiredCredits('text-to-image', 'nano-banana-pro', {
    resolution,
    aspect_ratio: aspectRatio,
    seed,
    output_format: outputFormat,
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

    // 图片生图模式需要至少一张输入图片
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
        ? '/api/ai-generator/provider/wavespeed/nano-banana-pro/text-to-image'
        : '/api/ai-generator/provider/wavespeed/nano-banana-pro/image-to-image';

    // 构建请求参数
    const body: Record<string, any> = {
      prompt,
      output_format: outputFormat,
      is_private: isPrivate,
    };

    // 文生图模式的参数
    if (mode === 'text-to-image') {
      body.aspect_ratio = aspectRatio;
      body.resolution = resolution;
      if (seed) body.seed = seed;
    }

    // 图生图模式的参数
    if (mode === 'image-to-image') {
      body.images = inputImages.map((img) => img.url);
    }

    // 调用生成方法
    await generate({
      endpoint,
      body,
      currentPrompt: prompt,
    });
  }, [mode, prompt, aspectRatio, resolution, outputFormat, seed, inputImages, isPrivate, validateForm, setError, generate]);

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

      {/* 图片生图模式：输入图片上传 */}
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

      {/* 分辨率选择 */}
      <FormSelect
        id="resolution"
        label={tForm('resolution')}
        value={resolution}
        onChange={(value) => setResolution(value as Resolution)}
        options={RESOLUTION_OPTIONS}
        placeholder={tForm('resolutionPlaceholder')}
      />

      {/* 高级选项 */}
      <AdvancedSettings isPrivate={isPrivate} onPrivateChange={setIsPrivate}>
        {/* 宽高比选择 */}
        <FormSelect
          id="aspectRatio"
          label={tForm('aspectRatio')}
          value={aspectRatio}
          onChange={setAspectRatio}
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
          onChange={(value) => setOutputFormat(value as OutputFormat)}
          options={OUTPUT_FORMAT_OPTIONS}
          placeholder={tForm('outputFormatPlaceholder')}
        />

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