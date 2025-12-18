/**
 * 模型名称映射配置
 * 将内部使用的模型标识符映射为用户友好的显示名称
 */

export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // Nano 系列模型
  'nano-banana-pro': 'Nano Banana Pro',
  'nano-banana': 'Nano Banana',

  // Z-Image 系列模型
  'z-image': 'Z-Image',
  'z-image-lora': 'Z-Image Turbo LoRA',

  // Flux 系列模型
  'flux-2-pro': 'Flux 2 Pro',
  'flux-schnell': 'Flux Schnell',

  // Seedream 系列模型
  'seedream-v4.5': 'Seedream 4.5',

  // GPT Image 系列模型
  'gpt-image-1.5': 'GPT Image 1.5',
};

/**
 * 获取模型的显示名称
 * @param modelId 模型内部标识符
 * @returns 用户友好的显示名称，如果未找到映射则返回原始 ID
 */
export function getModelDisplayName(modelId: string): string {
  return MODEL_DISPLAY_NAMES[modelId] || modelId;
}
