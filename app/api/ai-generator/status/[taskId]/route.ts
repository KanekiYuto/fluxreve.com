import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaGenerationTask } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

/**
 * GET /api/ai-generator/status/[taskId]
 * 查询任务状态和结果
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

    // 获取当前用户
    const session = await auth.api.getSession({
      headers: _request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 查询任务（验证任务属于当前用户）
    const tasks = await db
      .select()
      .from(mediaGenerationTask)
      .where(
        and(
          eq(mediaGenerationTask.taskId, taskId),
          eq(mediaGenerationTask.userId, session.user.id)
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

    // 根据任务状态返回不同的信息
    const baseData = {
      task_id: task.taskId,
      share_id: task.shareId,
      status: task.status,
      progress: task.progress,
      created_at: task.createdAt,
    };

    // 任务完成 - 返回结果
    if (task.status === 'completed') {
      return NextResponse.json({
        success: true,
        data: {
          ...baseData,
          results: task.results,
          completed_at: task.completedAt,
        },
      });
    }

    // 任务失败 - 返回错误信息
    if (task.status === 'failed') {
      return NextResponse.json({
        success: true,
        data: {
          ...baseData,
          error: task.errorMessage,
          completed_at: task.completedAt,
        },
      });
    }

    // 任务进行中或排队中 - 返回基本状态
    return NextResponse.json({
      success: true,
      data: {
        ...baseData,
        started_at: task.startedAt,
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
