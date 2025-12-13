/**
 * WebHook 生成器通用 Hook
 * 用于抽象所有基于 Webhook 的生成器的共同逻辑（需要轮询）
 * 参考：E:\fooocus.one\hooks\useWebHookGenerator.js
 */

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useCredits } from '@/hooks/useCredits';
import { getRequiredCredits } from '@/config/ai-generator';

// ==================== 类型定义 ====================

export interface WebHookGeneratorConfig {
  /** API 端点 URL */
  apiEndpoint: string;
  /** 任务类型（'text-to-image', 'image-to-image' 等） */
  serviceType: string;
  /** 服务子类型（用于积分计算） */
  serviceSubType: string;
  /** 状态查询端点（用于轮询） */
  statusEndpoint: string;
  /** 轮询配置 */
  pollingConfig?: {
    interval?: number;
    timeout?: number;
  };
  /** 自定义构建请求体的函数 */
  buildRequestBody?: (params: any) => Record<string, any>;
  /** 自定义处理响应的函数 */
  processResponse?: (response: any) => any[];
  /** 从请求体提取积分参数的函数 */
  extractCreditsParams?: (requestBody: Record<string, any>) => Record<string, any>;
  /** 当前表单参数（用于实时计算所需积分） */
  currentParams?: any;
}

export interface ErrorInfo {
  type: string;
  title: string;
  message: string;
  [key: string]: any;
}

// ==================== Hook ====================

/**
 * WebHook 生成器通用 Hook
 *
 * 用法：
 * ```typescript
 * const generator = useWebHookGenerator({
 *   apiEndpoint: '/api/ai-generator/provider/wavespeed/flux-2-pro/text-to-image',
 *   serviceType: 'text-to-image',
 *   serviceSubType: 'flux-2-pro',
 *   statusEndpoint: '/api/ai-generator/status',
 *   getQuantity: () => 1,
 * });
 *
 * const onGenerate = () => {
 *   generator.handleGenerate({
 *     prompt: 'A beautiful sunset',
 *     size: '1024*1024',
 *   });
 * };
 * ```
 */
