import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaGenerationTask, quotaTransaction } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';

/**
 * GET /api/ai-generator/tasks/[taskId]
 * 获取任务详情（用于任务详情页面展示）
 * 注意：此接口无需身份验证，任何人都可以通过 taskId 访问已完成的任务
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // 验证任务ID格式
    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // 查询任务（不验证用户，允许任何人查看）
    // 使用 LEFT JOIN 获取消耗的积分信息
    const tasks = await db
      .select({
        taskId: mediaGenerationTask.taskId,
        shareId: mediaGenerationTask.shareId,
        taskType: mediaGenerationTask.taskType,
        provider: mediaGenerationTask.provider,
        model: mediaGenerationTask.model,
        status: mediaGenerationTask.status,
        progress: mediaGenerationTask.progress,
        parameters: mediaGenerationTask.parameters,
        results: mediaGenerationTask.results,
        errorMessage: mediaGenerationTask.errorMessage,
        createdAt: mediaGenerationTask.createdAt,
        startedAt: mediaGenerationTask.startedAt,
        completedAt: mediaGenerationTask.completedAt,
        quotaConsumed: quotaTransaction.amount,
      })
      .from(mediaGenerationTask)
      .leftJoin(
        quotaTransaction,
        eq(mediaGenerationTask.consumeTransactionId, quotaTransaction.id)
      )
      .where(
        and(
          eq(mediaGenerationTask.taskId, taskId),
          isNull(mediaGenerationTask.deletedAt) // 排除已删除的任务
        )
      )
      .limit(1);

    if (tasks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = tasks[0];

    // 返回任务数据
    return NextResponse.json({
      success: true,
      data: {
        taskId: task.taskId,
        shareId: task.shareId,
        taskType: task.taskType,
        provider: task.provider,
        model: task.model,
        status: task.status,
        progress: task.progress,
        parameters: task.parameters,
        results: task.results,
        errorMessage: task.errorMessage,
        createdAt: task.createdAt,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
        quotaConsumed: task.quotaConsumed ? Math.abs(task.quotaConsumed) : null,
      },
    });
  } catch (error) {
    console.error('Task query error:', error);
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
 * DELETE /api/ai-generator/tasks/[taskId]
 * 删除任务（软删除）
 * 需要身份验证，只能删除自己的任务
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // 获取当前用户
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    // 验证任务ID格式
    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // 查询任务是否存在且属于当前用户
    const tasks = await db
      .select({
        id: mediaGenerationTask.id,
        userId: mediaGenerationTask.userId,
      })
      .from(mediaGenerationTask)
      .where(
        and(
          eq(mediaGenerationTask.taskId, taskId),
          isNull(mediaGenerationTask.deletedAt)
        )
      )
      .limit(1);

    if (tasks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = tasks[0];

    // 验证任务属于当前用户
    if (task.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 软删除任务
    await db
      .update(mediaGenerationTask)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mediaGenerationTask.id, task.id));

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Task delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
