/**
 * Fal AI API 专用请求处理
 * 负责: Fal AI API 调用、配置管理
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleRequest, ProcessParamsCallback } from './handleRequest';
import { TaskType } from '@/config/ai-generator';
import { fal } from '@fal-ai/client';

// ==================== 配置常量 ====================

/** Fal AI API 基础配置 */
const FAL_CONFIG = {
  apiKey: process.env.FAL_API_KEY,
  webhookBaseUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL,
  provider: 'fal',
} as const;

// ==================== 类型定义 ====================

/**
 * Fal AI API 响应
 */
export interface FalResponse {
  request_id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  output?: {
    images?: Array<{ url: string }>;
  };
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Fal 请求处理配置
 */
export interface HandleFalRequestConfig {
  /** API 端点路径 (例如: 'fal-ai/gpt-image-1.5/edit') */
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
 * 处理 Fal AI API 请求
 *
 * @param request Next.js 请求对象
 * @param config Fal 配置
 * @returns API 响应
 */
export async function handleFalRequest(
  request: NextRequest,
  config: HandleFalRequestConfig
): Promise<NextResponse> {
  const { endpoint, taskType, model, processParams } = config;

  // 验证环境变量
  const { apiKey, webhookBaseUrl, provider } = FAL_CONFIG;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Fal API key not configured' },
      { status: 500 }
    );
  }

  if (!webhookBaseUrl) {
    return NextResponse.json(
      { success: false, error: 'Webhook URL not configured' },
      { status: 500 }
    );
  }

  // 配置 Fal AI 客户端
  fal.config({
    credentials: apiKey,
  });

  // 使用通用处理器处理请求
  return handleRequest(request, {
    taskType,
    model,
    provider,
    processParams,

    // Fal AI API 调用回调
    callAPI: async (apiParams, taskId) => {
      try {
        // 构建 webhook URL
        const webhookUrl = `${webhookBaseUrl}/api/ai-generator/webhook/fal/${taskId}`;

        // 调用 Fal AI API
        const { request_id } = await fal.queue.submit(endpoint, {
          input: apiParams,
          webhookUrl,
        });

        return {
          success: true,
          requestId: request_id,
        };
      } catch (error) {
        console.error('Fal AI API call error:', error);
        return {
          success: false,
          error: NextResponse.json(
            {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to call Fal AI API',
            },
            { status: 500 }
          ),
        };
      }
    },
  });
}
