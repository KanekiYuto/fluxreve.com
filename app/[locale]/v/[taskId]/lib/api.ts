import { TaskData } from '../types';
import { db } from '@/lib/db';
import { mediaGenerationTask } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 通过数据库直接查询任务信息
 */
export async function fetchTaskData(shareId: string): Promise<TaskData | null> {
  try {
    const tasks = await db
      .select({
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
      return null;
    }

    const task = tasks[0];

    return {
      share_id: task.shareId,
      status: task.status,
      progress: task.progress,
      model: task.model,
      task_type: task.taskType,
      parameters: task.parameters as TaskData['parameters'],
      results: task.results as TaskData['results'],
      created_at: task.createdAt.toISOString(),
      completed_at: task.completedAt?.toISOString(),
      error: task.errorMessage,
    };
  } catch (error) {
    console.error('Failed to fetch task data:', error);
    return null;
  }
}
