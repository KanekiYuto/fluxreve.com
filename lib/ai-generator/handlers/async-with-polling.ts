/**
 * 异步轮询 Handler
 * 处理需要返回 task_id 供前端轮询的异步请求
 * 用于：text-to-image, image-to-image 等长时间运行的任务
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleWavespeedRequest } from '../handleWavespeedRequest';

// ==================== 类型定义 ====================

export interface AsyncWithPollingConfig {
  /** API 端点路径 (例如: 'wavespeed-ai/flux-2-pro/text-to-image') */
  endpoint: string;
  /** 任务类型 */
  taskType: string;
  /** 模型名称 */
  model: string;
  /** 参数处理回调函数 */
  processParams: (body: any) => Promise<any> | any;
  /** 可选：自定义错误处理 */
  handleError?: (error: any) => NextResponse;
}

// ==================== 主处理函数 ====================

/**
 * 处理异步轮询请求
 *
 * 流程：
 * 1. 验证参数
 * 2. 检查用户会话
 * 3. 检查配额
 * 4. 调用 API
 * 5. 消费配额
 * 6. 创建任务记录
 * 7. 返回 task_id 供前端轮询
 *
 * @param request Next.js 请求对象
 * @param config 处理配置
 * @returns API 响应
 */
export async function handleAsyncWithPolling(
  request: NextRequest,
  config: AsyncWithPollingConfig
): Promise<NextResponse> {
  const { endpoint, taskType, model, processParams, handleError } = config;

  try {
    // 使用现有的 handleWavespeedRequest
    // 它已经实现了完整的异步轮询流程
    return await handleWavespeedRequest(request, {
      endpoint,
      taskType,
      model,
      processParams,
    });
  } catch (error) {
    console.error('Async with polling handler error:', error);

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
 * 异步轮询响应格式
 */
export interface AsyncWithPollingResponse {
  success: true;
  data: {
    task_id: string;
    share_id: string;
    status: 'pending' | 'processing';
  };
}
