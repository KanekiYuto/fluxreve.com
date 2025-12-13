/**
 * Wavespeed API 同步请求处理
 * 用于处理需要直接返回结果的同步请求（如图片放大）
 * 不存储任务到数据库，直接返回 API 响应
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAvailableQuota, consumeQuota } from '@/lib/quota';
import { getRequiredCredits, TaskType } from '@/config/ai-generator';

// ==================== 类型定义 ====================

/**
 * 参数处理回调函数的返回结果
 */
export interface ProcessSyncParamsResult {
  /** 用于积分计算的参数 */
  creditsParams: Record<string, any>;
  /** 发送给第三方 API 的参数 */
  apiParams: Record<string, any>;
  /** 配额消费描述 */
  description: string;
}

/**
 * 参数处理回调函数
 */
export type ProcessSyncParamsCallback = (
  body: any
) => Promise<ProcessSyncParamsResult | NextResponse> | ProcessSyncParamsResult | NextResponse;

/**
 * API 响应处理回调函数
 * 直接返回 API 响应内容
 */
export type HandleAPIResponseCallback = (
  response: any
) => NextResponse;

/**
 * Wavespeed 同步请求处理配置
 */
export interface HandleWavespeedSyncRequestConfig {
  /** API 端点路径 (例如: 'wavespeed-ai/image-upscaler') */
  endpoint: string;
  /** 任务类型 */
  taskType: TaskType;
  /** 模型名称 */
  model: string;
  /** 参数处理回调函数 */
  processParams: ProcessSyncParamsCallback;
  /** API 响应处理回调函数 */
  handleResponse?: HandleAPIResponseCallback;
}

// ==================== 主处理函数 ====================

/**
 * 处理 Wavespeed 同步 API 请求
 *
 * 处理流程:
 * 1. 解析请求参数
 * 2. 通过回调函数处理参数
 * 3. 验证用户会话
 * 4. 检查配额
 * 5. 调用 API
 * 6. 消费配额
 * 7. 返回 API 响应
 *
 * @param request Next.js 请求对象
 * @param config 处理配置
 * @returns API 响应
 */
export async function handleWavespeedSyncRequest(
  request: NextRequest,
  config: HandleWavespeedSyncRequestConfig
): Promise<NextResponse> {
  const { endpoint, taskType, model, processParams, handleResponse } = config;

  try {
    // 1. 解析请求参数
    const body = await request.json();

    // 2. 通过回调函数处理参数
    const processResult = await processParams(body);

    // 如果回调返回错误响应，直接返回
    if (processResult instanceof NextResponse) {
      return processResult;
    }

    const { creditsParams, apiParams, description } = processResult;

    // 3. 验证用户会话
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

    // 4. 检查配额
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

    // 5. 调用 API
    const apiKey = process.env.WAVESPEED_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Wavespeed API key not configured' },
        { status: 500 }
      );
    }

    const baseUrl = 'https://api.wavespeed.ai/api/v3';
    const apiUrl = `${baseUrl}/${endpoint}`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(apiParams),
    });

    // 如果 API 调用失败，直接返回错误
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('Wavespeed API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.error?.message || 'Wavespeed API request failed',
        },
        { status: apiResponse.status }
      );
    }

    const apiResponseData = await apiResponse.json();

    // 6. 消费配额
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

    // 7. 返回响应
    if (handleResponse) {
      return handleResponse(apiResponseData);
    }

    // 默认响应处理
    return NextResponse.json({
      success: true,
      data: apiResponseData,
    });
  } catch (error) {
    console.error('Sync request handling error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
