import { TaskData } from '../types';
import { db } from '@/lib/db';
import { mediaGenerationTask } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { processImageResults, UserType } from '@/lib/image/resource';

/**
 * 通过数据库直接查询任务信息
 * 不返回私有内容和已删除的内容
 * 根据用户类型返回对应版本的图片
 */
export async function fetchTaskData(shareId: string, userType?: UserType): Promise<TaskData | null> {
  try {
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
        isNsfw: mediaGenerationTask.isNsfw,
        viewCount: mediaGenerationTask.viewCount,
      })
      .from(mediaGenerationTask)
      .where(
        and(
          eq(mediaGenerationTask.shareId, shareId),
          eq(mediaGenerationTask.isPrivate, false), // 排除私有内容
          isNull(mediaGenerationTask.deletedAt) // 排除已删除内容
        )
      )
      .limit(1);

    if (tasks.length === 0) {
      return null;
    }

    const task = tasks[0];

    return {
      task_id: task.taskId,
      share_id: task.shareId,
      status: task.status,
      progress: task.progress,
      model: task.model,
      task_type: task.taskType,
      is_nsfw: task.isNsfw,
      view_count: task.viewCount,
      parameters: task.parameters as TaskData['parameters'],
      results: processImageResults(task.results, userType) as TaskData['results'],
      created_at: task.createdAt.toISOString(),
      completed_at: task.completedAt?.toISOString(),
      error: task.errorMessage,
    };
  } catch (error) {
    console.error('Failed to fetch task data:', error);
    return null;
  }
}
