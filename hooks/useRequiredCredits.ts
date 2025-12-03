import { useMemo } from 'react';
import { getRequiredCredits, type TaskType } from '@/config/ai-generator';

/**
 * 配额消耗计算 Hook
 * @param taskType 任务类型
 * @param model 模型名称
 * @param parameters 请求参数
 * @returns 所需配额数量
 */
export function useRequiredCredits(
  taskType: TaskType,
  model: string,
  parameters: Record<string, any>
): number {
  // 使用 useMemo 计算配额，避免在 effect 中同步调用 setState
  const requiredCredits = useMemo(() => {
    return getRequiredCredits(taskType, model, parameters);
  }, [taskType, model, parameters]);

  return requiredCredits;
}
