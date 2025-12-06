import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 计算任务生成耗时（毫秒）
 * 优先使用 durationMs 字段，兼容旧数据通过 startedAt 和 completedAt 计算
 */
export function getTaskDuration(task: {
  durationMs?: number | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
}): number | null {
  // 优先使用已存储的 durationMs
  if (task.durationMs != null) {
    return task.durationMs;
  }

  // 兼容旧数据：通过 startedAt 和 completedAt 计算
  if (task.startedAt && task.completedAt) {
    const start = new Date(task.startedAt).getTime();
    const end = new Date(task.completedAt).getTime();
    return end - start;
  }

  return null;
}

/**
 * 格式化耗时为可读字符串
 * @param durationMs 耗时（毫秒）
 * @returns 格式化后的字符串，如 "1.2s"、"45.3s"、"1m 23s"
 */
export function formatDuration(durationMs: number | null): string {
  if (durationMs == null) {
    return '-';
  }

  const seconds = durationMs / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return `${minutes}m ${remainingSeconds}s`;
}
