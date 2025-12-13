/**
 * AI 生成器配额配置
 * 用于配置各个生成器模型的配额消耗
 */

// 主要生成器类型
type MainTaskType = 'text-to-image' | 'image-to-image';

// 更多生成器类型
type MoreTaskType = 'image-upscaler';

// 生成器类型（包括主要类型和更多类型）
export type TaskType = MainTaskType | MoreTaskType;

// 默认配额常量（未匹配到任何生成器时使用）
export const DEFAULT_CREDITS = 88888888;

/**
 * 需要进行 NSFW 内容检查的模型列表
 * 只有这些模型生成的图片会进行 NSFW 审核
 */
export const NSFW_CHECK_MODELS = [
  'z-image',
  'z-image-lora',
] as const;

/**
 * 获取生成任务所需的配额
 * @param taskType 任务类型
 * @param model 模型名称
 * @param parameters 请求参数
 * @returns 所需配额数量
 */
export function getRequiredCredits(
  taskType: TaskType,
  model: string,
  parameters: Record<string, any>
): number {
  // 根据任务类型查找对应的计算函数
  switch (taskType) {
    case 'text-to-image':
      return calculateTextToImageCredits(model, parameters);

    case 'image-to-image':
      return calculateImageToImageCredits(model, parameters);

    case 'image-upscaler':
      return calculateImageUpscalerCredits(model, parameters);

    default:
      // 未匹配到任务类型，返回默认配额
      return DEFAULT_CREDITS;
  }
}

/**
 * 文生图配额计算
 */
function calculateTextToImageCredits(model: string, parameters: Record<string, any>): number {
  // Nano Banana Pro 模型
  if (model === 'nano-banana-pro') {
    return nanoBananaProTextToImageCredits(parameters);
  }

  // Z-Image Turbo 模型
  if (model === 'z-image') {
    return zImageTextToImageCredits(parameters);
  }

  // Z-Image Turbo LoRA 模型
  if (model === 'z-image-lora') {
    return zImageLoraTextToImageCredits(parameters);
  }

  // Flux 2 Pro 模型
  if (model === 'flux-2-pro') {
    return flux2ProTextToImageCredits(parameters);
  }

  // Seedream v4.5 模型
  if (model === 'seedream-v4.5') {
    return seedreamTextToImageCredits(parameters);
  }

  // 未匹配到生成器，返回默认配额
  return DEFAULT_CREDITS;
}

/**
 * 图生图配额计算
 */
function calculateImageToImageCredits(model: string, parameters: Record<string, any>): number {
  // Nano Banana Pro 模型
  if (model === 'nano-banana-pro') {
    return nanoBananaProImageToImageCredits(parameters);
  }

  // Flux 2 Pro 模型
  if (model === 'flux-2-pro') {
    return flux2ProImageToImageCredits(parameters);
  }

  // Seedream v4.5 模型
  if (model === 'seedream-v4.5') {
    return seedreamImageToImageCredits(parameters);
  }

  // 未匹配到生成器，返回默认配额
  return DEFAULT_CREDITS;
}

// ============ 各生成器的配额计算函数 ============

/**
 * Nano Banana Pro 文生图配额计算
 */
function nanoBananaProTextToImageCredits(parameters: Record<string, any>): number {
  const { resolution } = parameters;

  switch (resolution) {
    case '4k':
      return 170;
    case '1k':
    case '2k':
    default:
      return 100;
  }
}

/**
 * Nano Banana Pro 图生图配额计算
 */
function nanoBananaProImageToImageCredits(parameters: Record<string, any>): number {
  const { resolution } = parameters;

  switch (resolution) {
    case '4k':
      return 170;
    case '1k':
    case '2k':
    default:
      return 100;
  }
}

/**
 * Z-Image 文生图配额计算
 * 固定 5 积分每张图
 */
function zImageTextToImageCredits(_parameters: Record<string, any>): number {
  return 5;
}

/**
 * Flux 2 Pro 文生图配额计算
 * 固定 25 积分每张图
 */
function flux2ProTextToImageCredits(_parameters: Record<string, any>): number {
  return 25;
}

/**
 * Flux 2 Pro 图生图配额计算
 * 固定 25 积分每张图
 */
function flux2ProImageToImageCredits(_parameters: Record<string, any>): number {
  return 25;
}

/**
 * Seedream v4.5 文生图配额计算
 * 固定 30 积分每张图
 */
function seedreamTextToImageCredits(_parameters: Record<string, any>): number {
  return 30;
}

/**
 * Seedream v4.5 图生图配额计算
 * 固定 30 积分每张图
 */
function seedreamImageToImageCredits(_parameters: Record<string, any>): number {
  return 30;
}

/**
 * Z-Image Turbo LoRA 文生图配额计算
 * 固定 10 积分每张图
 */
function zImageLoraTextToImageCredits(_parameters: Record<string, any>): number {
  return 10;
}

// ============ 更多生成器的配额计算函数 ============

/**
 * 图片放大配额计算
 */
function calculateImageUpscalerCredits(model: string, parameters: Record<string, any>): number {
  // 根据目标分辨率计算配额
  const { target_resolution } = parameters;

  switch (target_resolution) {
    case '8k':
      return 20;
    case '4k':
      return 15;
    case '2k':
    default:
      return 10;
  }
}