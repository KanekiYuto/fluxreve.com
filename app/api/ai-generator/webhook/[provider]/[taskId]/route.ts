import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaGenerationTask } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { refundQuota } from '@/lib/quota';
import { checkImageNSFWWithDetails } from '@/lib/wavespeed';
import { NSFW_CHECK_MODELS } from '@/config/ai-generator';

// 通用任务状态
type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Wavespeed Webhook 格式
interface WavespeedWebhook {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputs?: string[];
  error?: string;
  executionTime?: number;
}

// FAL Webhook 格式（示例）
interface FalWebhook {
  request_id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  images?: Array<{ url: string }>;
  error?: {
    message: string;
    code: string;
  };
}

// 统一的处理结果
interface ProcessedWebhook {
  status: TaskStatus;
  outputs?: string[];
  error?: string;
}

/**
 * 映射 Wavespeed 状态到统一状态
 */
function mapWavespeedStatus(status: WavespeedWebhook['status']): TaskStatus {
  const statusMap: Record<WavespeedWebhook['status'], TaskStatus> = {
    'pending': 'pending',
    'processing': 'processing',
    'completed': 'completed',
    'failed': 'failed',
  };
  return statusMap[status] || 'pending';
}

/**
 * 映射 FAL 状态到统一状态
 */
function mapFalStatus(status: FalWebhook['status']): TaskStatus {
  const statusMap: Record<FalWebhook['status'], TaskStatus> = {
    'IN_QUEUE': 'pending',
    'IN_PROGRESS': 'processing',
    'COMPLETED': 'completed',
    'FAILED': 'failed',
  };
  return statusMap[status] || 'pending';
}

/**
 * 处理 Wavespeed webhook 数据
 */
function processWavespeedWebhook(payload: WavespeedWebhook): ProcessedWebhook {
  return {
    status: mapWavespeedStatus(payload.status),
    outputs: payload.outputs,
    error: payload.error,
  };
}

/**
 * 处理 FAL webhook 数据
 */
function processFalWebhook(payload: FalWebhook): ProcessedWebhook {
  return {
    status: mapFalStatus(payload.status),
    outputs: payload.images?.map(img => img.url),
    error: payload.error?.message,
  };
}

/**
 * 根据 provider 处理 webhook 数据
 */
function processWebhookByProvider(provider: string, payload: any): ProcessedWebhook {
  switch (provider.toLowerCase()) {
    case 'wavespeed':
      return processWavespeedWebhook(payload as WavespeedWebhook);

    case 'fal':
      return processFalWebhook(payload as FalWebhook);

    default:
      // 默认按 Wavespeed 格式处理
      return processWavespeedWebhook(payload as WavespeedWebhook);
  }
}

/**
 * 计算任务耗时（毫秒）
 */
function calculateDuration(startedAt: Date | null): number | null {
  if (!startedAt) return null;
  return Date.now() - new Date(startedAt).getTime();
}

/**
 * 异步执行 NSFW 检查并更新任务
 */
async function performNSFWCheckAsync(taskId: string, imageUrl: string) {
  try {
    console.log(`[NSFW Check] Starting async check for task ${taskId}, image: ${imageUrl}`);

    const nsfwCheckResult = await checkImageNSFWWithDetails(imageUrl);

    // 更新任务的 NSFW 状态
    await db
      .update(mediaGenerationTask)
      .set({
        isNsfw: nsfwCheckResult.isNsfw,
        nsfwDetails: nsfwCheckResult.details,
        updatedAt: new Date(),
      })
      .where(eq(mediaGenerationTask.taskId, taskId));

    console.log(`[NSFW Check] Task ${taskId} completed:`, {
      isNsfw: nsfwCheckResult.isNsfw,
      details: nsfwCheckResult.details,
    });
  } catch (error) {
    console.error(`[NSFW Check] Error for task ${taskId}:`, error);
  }
}

/**
 * 处理任务完成
 */
async function handleTaskCompleted(taskId: string, outputs: string[], startedAt: Date | null, model: string) {
  // 保存所有生成的图片结果
  const results = outputs.map((url) => ({
    url,
    type: 'image',
  }));

  const durationMs = calculateDuration(startedAt);

  // 先快速更新任务状态为完成
  await db
    .update(mediaGenerationTask)
    .set({
      status: 'completed',
      progress: 100,
      results,
      completedAt: new Date(),
      durationMs,
      updatedAt: new Date(),
    })
    .where(eq(mediaGenerationTask.taskId, taskId));

  console.log(
    `Task completed: ${taskId}, duration: ${durationMs}ms, model: ${model}, resultsCount: ${results.length}`
  );

  // 只对配置中指定的模型进行 NSFW 检查
  const shouldCheckNSFW = NSFW_CHECK_MODELS.includes(model as any);

  // 异步执行 NSFW 检查，不阻塞 webhook 响应
  // 这样可以快速响应 webhook（避免超时重试），NSFW 检查在后台完成
  // NSFW 检查可能需要 10+ 秒，如果同步执行会导致：
  // 1. Webhook 响应超时，对方会重试发送
  // 2. 重复的 webhook 会触发重复的 NSFW 检查
  if (shouldCheckNSFW && outputs.length > 0) {
    // 使用 Promise 异步执行，不等待结果
    performNSFWCheckAsync(taskId, outputs[0]).catch((error) => {
      console.error(`[NSFW Check] Async execution failed for task ${taskId}:`, error);
    });
    console.log(`[NSFW Check] Async check scheduled for task ${taskId}`);
  }
}

