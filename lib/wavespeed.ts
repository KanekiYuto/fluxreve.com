/**
 * Wavespeed AI 平台 API 处理器
 */

const WAVESPEED_API_BASE_URL = 'https://api.wavespeed.ai/api/v3';

/**
 * 获取 Wavespeed API Key
 */
function getApiKey(): string {
  const apiKey = process.env.WAVESPEED_API_KEY;
  if (!apiKey) {
    throw new Error('WAVESPEED_API_KEY is not configured');
  }
  return apiKey;
}

/**
 * 通用的 Wavespeed API 请求处理器
 */
async function wavespeedRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = 'POST', body, headers = {} } = options;

  const apiKey = getApiKey();

  const response = await fetch(`${WAVESPEED_API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Wavespeed API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

/**
 * NSFW 内容审核详情
 */
export interface NSFWDetails {
  hate: boolean;
  sexual: boolean;
  violence: boolean;
  harassment: boolean;
  'sexual/minors': boolean;
}

/**
 * NSFW 内容审核响应接口（API 原始响应）
 */
export interface ContentModeratorAPIResponse {
  code: number;
  message: string;
  data: {
    id: string;
    status: 'completed' | 'failed';
    model: string;
    outputs?: NSFWDetails[];
    error?: string;
    urls?: {
      get: string;
    };
    timings?: {
      inference: number;
    };
    created_at?: string;
    has_nsfw_contents?: boolean | null;
    executionTime?: number;
  };
}

/**
 * NSFW 内容审核响应接口（处理后的数据）
 */
export interface ContentModeratorResponse {
  id: string;
  status: 'completed' | 'failed';
  model: string;
  outputs?: NSFWDetails[];
  error?: string;
  urls?: {
    get: string;
  };
  timings?: {
    inference: number;
  };
  created_at?: string;
  has_nsfw_contents?: boolean | null;
}

/**
 * 检查图片是否为 NSFW 内容
 * @param imageUrl 图片 URL
 * @param enableSyncMode 是否使用同步模式（默认 true）
 * @returns NSFW 检测结果
 */
export async function checkImageNSFW(
  imageUrl: string,
  enableSyncMode: boolean = true
): Promise<ContentModeratorResponse> {
  const apiResponse = await wavespeedRequest<ContentModeratorAPIResponse>('/wavespeed-ai/content-moderator/image', {
    method: 'POST',
    body: {
      image: imageUrl,
      enable_sync_mode: enableSyncMode,
    },
  });

  // 提取 data 字段返回
  return apiResponse.data;
}

/**
 * NSFW 检查结果
 */
export interface NSFWCheckResult {
  isNsfw: boolean;
  details: NSFWDetails | null;
}

/**
 * 检查图片是否为 NSFW 内容，返回详细结果
 * @param imageUrl 图片 URL
 * @returns NSFW 检查结果，包含布尔值和详细信息
 */
export async function checkImageNSFWWithDetails(imageUrl: string): Promise<NSFWCheckResult> {
  try {
    const result = await checkImageNSFW(imageUrl, true);

    console.log(`[NSFW API Response] for ${imageUrl}:`, JSON.stringify(result, null, 2));

    if (result.status === 'completed' && result.outputs && result.outputs.length > 0) {
      const details = result.outputs[0];

      // 判断是否包含任何 NSFW 内容
      const isNsfw = details.hate || details.sexual || details.violence || details.harassment || details['sexual/minors'];

      console.log(`[NSFW Detection] Image: ${imageUrl}, isNsfw: ${isNsfw}, details:`, details);

      return {
        isNsfw,
        details,
      };
    }

    console.log(`[NSFW Detection] Image: ${imageUrl}, no valid outputs, marking as safe`);
    return {
      isNsfw: false,
      details: null,
    };
  } catch (error) {
    console.error(`[NSFW Detection Error] for ${imageUrl}:`, error);
    return {
      isNsfw: false,
      details: null,
    };
  }
}

/**
 * 简化的 NSFW 检查函数，直接返回布尔值
 * @param imageUrl 图片 URL
 * @returns 是否为 NSFW 内容
 */
export async function isImageNSFW(imageUrl: string): Promise<boolean> {
  const result = await checkImageNSFWWithDetails(imageUrl);
  return result.isNsfw;
}