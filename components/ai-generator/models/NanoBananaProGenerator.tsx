'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayout from '../base/GeneratorLayout';
import { ExampleItem } from '../base/ExampleGallery';
import { MediaItem, TaskInfo } from '../base/MediaGallery';
import AdvancedSettings from '../base/AdvancedSettings';
import FormSelect from '../form/FormSelect';
import SeedInput from '../form/SeedInput';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRequiredCredits } from '@/hooks/useRequiredCredits';
import { useCredits } from '@/hooks/useCredits';

// ==================== 类型定义 ====================

type Resolution = '1k' | '2k' | '4k';

interface NanoBananaProGeneratorProps {
  modelSelector: React.ReactNode;
}

interface ErrorState {
  title: string;
  message: string;
  variant?: 'error' | 'credits';
  creditsInfo?: { required: number; current: number };
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

const EXAMPLES: ExampleItem[] = [
  {
    id: '1',
    thumbnail: '/test/3c3bb2c9-f19e-4f48-b005-c27e475d6bf5.webp',
    prompt: '梦幻的奇幻风景，浮空岛屿，瀑布从云端倾泻而下，神秘的紫色天空，超现实主义风格',
    tags: ['风景', '奇幻', '超现实'],
  },
  {
    id: '2',
    thumbnail: '/test/d9c7dede-2a43-47a4-8fb7-3b591d52864a.webp',
    prompt: '赛博朋克风格的未来都市，霓虹灯闪烁，高楼林立，夜晚下着雨，反光的街道',
    tags: ['城市', '科幻', '赛博朋克'],
  },
];

const POLLING_INTERVAL = 2000; // 2秒轮询间隔

// ==================== 主组件 ====================

export default function NanoBananaProGenerator({ modelSelector }: NanoBananaProGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');
  const tGenerate = useTranslations('ai-generator.generate');

  // ==================== 状态管理 ====================

  // 表单状态
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [seed, setSeed] = useState('');
  const [resolution, setResolution] = useState<Resolution>('1k');

  // 生成状态
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<MediaItem[]>([]);
  const [taskInfo, setTaskInfo] = useState<TaskInfo | undefined>(undefined);
  const [error, setError] = useState<ErrorState | undefined>(undefined);

  // 自定义 Hooks
  const { credits, isLoading: isCreditsLoading, refresh: refreshCredits } = useCredits();
  const requiredCredits = useRequiredCredits('text-to-image', 'nano-banana-pro', {
    resolution,
    aspect_ratio: aspectRatio,
    seed,
  });

  // ==================== 事件处理函数 ====================

  // 选择示例
  const handleSelectExample = useCallback((example: ExampleItem) => {
    setPrompt(example.prompt);
  }, []);

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

  // 轮询任务状态
  const pollTaskStatus = useCallback(async (taskId: string, currentPrompt: string) => {
    try {
      const statusResponse = await fetch(`/api/ai-generator/status/${taskId}`);
      const statusResult = await statusResponse.json();

      if (!statusResult.success) {
        throw new Error(statusResult.error || 'Failed to query status');
      }

      const { status, progress: taskProgress, results, error: taskError } = statusResult.data;

      // 更新进度
      if (taskProgress !== undefined) {
        setProgress(taskProgress);
      }

      if (status === 'completed' && results) {
        // 任务完成
        setIsLoading(false);
        setProgress(100);
        setGeneratedImages(results.map((item: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          url: item.url,
          type: 'image',
        })));

        setTaskInfo({
          task_id: statusResult.data.share_id,
          prompt: currentPrompt,
          created_at: statusResult.data.created_at,
          completed_at: statusResult.data.completed_at,
        });

        // 刷新积分
        refreshCredits();
      } else if (status === 'failed') {
        // 任务失败
        throw new Error(taskError?.message || 'Generation failed');
      } else {
        // 继续轮询
        setTimeout(() => pollTaskStatus(taskId, currentPrompt), POLLING_INTERVAL);
      }
    } catch (err) {
      console.error('Polling error:', err);
      setIsLoading(false);
      setError({
        title: tError('queryStatusFailed'),
        message: err instanceof Error ? err.message : tError('unableToQueryStatus'),
      });
    }
  }, [refreshCredits, tError]);

  // 生成图像
  const handleGenerate = useCallback(async () => {
    // 表单验证
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // 重置状态
    setIsLoading(true);
    setProgress(0);
    setGeneratedImages([]);
    setError(undefined);

    try {
      // 调用文生图 API
      const response = await fetch('/api/ai-generator/provider/wavespeed/nano-banana-pro/text-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspect_ratio: aspectRatio,
          resolution,
          seed: seed || undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate image');
      }

      // 开始轮询任务状态
      pollTaskStatus(result.data.task_id, prompt);
    } catch (err) {
      console.error('Generation error:', err);
      setIsLoading(false);
      setError({
        title: tError('generationFailed'),
        message: err instanceof Error ? err.message : tError('imageGenerationFailed'),
      });
    }
  }, [prompt, aspectRatio, resolution, seed, validateForm, pollTaskStatus, tError]);

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
      <AdvancedSettings>
        <SeedInput value={seed} onChange={setSeed} />
      </AdvancedSettings>
    </div>
  );

  // 生成按钮
  const generateButton = (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={isLoading}
      className="w-full rounded-xl px-6 py-3 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base gradient-bg"
    >
      {isLoading ? tGenerate('generating', { progress }) : tGenerate('generateImage', { credits: requiredCredits })}
    </button>
  );

  // ==================== 主渲染 ====================

  return (
    <GeneratorLayout
      headerContent={modelSelector}
      formContent={formContent}
      generateButton={generateButton}
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