/**
 * 处理任务失败并退款
 */
async function handleTaskFailed(taskId: string, consumeTransactionId: string | null, startedAt: Date | null, error?: string) {
  const errorMessage = error || 'Unknown error';
  const durationMs = calculateDuration(startedAt);

  // 如果有消费交易，执行退款
  if (consumeTransactionId) {
    const refundResult = await refundQuota(
      consumeTransactionId,
      `Task failed: ${errorMessage}`
    );

    if (refundResult.success) {
      console.log(`Refund successful for task ${taskId}:`, refundResult.transactionId);

      // 更新任务状态并关联退款交易ID
      await db
        .update(mediaGenerationTask)
        .set({
          status: 'failed',
          errorMessage: {
            message: errorMessage,
            code: 'generation_failed',
          },
          refundTransactionId: refundResult.transactionId,
          completedAt: new Date(),
          durationMs,
          updatedAt: new Date(),
        })
        .where(eq(mediaGenerationTask.taskId, taskId));
    } else {
      console.error(`Refund failed for task ${taskId}:`, refundResult.error);

      // 即使退款失败，也要更新任务状态
      await db
        .update(mediaGenerationTask)
        .set({
          status: 'failed',
          errorMessage: {
            message: errorMessage,
            code: 'generation_failed',
            refundError: refundResult.error,
          },
          completedAt: new Date(),
          durationMs,
          updatedAt: new Date(),
        })
        .where(eq(mediaGenerationTask.taskId, taskId));
    }
  } else {
    // 没有消费交易ID，直接标记失败
    await db
      .update(mediaGenerationTask)
      .set({
        status: 'failed',
        errorMessage: {
          message: errorMessage,
          code: 'generation_failed',
        },
        completedAt: new Date(),
        durationMs,
        updatedAt: new Date(),
      })
      .where(eq(mediaGenerationTask.taskId, taskId));
  }

  console.error(`Task failed: ${taskId}, duration: ${durationMs}ms`, errorMessage);
}

/**
 * 处理任务进行中
 */
async function handleTaskProcessing(taskId: string) {
  await db
    .update(mediaGenerationTask)
    .set({
      status: 'processing',
      progress: 50,
      updatedAt: new Date(),
    })
    .where(eq(mediaGenerationTask.taskId, taskId));

  console.log(`Task processing: ${taskId}`);
}

/**
 * POST /api/ai-generator/webhook/[provider]/[taskId]
 * AI 生成器 webhook 回调接口
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string; taskId: string }> }
) {
  try {
    const { provider, taskId } = await params;

    // 解析原始 webhook 数据
    const rawPayload = await request.json();

    // 根据 provider 处理数据
    const { status, outputs, error } = processWebhookByProvider(provider, rawPayload);

    console.log(`Webhook received from ${provider}:`, { taskId, status, outputs });

    // 查找任务
    const tasks = await db
      .select()
      .from(mediaGenerationTask)
      .where(
        and(
          eq(mediaGenerationTask.taskId, taskId),
          eq(mediaGenerationTask.provider, provider)
        )
      )
      .limit(1);

    if (tasks.length === 0) {
      console.error(`Task not found for ${provider}:`, taskId);
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = tasks[0];

    // 验证任务状态（避免重复处理）
    // 使用悲观锁：先更新状态为 processing，防止重复 webhook 同时处理
    if (task.status === 'completed' || task.status === 'failed') {
      console.warn(`Task ${taskId} already finished with status: ${task.status}, skipping webhook`);
      return NextResponse.json({ success: true, message: 'Task already finished' });
    }

    // 如果是 completed 状态的 webhook，立即标记为 processing 防止重复
    if (status === 'completed') {
      const updateResult = await db
        .update(mediaGenerationTask)
        .set({
          status: 'processing',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(mediaGenerationTask.taskId, taskId),
            eq(mediaGenerationTask.status, task.status) // 仅在状态未变时更新
          )
        )
        .returning({ id: mediaGenerationTask.id });

      // 如果更新失败（说明已被其他请求处理），直接返回
      if (updateResult.length === 0) {
        console.warn(`Task ${taskId} is being processed by another webhook, skipping`);
        return NextResponse.json({ success: true, message: 'Task being processed' });
      }

      console.log(`Task ${taskId} locked for processing`);
    }

    // 根据状态处理任务
    switch (status) {
      case 'completed':
        if (outputs && outputs.length > 0) {
          await handleTaskCompleted(taskId, outputs, task.startedAt, task.model);
        }
        break;

      case 'failed':
        await handleTaskFailed(taskId, task.consumeTransactionId, task.startedAt, error);
        break;

      case 'processing':
        await handleTaskProcessing(taskId);
        break;

      default:
        console.warn(`Unknown status: ${status}`);
    }

    // 返回成功响应
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
