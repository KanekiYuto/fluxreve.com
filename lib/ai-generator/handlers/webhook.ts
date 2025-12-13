/**
 * Webhook 处理 Handler
 * 处理来自第三方 API 的 webhook 回调
 * 用于：接收 Wavespeed 异步任务完成通知
 */

import { NextRequest, NextResponse } from 'next/server';

// ==================== 类型定义 ====================

export interface WebhookData {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputs?: string[];
  results?: any[];
  error?: string | null;
  executionTime?: number;
  [key: string]: any;
}

export interface WebhookConfig {
  /** 提供商名称 */
  provider: 'wavespeed' | string;
  /** 参数标准化回调 */
  normalizeParams: (body: any) => WebhookData | NextResponse;
  /** 任务处理回调 */
  handleTask: (taskId: string, data: WebhookData) => Promise<void | NextResponse>;
  /** 可选：验证 webhook 签名 */
  verifySignature?: (request: NextRequest) => Promise<boolean>;
  /** 可选：错误处理 */
  handleError?: (error: any) => NextResponse;
}

// ==================== 主处理函数 ====================

/**
 * 处理 Webhook 请求
 *
 * 流程：
 * 1. 验证 webhook 签名（可选）
 * 2. 标准化 webhook 数据
 * 3. 处理任务（可能是长时间操作）
 * 4. 立即返回成功（不阻塞）
 *
 * @param request Next.js 请求对象
 * @param taskId 任务 ID（从 URL 参数获取）
 * @param config 处理配置
 * @returns API 响应
 */
export async function handleWebhook(
  request: NextRequest,
  taskId: string,
  config: WebhookConfig
): Promise<NextResponse> {
  const { provider, normalizeParams, handleTask, verifySignature, handleError } = config;

  try {
    // ==================== 1. 验证签名 ====================

    if (verifySignature) {
      const isValid = await verifySignature(request);
      if (!isValid) {
        console.warn(`Invalid webhook signature from ${provider}`);
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // ==================== 2. 解析并标准化数据 ====================

    const body = await request.json();
    const normalizeResult = await normalizeParams(body);

    // 如果标准化返回错误响应，直接返回
    if (normalizeResult instanceof NextResponse) {
      return normalizeResult;
    }

    const webhookData = normalizeResult;

    // ==================== 3. 处理任务 ====================

    // 立即返回成功，后台异步处理任务
    // 这样确保 webhook 不会因为处理时间过长而超时
    setImmediate(async () => {
      try {
        const result = await handleTask(taskId, webhookData);

        // 如果 handleTask 返回 NextResponse，说明发生错误
        if (result instanceof NextResponse) {
          console.error(`Error handling task ${taskId}:`, await result.json());
        }
      } catch (error) {
        console.error(`Error in background task handling for ${taskId}:`, error);
      }
    });

    // ==================== 4. 立即返回成功 ====================

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Webhook handler error for ${provider}/${taskId}:`, error);

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
 * Wavespeed webhook 数据标准化
 */
export function normalizeWavespeedWebhookData(body: any): WebhookData {
  return {
    id: body.id,
    status: body.status || 'processing',
    outputs: body.outputs,
    error: body.error || null,
    executionTime: body.executionTime,
  };
}

/**
 * Webhook 处理的通用流程（可供具体实现使用）
 *
 * 典型用法：
 * ```typescript
 * const result = await executeWebhookTask(taskId, webhookData, async (task, data) => {
 *   if (data.status === 'completed') {
 *     await transferImages(task, data.outputs);
 *     await updateTaskStatus(taskId, 'completed');
 *   } else if (data.status === 'failed') {
 *     await refundCredits(task.userId, task.creditsConsumed);
 *     await updateTaskStatus(taskId, 'failed');
 *   }
 * });
 * ```
 */
export async function executeWebhookTask(
  taskId: string,
  webhookData: WebhookData,
  execute: (taskId: string, data: WebhookData) => Promise<void>
): Promise<void> {
  try {
    await execute(taskId, webhookData);
  } catch (error) {
    console.error(`Error executing webhook task ${taskId}:`, error);
    throw error;
  }
}
