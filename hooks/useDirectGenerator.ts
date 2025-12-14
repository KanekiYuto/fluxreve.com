/**
 * Direct 生成器通用 Hook
 * 用于抽象所有直接返回结果的生成器的共同逻辑（无需轮询）
 * 参考：E:\fooocus.one\hooks\useDirectGenerator.js
 */

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useCredits } from '@/hooks/useCredits';
import { getRequiredCredits } from '@/config/ai-generator';

// ==================== 类型定义 ====================

export interface DirectGeneratorConfig {
  /** API 端点 URL */
  apiEndpoint: string;
  /** 任务类型（'text-to-image', 'image-to-image' 等） */
  serviceType: string;
  /** 服务子类型（用于积分计算） */
  serviceSubType: string;
  /** 自定义构建请求体的函数 */
  buildRequestBody?: (params: any) => Record<string, any>;
  /** 自定义处理响应的函数 */
  processResponse?: (response: any) => any[];
  /** 从请求体提取积分参数的函数 */
  extractCreditsParams?: (requestBody: Record<string, any>) => Record<string, any>;
  /** 当前表单参数（用于实时计算所需积分） */
  currentParams?: any;
  /** 进度条更新间隔（毫秒） */
  progressInterval?: number;
  /** 进度条步进值（0-100） */
  progressStep?: number;
  /** 进度条最大值（0-100） */
  progressMax?: number;
}

export interface ErrorInfo {
  type: string;
  title: string;
  message: string;
  [key: string]: any;
}

// ==================== Hook ====================

/**
 * Direct 生成器通用 Hook
 *
 * 用法：
 * ```typescript
 * const generator = useDirectGenerator({
 *   apiEndpoint: '/api/ai-generator/provider/wavespeed/image-upscaler',
 *   serviceType: 'image-upscaler',
 *   serviceSubType: 'wavespeed-image-upscaler',
 * });
 *
 * const onGenerate = () => {
 *   generator.handleGenerate({
 *     image: imageUrl,
 *     target_resolution: '2k',
 *   });
 * };
 * ```
 */
export function useDirectGenerator(config: DirectGeneratorConfig) {
  const {
    apiEndpoint,
    serviceType,
    serviceSubType,
    buildRequestBody,
    processResponse,
    extractCreditsParams,
    currentParams,
    progressInterval = 500,
    progressStep = 10,
    progressMax = 90,
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

  // ==================== 执行生成 ====================

  const performGeneration = useCallback(
    async (params: any) => {
      let progressIntervalId: NodeJS.Timeout | null = null;

      try {
        setErrorInfo(null);
        setIsLoading(true);
        setProgress(0);
        setGeneratedImages([]);

        // 启动进度条动画
        progressIntervalId = setInterval(() => {
          setProgress(prev => {
            if (prev >= progressMax) {
              if (progressIntervalId) {
                clearInterval(progressIntervalId);
              }
              return progressMax;
            }
            return prev + progressStep;
          });
        }, progressInterval);

        // 构建请求体
        const requestBody = buildRequestBody ? buildRequestBody(params) : params;

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        // 清除进度条
        if (progressIntervalId) {
          clearInterval(progressIntervalId);
        }

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

        // 处理成功响应
        let media: string[] = [];

        if (processResponse) {
          // 使用自定义响应处理函数
          media = processResponse(result.data?.results || []);
        } else {
          // 默认处理逻辑
          const results = result.data?.results || [];
          media = results.map((item: any) =>
            typeof item === 'string' ? item : item.url
          ).filter(Boolean);
        }

        if (media.length > 0) {
          setGeneratedImages(media);
          setTaskInfo(taskData);
          setProgress(100);
          setIsLoading(false);
          refreshCredits();
          setErrorInfo(null);
        } else {
          throw new Error('No media generated');
        }
      } catch (error) {
        console.error('Error generating:', error);

        if (progressIntervalId) {
          clearInterval(progressIntervalId);
        }

        setErrorInfo({
          type: 'generation_failed',
          title: tError('generationFailed'),
          message: error instanceof Error ? error.message : tError('imageGenerationFailed'),
        });
        setProgress(0);
        setIsLoading(false);
      }
    },
    [
      apiEndpoint,
      buildRequestBody,
      processResponse,
      progressInterval,
      progressStep,
      progressMax,
      tError,
      refreshCredits,
    ]
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
            variant: 'credits',
            creditsInfo: {
              required: requiredCredits,
              current: credits,
            },
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
    refreshCredits,
    setGeneratedImages,
    setErrorInfo,
  };
}
