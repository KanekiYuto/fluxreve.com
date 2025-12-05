/**
 * AI 生成器通用请求处理
 * 负责: 认证、配额管理、数据库交互、错误处理
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAvailableQuota, consumeQuota } from '@/lib/quota';
import { getRequiredCredits, TaskType } from '@/config/ai-generator';
import { db } from '@/lib/db';
import { mediaGenerationTask } from '@/lib/db/schema';
import { randomUUID } from 'crypto';
import { generateShareId } from '@/lib/utils/generate-share-id';

// ==================== 类型定义 ====================

/**
 * 参数处理回调函数的返回结果
 */
export interface ProcessParamsResult {
  /** 用于积分计算的参数 */
  creditsParams: Record<string, any>;
  /** 发送给第三方 API 的参数 */
  apiParams: Record<string, any>;
  /** 存储到数据库的参数 */
  dbParams: Record<string, any>;
  /** 配额消费描述 */
  description: string;
}

/**
 * 参数处理回调函数
 * @param body 请求体
 * @returns 处理后的参数或错误响应
 */
export type ProcessParamsCallback = (
  body: any
) => Promise<ProcessParamsResult | NextResponse> | ProcessParamsResult | NextResponse;

/**
 * API 调用回调函数
 * @param apiParams API 参数
 * @param taskId 任务 ID
 * @returns API 响应或错误
 */
export type CallAPICallback = (
  apiParams: Record<string, any>,
  taskId: string
) => Promise<{ success: true; requestId: string } | { success: false; error: NextResponse }>;

/**
 * 通用请求处理配置
 */
export interface HandleRequestConfig {
  /** 任务类型 */
  taskType: TaskType;
  /** 模型名称 */
  model: string;
  /** 服务提供商 */
  provider: string;
  /** 参数处理回调函数 */
  processParams: ProcessParamsCallback;
  /** API 调用回调函数 */
  callAPI: CallAPICallback;
}

// ==================== 主处理函数 ====================

/**
 * 通用 AI 生成请求处理流程
 *
 * 处理流程:
 * 1. 解析请求参数
 * 2. 通过回调函数处理参数
 * 3. 验证用户会话
 * 4. 检查配额
 * 5. 生成任务 ID
 * 6. 通过回调函数调用第三方 API
 * 7. 消费配额
 * 8. 创建任务记录
 * 9. 返回结果
 *
 * @param request Next.js 请求对象
 * @param config 处理配置
 * @returns API 响应
 */
export async function handleRequest(
  request: NextRequest,
  config: HandleRequestConfig
): Promise<NextResponse> {
  const { taskType, model, provider, processParams, callAPI } = config;

  try {
    // 1. 解析请求参数
    const body = await request.json();

    // 2. 通过回调函数处理参数
    const processResult = await processParams(body);

    // 如果回调返回错误响应,直接返回
    if (processResult instanceof NextResponse) {
      return processResult;
    }

    const { creditsParams, apiParams, dbParams, description } = processResult;

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

    // 5. 生成任务 ID
    const taskId = randomUUID();

    // 6. 通过回调函数调用第三方 API
    const apiResult = await callAPI(apiParams, taskId);

    if (!apiResult.success) {
      return apiResult.error;
    }

    // 7. 消费配额
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

    // 8. 创建任务记录
    const shareId = generateShareId(taskType, model);

    await db.insert(mediaGenerationTask).values({
      taskId,
      shareId,
      userId,
      taskType,
      provider,
      providerRequestId: apiResult.requestId,
      model,
      status: 'pending',
      progress: 0,
      parameters: dbParams,
      consumeTransactionId: consumeResult.transactionId!,
      startedAt: new Date(),
    });

    // 9. 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        share_id: shareId,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Request handling error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
