import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaGenerationTask } from '@/lib/db/schema';
import { eq, and, isNull, desc, inArray, count, or } from 'drizzle-orm';
import { auth } from '@/lib/auth';

/**
 * GET /api/ai-generator/tasks
 * 获取用户的所有生成任务（支持分页和多维度筛选）
 *
 * 查询参数:
 * - page: 页码（从1开始，默认1）
 * - limit: 每页数量（默认20，最大100）
 * - status: 任务状态筛选（pending, processing, completed, failed，多个用逗号分隔）
 * - taskType: 任务类型筛选（text-to-image, image-to-image）
 * - model: 模型筛选（nano-banana-pro, z-image 等）
 * - privacy: 隐私筛选（private, public，多个用逗号分隔）
 * - nsfw: NSFW筛选（nsfw, safe，多个用逗号分隔）
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

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const statusParam = searchParams.get('status');
    const taskTypeParam = searchParams.get('taskType');
    const modelParam = searchParams.get('model');
    const privacyParam = searchParams.get('privacy');
    const nsfwParam = searchParams.get('nsfw');

    // 解析状态筛选
    let statusFilter: string[] | null = null;
    if (statusParam) {
      const statuses = statusParam.split(',').map(s => s.trim()).filter(Boolean);
      if (statuses.length > 0) {
        statusFilter = statuses;
      }
    }

    // 构建查询条件
    const conditions = [
      eq(mediaGenerationTask.userId, session.user.id),
      isNull(mediaGenerationTask.deletedAt), // 排除已删除的任务
    ];

    // 添加状态筛选
    if (statusFilter && statusFilter.length > 0) {
      conditions.push(inArray(mediaGenerationTask.status, statusFilter));
    }

    // 添加任务类型筛选（支持多选，逗号分隔）
    if (taskTypeParam) {
      const taskTypes = taskTypeParam.split(',').map(s => s.trim()).filter(Boolean);
      if (taskTypes.length > 0) {
        conditions.push(inArray(mediaGenerationTask.taskType, taskTypes));
      }
    }

    // 添加模型筛选（支持多选，逗号分隔）
    if (modelParam) {
      const models = modelParam.split(',').map(s => s.trim()).filter(Boolean);
      if (models.length > 0) {
        conditions.push(inArray(mediaGenerationTask.model, models));
      }
    }

    // 添加隐私筛选（支持多选，逗号分隔）
    if (privacyParam) {
      const privacyOptions = privacyParam.split(',').map(s => s.trim()).filter(Boolean);
      if (privacyOptions.length > 0) {
        const privacyConditions = privacyOptions.map(option => {
          return option === 'private'
            ? eq(mediaGenerationTask.isPrivate, true)
            : eq(mediaGenerationTask.isPrivate, false);
        });

        if (privacyConditions.length === 1) {
          conditions.push(privacyConditions[0]);
        } else {
          conditions.push(or(...privacyConditions)!);
        }
      }
    }

    // 添加 NSFW 筛选（支持多选，逗号分隔）
    if (nsfwParam) {
      const nsfwOptions = nsfwParam.split(',').map(s => s.trim()).filter(Boolean);
      if (nsfwOptions.length > 0) {
        const nsfwConditions = nsfwOptions.map(option => {
          return option === 'nsfw'
            ? eq(mediaGenerationTask.isNsfw, true)
            : eq(mediaGenerationTask.isNsfw, false);
        });

        if (nsfwConditions.length === 1) {
          conditions.push(nsfwConditions[0]);
        } else {
          conditions.push(or(...nsfwConditions)!);
        }
      }
    }

    // 计算偏移量
    const offset = (page - 1) * limit;

    // 查询任务列表
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
        errorMessage: mediaGenerationTask.errorMessage,
        isPrivate: mediaGenerationTask.isPrivate,
        isNsfw: mediaGenerationTask.isNsfw,
      })
      .from(mediaGenerationTask)
      .where(and(...conditions))
      .orderBy(desc(mediaGenerationTask.createdAt))
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
    console.error('Tasks query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

