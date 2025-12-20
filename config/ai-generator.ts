/**
 * AI 生成器配额配置
 * 用于配置各个生成器模型的配额消耗
 */

// 主要生成器类型
type MainTaskType = 'text-to-image' | 'image-to-image';

// 更多生成器类型
type MoreTaskType = 'image-upscaler' | 'image-watermark-remover';

// 效果生成器类型
type EffectsTaskType = 'image-effects';

// 生成器类型（包括主要类型、更多类型和效果类型）
export type TaskType = MainTaskType | MoreTaskType | EffectsTaskType;

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

    case 'image-watermark-remover':
      return calculateImageWatermarkRemoverCredits(model, parameters);

    case 'image-effects':
      return calculateImageEffectsCredits(model, parameters);

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

  // Flux Schnell 模型
  if (model === 'flux-schnell') {
    return fluxSchnellTextToImageCredits(parameters);
  }

  // GPT Image 1.5 模型
  if (model === 'gpt-image-1.5') {
    return gptImage15TextToImageCredits(parameters);
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

  // GPT Image 1.5 模型
  if (model === 'gpt-image-1.5') {
    return gptImage15ImageToImageCredits(parameters);
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
 * Flux Schnell 文生图配额计算
 * 5 积分每张图，根据 num_images 参数计算总积分
 */
function fluxSchnellTextToImageCredits(parameters: Record<string, any>): number {
  const { num_images = 1 } = parameters;
  return 5 * num_images;
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

/**
 * 图片去水印配额计算
 */
function calculateImageWatermarkRemoverCredits(model: string, parameters: Record<string, any>): number {
  // 去水印每张图 20 积分
  return 50;
}

/**
 * 图像效果配额计算
 */
function calculateImageEffectsCredits(model: string, parameters: Record<string, any>): number {
  // 根据效果类型计算配额
  switch (model) {
    case 'lofi-pixel-character-mini-card':
      // 像素艺术效果每张图 20 积分
      return 20;
    default:
      // 未匹配到效果模型，返回默认配额
      return 20;
  }
}

/**
 * GPT Image 1.5 通用积分计算
 * 根据质量和尺寸计算积分
 * 1美元 = 700积分
 */
function calculateGptImage15Credits(parameters: Record<string, any>): number {
  const { num_images = 1, quality = 'medium', size = '1024x1024' } = parameters;

  // 定义每张图的美元价格
  let pricePerImage = 0;

  if (quality === 'low') {
    // Low quality 定价
    if (size === '1024x1024') {
      pricePerImage = 0.009;
    } else {
      // 其他尺寸
      pricePerImage = 0.013;
    }
  } else if (quality === 'medium') {
    // Medium quality 定价
    if (size === '1024x1024') {
      pricePerImage = 0.034;
    } else if (size === '1024x1536') {
      pricePerImage = 0.051;
    } else if (size === '1536x1024') {
      pricePerImage = 0.050;
    } else {
      // 默认中等质量价格
      pricePerImage = 0.034;
    }
  } else if (quality === 'high') {
    // High quality 定价
    if (size === '1024x1024') {
      pricePerImage = 0.133;
    } else if (size === '1024x1536') {
      pricePerImage = 0.200;
    } else if (size === '1536x1024') {
      pricePerImage = 0.199;
    } else {
      // 默认高质量价格
      pricePerImage = 0.133;
    }
  } else {
    // 默认使用 medium quality 1024x1024 价格
    pricePerImage = 0.034;
  }

  // 转换为积分: 1美元 = 700积分
  const rawCredits = pricePerImage * 700;

  // 向上取整到5的倍数
  const creditsPerImage = Math.ceil(rawCredits / 5) * 5;

  // 总积分 = 单张图积分 × 图片数量
  return creditsPerImage * num_images;
}

/**
 * GPT Image 1.5 文生图配额计算
 */
function gptImage15TextToImageCredits(parameters: Record<string, any>): number {
  return calculateGptImage15Credits(parameters);
}

/**
 * GPT Image 1.5 图生图配额计算
 */
function gptImage15ImageToImageCredits(parameters: Record<string, any>): number {
  return calculateGptImage15Credits(parameters);
}