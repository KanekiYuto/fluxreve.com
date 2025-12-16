/**
 * Google Ads 转换追踪配置
 * 根据不同的模型组配置不同的转换 ID
 */

/**
 * 模型组类型
 */
export type ModelGroup = 'nano' | 'z-image' | 'flux' | 'seedream';

/**
 * 模型到模型组的映射
 */
const MODEL_TO_GROUP: Record<string, ModelGroup> = {
  // Nano 系列
  'nano-banana-pro': 'nano',
  'nano-banana': 'nano',

  // Z-Image 系列
  'z-image': 'z-image',
  'z-image-lora': 'z-image',

  // Flux 系列
  'flux-2-pro': 'flux',
  'flux-schnell': 'flux',

  // Seedream 系列
  'seedream-v4.5': 'seedream',
};

/**
 * 转换配置接口
 */
interface ConversionConfig {
  /** Google Ads 转换 ID */
  conversionId: string;
  /** 转换价值 */
  value: number;
}

/**
 * 模型组到 Google Ads 转换配置的映射
 */
const GROUP_TO_CONVERSION_CONFIG: Record<ModelGroup, ConversionConfig> = {
  'nano': {
    conversionId: 'AW-17790324344/W67tCKrwlNIbEPici6NC',
    value: 1, // Nano 系列转换价值
  },
  'z-image': {
    conversionId: 'AW-17790324344/Vs5YCMj8itIbEPici6NC',
    value: 0.05, // Z-Image 系列转换价值（更低成本）
  },
  'flux': {
    conversionId: 'AW-17790324344/bRGYCMv8itIbEPici6NC',
    value: 0.25, // Flux 系列转换价值（更高质量）
  },
  'seedream': {
    conversionId: 'AW-17790324344/uAoiCM78itIbEPici6NC',
    value: 0.3, // Seedream 系列转换价值（最高质量）
  },
};

/**
 * 根据模型名称获取对应的 Google Ads 转换配置
 * @param modelName 模型名称
 * @returns 转换配置（包含 ID 和价值），如果没有匹配则返回 null
 */
export function getConversionConfig(modelName?: string): ConversionConfig | null {
  if (!modelName) {
    return null;
  }

  const group = MODEL_TO_GROUP[modelName];

  if (!group) {
    return null;
  }

  return GROUP_TO_CONVERSION_CONFIG[group];
}

/**
 * 根据模型名称获取对应的 Google Ads 转换 ID（保持向后兼容）
 * @param modelName 模型名称
 * @returns Google Ads 转换 ID，如果没有匹配则返回 null
 * @deprecated 建议使用 getConversionConfig 获取完整配置
 */
export function getConversionId(modelName?: string): string | null {
  const config = getConversionConfig(modelName);
  return config ? config.conversionId : null;
}