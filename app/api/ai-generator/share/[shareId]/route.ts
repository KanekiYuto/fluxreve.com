import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaGenerationTask } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { processImageResults } from '@/lib/image/resource';

/**
 * GET /api/ai-generator/share/[shareId]
 * 公开接口：通过 shareId 查询任务信息（无需身份验证）
 * 同时记录任务访问
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;

    // 验证 shareId 格式
    if (!shareId) {
      return NextResponse.json(
        { success: false, error: 'Share ID is required' },
        { status: 400 }
      );
    }

    // 查询任务（使用 shareId，不验证用户身份）
    const tasks = await db
      .select({
        taskId: mediaGenerationTask.taskId,
        shareId: mediaGenerationTask.shareId,
        status: mediaGenerationTask.status,
        progress: mediaGenerationTask.progress,
        parameters: mediaGenerationTask.parameters,
        results: mediaGenerationTask.results,
        createdAt: mediaGenerationTask.createdAt,
        completedAt: mediaGenerationTask.completedAt,
        model: mediaGenerationTask.model,
        taskType: mediaGenerationTask.taskType,
        errorMessage: mediaGenerationTask.errorMessage,
      })
      .from(mediaGenerationTask)
      .where(eq(mediaGenerationTask.shareId, shareId))
      .limit(1);

    if (tasks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = tasks[0];

    // 异步记录访问（不阻塞响应）
    recordTaskView(task.taskId, request).catch(error => {
      console.error('Failed to record task view:', error);
    });

    // 返回任务信息
    // 公开分享链接，返回水印版本（userType=undefined）
    return NextResponse.json({
      success: true,
      data: {
        share_id: task.shareId,
        status: task.status,
        progress: task.progress,
        model: task.model,
        task_type: task.taskType,
        parameters: task.parameters,
        results: processImageResults(task.results, undefined),
        created_at: task.createdAt,
        completed_at: task.completedAt,
        error: task.errorMessage,
      },
    });
  } catch (error) {
    console.error('Share query error:', error);
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
 * 记录任务访问
 * 异步函数，不阻塞响应
 */
async function recordTaskView(taskId: string, request: NextRequest): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const viewUrl = `${baseUrl}/api/ai-generator/tasks/${taskId}/view`;

    await fetch(viewUrl, {
      method: 'POST',
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
        'x-real-ip': request.headers.get('x-real-ip') || '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        'cf-ipcountry': request.headers.get('cf-ipcountry') || '',
      },
    });
  } catch (error) {
    console.error('Failed to call view recording endpoint:', error);
  }
}
