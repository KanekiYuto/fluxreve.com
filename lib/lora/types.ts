/**
 * LoRA 类型定义
 */

/**
 * LoRA 信息接口
 */
export interface Lora {
  id: string;
  url: string;
  triggerWord: string | null;
  prompt: string;
  title: string;
  description: string | null;
  userId: string;
  compatibleModels: string[];
  assetUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建 LoRA 的参数
 */
export interface CreateLoraInput {
  url: string;
  triggerWord?: string;
  prompt: string;
  title: string;
  description?: string;
  userId: string;
  compatibleModels: string[];
  assetUrls?: string[];
}

/**
 * 更新 LoRA 的参数
 */
export interface UpdateLoraInput {
  url?: string;
  triggerWord?: string;
  prompt?: string;
  title?: string;
  description?: string;
  compatibleModels?: string[];
  assetUrls?: string[];
}

/**
 * LoRA 查询参数
 */
export interface LoraQueryParams {
  userId?: string;
  model?: string; // 根据兼容模型筛选
  limit?: number;
  offset?: number;
}
