import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaGenerationTask } from '@/lib/db/schema';
import { eq, and, gte, isNull, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { processImageResults, UserType } from '@/lib/image/resource';

/**
 * GET /api/ai-generator/tasks/recent
 * 获取最近一周的生成任务
 */
export async function GET(request: NextRequest) {
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

    // 计算一周前的时间
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // 查询最近一周的已完成任务（未软删除）
    const tasks = await db
      .select({
        taskId: mediaGenerationTask.taskId,
        taskType: mediaGenerationTask.taskType,
        provider: mediaGenerationTask.provider,
        model: mediaGenerationTask.model,
        status: mediaGenerationTask.status,
        progress: mediaGenerationTask.progress,
        parameters: mediaGenerationTask.parameters,
        results: mediaGenerationTask.results,
        createdAt: mediaGenerationTask.createdAt,
        completedAt: mediaGenerationTask.completedAt,
      })
      .from(mediaGenerationTask)
      .where(
        and(
          eq(mediaGenerationTask.userId, session.user.id),
          eq(mediaGenerationTask.status, 'completed'),
          gte(mediaGenerationTask.createdAt, oneWeekAgo),
          isNull(mediaGenerationTask.deletedAt)
        )
      )
      .orderBy(desc(mediaGenerationTask.createdAt))
      .limit(12);

    // 处理任务结果 - 根据用户类型返回对应的图片URL
    const userType = session.user.userType as UserType;
    const processedTasks = tasks.map(task => ({
      ...task,
      results: processImageResults(task.results, userType),
    }));

    return NextResponse.json({
      success: true,
      data: processedTasks,
    });
  } catch (error) {
    console.error('Recent tasks query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