export function useWebHookGenerator(config: WebHookGeneratorConfig) {
  const {
    apiEndpoint,
    serviceType,
    serviceSubType,
    statusEndpoint,
    pollingConfig = {},
    buildRequestBody,
    processResponse,
    extractCreditsParams,
    currentParams,
  } = config;

  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [taskInfo, setTaskInfo] = useState<any>(null);

  const { credits, isLoading: creditsLoading, refresh: refreshCredits } = useCredits();

  // 实时计算所需积分
  const requiredCredits = useMemo(() => {
    if (!currentParams) return 0;
    const requestBody = buildRequestBody ? buildRequestBody(currentParams) : currentParams;
    const creditsParams = extractCreditsParams ? extractCreditsParams(requestBody) : {};
    return getRequiredCredits(serviceType as any, serviceSubType, creditsParams);
  }, [currentParams, buildRequestBody, extractCreditsParams, serviceType, serviceSubType]);

  // ==================== 轮询状态 ====================

  const pollStatus = useCallback(
    async (taskId: string) => {
      const { interval = 500, timeout = 300000 } = pollingConfig;
      const maxAttempts = Math.ceil(timeout / interval);
      let attempts = 0;

      const poll = async (): Promise<boolean> => {
        try {
          const response = await fetch(`${statusEndpoint}/${taskId}`);
          const statusResult = await response.json();

          if (!response.ok) {
            throw new Error(statusResult.error || 'Failed to query status');
          }

          const statusData = statusResult.data;
          const { status, progress: taskProgress, results } = statusData;

          // 更新进度
          if (taskProgress !== undefined) {
            setProgress(taskProgress);
          }

          // 任务完成
          if (status === 'completed' && results) {
            const media = processResponse ? processResponse(results) : results;
            console.log(media)
            setGeneratedImages(media);
            setTaskInfo((prev: any) => ({
              ...prev,
              completed_at: new Date().toISOString(),
            }));
            setProgress(100);
            setIsLoading(false);
            refreshCredits();
            return true;
          }

          // 任务失败
          if (status === 'failed') {
            setIsLoading(false);
            setProgress(0);
            throw new Error(statusData.error || 'Generation failed');
          }

          // 处理中/队列中 - 继续轮询
          attempts++;
          if (attempts >= maxAttempts) {
            throw new Error('Polling timeout');
          }

          // 动态计算进度
          const baseProgress = status === 'queued' ? 5 : 15;
          const progressValue = Math.min(90, baseProgress + (attempts / maxAttempts) * 75);
          setProgress(Math.round(progressValue * 100) / 100);

          await new Promise(resolve => setTimeout(resolve, interval));
          return poll();
        } catch (err) {
          console.error('Polling error:', err);
          setIsLoading(false);
          setProgress(0);
          setErrorInfo({
            type: 'polling_error',
            title: tError('queryStatusFailed'),
            message: err instanceof Error ? err.message : tError('unableToQueryStatus'),
          });
          return true;
        }
      };

      return poll();
    },
    [statusEndpoint, pollingConfig, tError, refreshCredits]
  );

  // ==================== 执行生成 ====================

  const performGeneration = useCallback(
    async (params: any) => {
      try {
        setErrorInfo(null);
        setIsLoading(true);
        setProgress(10);
        setGeneratedImages([]);

        // 构建请求体
        const requestBody = buildRequestBody ? buildRequestBody(params) : params;

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        // 处理错误响应
        if (!response.ok) {
          throw new Error(result.error || 'Failed to generate');
        }

        if (!result.success) {
          throw new Error(result.error || 'Failed to generate');
        }

        refreshCredits();

        // 设置任务信息
        const taskData = {
          task_id: result.data?.task_id,
          prompt: currentParams?.prompt || '',
          created_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          duration_ms: null,
        };

        // 处理同步响应（立即完成）
        const syncResults = result.data?.results;
        if (result.data && syncResults && result.data.status === 'completed') {
          console.log('Generation completed immediately');

          const media = processResponse ? processResponse(syncResults) : syncResults;

          setGeneratedImages(media);
          setTaskInfo(taskData);
          setProgress(100);
          setIsLoading(false);
          refreshCredits();
          setErrorInfo(null);
        }
        // 处理异步响应（需要轮询）
        else if (result.success && result.data?.task_id) {
          setProgress(20);
          setTaskInfo(taskData);
          console.log('Generation started with taskId:', result.data.task_id);

          await pollStatus(result.data.task_id);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error generating:', error);
        setErrorInfo({
          type: 'generation_failed',
          title: tError('generationFailed'),
          message: error instanceof Error ? error.message : tError('imageGenerationFailed'),
        });
        setProgress(0);
        setIsLoading(false);
      }
    },
    [apiEndpoint, buildRequestBody, processResponse, pollStatus, tError, refreshCredits]
  );

  // ==================== 主生成处理器 ====================

  const handleGenerate = useCallback(
    async (params: any, validators: any = {}) => {
      const {
        validateCredits = true,
        customValidation,
      } = validators;

      // 检查积分
      if (validateCredits) {
        if (credits !== null && credits < requiredCredits) {
          setErrorInfo({
            type: 'insufficient_credits',
            title: tError('insufficientCredits'),
            message: tError('pleaseRecharge'),
          });
          return;
        }
      }

      // 自定义验证
      if (customValidation) {
        const validationError = customValidation(params);
        if (validationError) {
          setErrorInfo(validationError);
          return;
        }
      }

      try {
        await performGeneration(params);
      } catch (error) {
        console.error('Error in handleGenerate:', error);
        setErrorInfo({
          type: 'generation_failed',
          title: tError('generationFailed'),
          message: error instanceof Error ? error.message : tError('imageGenerationFailed'),
        });
      }
    },
    [tError, performGeneration, credits, serviceType, serviceSubType, buildRequestBody, extractCreditsParams]
  );

  // ==================== 返回值 ====================

  return {
    // 状态
    generatedImages,
    isLoading,
    progress,
    errorInfo,
    requiredCredits,
    taskInfo,

    // Store 状态
    credits,
    creditsLoading,

    // 方法
    handleGenerate,
    performGeneration,
    pollStatus,
    refreshCredits,
    setGeneratedImages,
    setErrorInfo,
  };
}
