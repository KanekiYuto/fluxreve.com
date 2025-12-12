import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaGenerationTask } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { processImageResults, UserType } from '@/lib/image/resource';

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

    // 计算动态进度（仅对进行中的任务）
    let dynamicProgress = task.progress;
    if (task.status === 'processing' || task.status === 'pending') {
      // 查询所有已完成任务的平均耗时
      const completedTasksStats = await db
        .select({
          avgDuration: sql<number>`ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at))))`,
        })
        .from(mediaGenerationTask)
        .where(eq(mediaGenerationTask.status, 'completed'))
        .limit(1);

      // 默认 30 秒，如果有历史数据则使用平均值
      const avgDurationSeconds = completedTasksStats[0]?.avgDuration || 30;

      // 计算当前任务的已用时间（秒）
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(task.createdAt).getTime()) / 1000
      );

      // 计算进度百分比（上限 99%）
      dynamicProgress = Math.min(
        99,
        Math.floor((elapsedSeconds / avgDurationSeconds) * 100)
      );
    }

    // 根据任务状态返回不同的信息
    const baseData = {
      task_id: task.taskId,
      share_id: task.shareId,
      status: task.status,
      progress: dynamicProgress,
      created_at: task.createdAt,
    };

    // 任务完成 - 返回结果
    if (task.status === 'completed') {
      const userType = session.user.userType as UserType;
      return NextResponse.json({
        success: true,
        data: {
          ...baseData,
          results: processImageResults(task.results, userType),
          started_at: task.startedAt,
          completed_at: task.completedAt,
          duration_ms: task.durationMs,
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
