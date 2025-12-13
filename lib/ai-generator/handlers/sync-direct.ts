/**
 * 同步直接 Handler
 * 处理直接返回结果、无需轮询的同步请求
 * 用于：image-upscaler 等快速完成的任务
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAvailableQuota, consumeQuota } from '@/lib/quota';
import { getRequiredCredits } from '@/config/ai-generator';
import { standardizeAndRespond } from '../response-standardizer';

// ==================== 类型定义 ====================

export interface ProcessSyncParamsResult {
  creditsParams: Record<string, any>;
  apiParams: Record<string, any>;
  description: string;
}

export interface SyncDirectConfig {
  /** API 端点路径 */
  endpoint: string;
  /** 任务类型 */
  taskType: string;
  /** 模型名称 */
  model: string;
  /** 参数处理回调函数 */
  processParams: (body: any) => ProcessSyncParamsResult | NextResponse;
  /** 可选：自定义响应处理 */
  handleResponse?: (apiResponse: any) => NextResponse;
  /** 可选：自定义错误处理 */
  handleError?: (error: any) => NextResponse;
  /** API Base URL */
  apiBaseUrl?: string;
  /** API Key */
  apiKey?: string;
}

// ==================== 主处理函数 ====================

/**
 * 处理同步直接请求
 *
 * 流程：
 * 1. 验证参数
 * 2. 检查用户会话
 * 3. 检查配额
 * 4. 调用 API
 * 5. 消费配额
 * 6. 标准化并返回响应（无需创建任务记录）
 *
 * @param request Next.js 请求对象
 * @param config 处理配置
 * @returns API 响应
 */
export async function handleSyncDirect(
  request: NextRequest,
  config: SyncDirectConfig
): Promise<NextResponse> {
  const {
    endpoint,
    taskType,
    model,
    processParams,
    handleResponse,
    handleError,
    apiBaseUrl = 'https://api.wavespeed.ai/api/v3',
    apiKey = process.env.WAVESPEED_API_KEY,
  } = config;

  try {
    // ==================== 1. 解析请求参数 ====================

    const body = await request.json();

    // ==================== 2. 参数处理 ====================

    const processResult = await processParams(body);

    // 如果回调返回错误响应，直接返回
    if (processResult instanceof NextResponse) {
      return processResult;
    }

    const { creditsParams, apiParams, description } = processResult;

    // ==================== 3. 验证用户会话 ====================

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // ==================== 4. 检查配额 ====================

    const requiredCredits = getRequiredCredits(taskType, model, creditsParams);
    const availableCredits = await getAvailableQuota(userId);

    if (availableCredits < requiredCredits) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient credits',
          required: requiredCredits,
          available: availableCredits,
        },
        { status: 400 }
      );
    }

    // ==================== 5. 调用 API ====================

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    const apiUrl = `${apiBaseUrl}/${endpoint}`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(apiParams),
    });

    // API 调用失败
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('API error:', errorData);

      if (handleError) {
        return handleError(errorData);
      }

      return NextResponse.json(
        {
          success: false,
          error: errorData.error?.message || 'API request failed',
        },
        { status: apiResponse.status }
      );
    }

    const apiResponseData = await apiResponse.json();

    // ==================== 6. 消费配额 ====================

    const consumeResult = await consumeQuota(userId, requiredCredits, description);

    if (!consumeResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: consumeResult.error || 'Failed to consume quota',
        },
        { status: 500 }
      );
    }

    // ==================== 7. 返回响应 ====================

    if (handleResponse) {
      return handleResponse(apiResponseData);
    }

    // 默认：使用标准化响应
    return standardizeAndRespond(apiResponseData, {
      provider: 'wavespeed',
      model,
    });
  } catch (error) {
    console.error('Sync direct handler error:', error);

    if (handleError) {
      return handleError(error);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * 同步直接响应格式
 */
export interface SyncDirectResponse {
  success: true;
  data: {
    results: Array<{
      url: string;
      type: 'image';
    }>;
    metadata: {
      task_id: string;
      duration_ms?: number;
      [key: string]: any;
    };
  };
}
