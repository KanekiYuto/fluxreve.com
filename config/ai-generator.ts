/**
 * AI 生成器配额配置
 * 用于配置各个生成器模型的配额消耗
 */

// 生成器类型
export type TaskType = 'text-to-image' | 'image-to-image';

// 默认配额常量（未匹配到任何生成器时使用）
export const DEFAULT_CREDITS = 88888888;

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
  if (model === 'z-image-turbo') {
    return zImageTurboTextToImageCredits(parameters);
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
 * Z-Image Turbo 文生图配额计算
 * 固定 5 积分每张图
 */
function zImageTurboTextToImageCredits(_parameters: Record<string, any>): number {
  return 5;
}