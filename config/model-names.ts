/**
 * 模型名称映射配置
 * 将内部使用的模型标识符映射为用户友好的显示名称
 */

export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // Nano 系列模型
  'nano-banana-pro': 'Nano Banana Pro',
  'nano-banana': 'Nano Banana',

  // 其他模型可以在这里添加
  // 'model-id': 'Display Name',
};

/**
 * 获取模型的显示名称
 * @param modelId 模型内部标识符
 * @returns 用户友好的显示名称，如果未找到映射则返回原始 ID
 */
export function getModelDisplayName(modelId: string): string {
  return MODEL_DISPLAY_NAMES[modelId] || modelId;
}

/**
 * 格式化模型名称
 * 将 kebab-case 格式转换为 Title Case 格式
 * 例如：nano-banana-pro -> Nano Banana Pro
 * @param modelId 模型内部标识符
 * @returns 格式化后的显示名称
 */
export function formatModelName(modelId: string): string {
  // 首先检查是否有预定义的映射
  if (MODEL_DISPLAY_NAMES[modelId]) {
    return MODEL_DISPLAY_NAMES[modelId];
  }

  // 如果没有映射，则自动格式化
  return modelId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
