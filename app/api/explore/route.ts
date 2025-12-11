import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaGenerationTask } from '@/lib/db/schema';
import { eq, and, isNull, isNotNull, desc, count } from 'drizzle-orm';

/**
 * GET /api/explore
 * 获取公开的已完成任务（用于创意社区画廊）
 *
 * 查询参数:
 * - page: 页码（从1开始，默认1）
 * - limit: 每页数量（默认24，最大50）
 */
export async function GET(request: NextRequest) {
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)));

    // 计算偏移量
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [
      eq(mediaGenerationTask.isPrivate, false),           // 仅公开任务
      eq(mediaGenerationTask.status, 'completed'),       // 已完成
      isNull(mediaGenerationTask.deletedAt),             // 排除已删除
      isNotNull(mediaGenerationTask.results),            // 有结果
    ];

    // 查询任务列表
    const tasks = await db
      .select({
        taskId: mediaGenerationTask.taskId,
        shareId: mediaGenerationTask.shareId,
        model: mediaGenerationTask.model,
        taskType: mediaGenerationTask.taskType,
        parameters: mediaGenerationTask.parameters,
        results: mediaGenerationTask.results,
        completedAt: mediaGenerationTask.completedAt,
        isNsfw: mediaGenerationTask.isNsfw,
      })
      .from(mediaGenerationTask)
      .where(and(...conditions))
      .orderBy(desc(mediaGenerationTask.completedAt))
      .limit(limit)
      .offset(offset);

    // 查询总数（用于分页）
    const totalCountResult = await db
      .select({ count: count() })
      .from(mediaGenerationTask)
      .where(and(...conditions));

    const total = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('[Explore API] Query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
