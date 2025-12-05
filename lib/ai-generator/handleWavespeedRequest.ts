/**
 * Wavespeed API 专用请求处理
 * 负责: Wavespeed API 调用、配置管理
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleRequest, ProcessParamsCallback } from './handleRequest';
import { TaskType } from '@/config/ai-generator';

// ==================== 配置常量 ====================

/** Wavespeed API 基础配置 */
const WAVESPEED_CONFIG = {
  baseUrl: 'https://api.wavespeed.ai/api/v3',
  apiKey: process.env.WAVESPEED_API_KEY,
  webhookBaseUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL,
  provider: 'wavespeed',
} as const;

// ==================== 类型定义 ====================

/**
 * Wavespeed API 响应
 */
export interface WavespeedResponse {
  request_id: string;
  status: string;
  output?: {
    images?: string[];
  };
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Wavespeed 请求处理配置
 */
export interface HandleWavespeedRequestConfig {
  /** API 端点路径 (例如: 'google/nano-banana-pro/text-to-image') */
  endpoint: string;
  /** 任务类型 */
  taskType: TaskType;
  /** 模型名称 */
  model: string;
  /** 参数处理回调函数 */
  processParams: ProcessParamsCallback;
}

// ==================== 主处理函数 ====================

/**
 * 处理 Wavespeed API 请求
 *
 * @param request Next.js 请求对象
 * @param config Wavespeed 配置
 * @returns API 响应
 */
export async function handleWavespeedRequest(
  request: NextRequest,
  config: HandleWavespeedRequestConfig
): Promise<NextResponse> {
  const { endpoint, taskType, model, processParams } = config;

  // 验证环境变量
  const { baseUrl, apiKey, webhookBaseUrl, provider } = WAVESPEED_CONFIG;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Wavespeed API key not configured' },
      { status: 500 }
    );
  }

  if (!webhookBaseUrl) {
    return NextResponse.json(
      { success: false, error: 'Webhook URL not configured' },
      { status: 500 }
    );
  }

  // 构建完整的 API URL
  const apiUrl = `${baseUrl}/${endpoint}`;

  // 使用通用处理器处理请求
  return handleRequest(request, {
    taskType,
    model,
    provider,
    processParams,

    // Wavespeed API 调用回调
    callAPI: async (apiParams, taskId) => {
      try {
        // 构建 webhook URL
        const webhookUrl = `${webhookBaseUrl}/api/ai-generator/webhook/wavespeed/${taskId}`;
        const apiUrlWithWebhook = `${apiUrl}?webhook=${encodeURIComponent(webhookUrl)}`;

        // 调用 Wavespeed API
        const response = await fetch(apiUrlWithWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(apiParams),
        });

        const data: WavespeedResponse = await response.json();

        // 处理 API 错误响应
        if (!response.ok || data.error) {
          console.error('Wavespeed API error:', data.error);
          return {
            success: false,
            error: NextResponse.json(
              {
                success: false,
                error: data.error?.message || 'Failed to call Wavespeed API',
                code: data.error?.code,
              },
              { status: response.status }
            ),
          };
        }

        return {
          success: true,
          requestId: data.request_id,
        };
      } catch (error) {
        console.error('Wavespeed API call error:', error);
        return {
          success: false,
          error: NextResponse.json(
            {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to call Wavespeed API',
            },
            { status: 500 }
          ),
        };
      }
    },
  });
}
