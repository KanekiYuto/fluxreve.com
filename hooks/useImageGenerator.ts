import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { MediaItem, TaskInfo } from '@/components/ai-generator/base/MediaGallery';
import { useCredits } from '@/hooks/useCredits';

// ==================== 类型定义 ====================

export interface ErrorState {
  title: string;
  message: string;
  variant?: 'error' | 'credits';
  creditsInfo?: { required: number; current: number };
}

export interface UseImageGeneratorOptions {
  /** 轮询间隔(毫秒),默认 2000ms */
  pollingInterval?: number;
  /** 自定义验证函数 */
  validateForm?: () => ErrorState | null;
}

export interface GenerateParams {
  /** API 端点 */
  endpoint: string;
  /** 请求参数 */
  body: Record<string, any>;
  /** 当前提示词(用于任务信息展示) */
  currentPrompt: string;
}

// ==================== Hook ====================

/**
 * AI 图像生成通用 Hook
 * 处理生成状态、轮询、错误处理等通用逻辑
 */
export function useImageGenerator(options: UseImageGeneratorOptions = {}) {
  const { pollingInterval = 2000, validateForm } = options;
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<MediaItem[]>([]);
  const [taskInfo, setTaskInfo] = useState<TaskInfo | undefined>(undefined);
  const [error, setError] = useState<ErrorState | undefined>(undefined);

  // 积分管理
  const { credits, isLoading: isCreditsLoading, refresh: refreshCredits } = useCredits();

  // ==================== 轮询任务状态 ====================

  const pollTaskStatus = useCallback(
    async (taskId: string, currentPrompt: string) => {
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
          setGeneratedImages(
            results.map((item: any, index: number) => ({
              id: `${Date.now()}-${index}`,
              url: item.url,
              type: 'image',
            }))
          );

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
          setTimeout(() => pollTaskStatus(taskId, currentPrompt), pollingInterval);
        }
      } catch (err) {
        console.error('Polling error:', err);
        setIsLoading(false);
        setError({
          title: tError('queryStatusFailed'),
          message: err instanceof Error ? err.message : tError('unableToQueryStatus'),
        });
      }
    },
    [pollingInterval, refreshCredits, tError]
  );

  // ==================== 生成图像 ====================

  const generate = useCallback(
    async ({ endpoint, body, currentPrompt }: GenerateParams) => {
      // 重置状态
      setIsLoading(true);
      setProgress(0);
      setGeneratedImages([]);
      setError(undefined);

      try {
        // 调用 API
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to generate image');
        }

        // 开始轮询任务状态
        pollTaskStatus(result.data.task_id, currentPrompt);
      } catch (err) {
        console.error('Generation error:', err);
        setIsLoading(false);
        setError({
          title: tError('generationFailed'),
          message: err instanceof Error ? err.message : tError('imageGenerationFailed'),
        });
      }
    },
    [pollTaskStatus, tError]
  );

  // ==================== 重置状态 ====================

  const reset = useCallback(() => {
    setIsLoading(false);
    setProgress(0);
    setGeneratedImages([]);
    setTaskInfo(undefined);
    setError(undefined);
  }, []);

  // ==================== 返回值 ====================

  return {
    // 状态
    isLoading,
    progress,
    generatedImages,
    taskInfo,
    error,
    credits,
    isCreditsLoading,

    // 方法
    generate,
    reset,
    setError,
    refreshCredits,
  };
}
