/**
 * API 响应标准化工具
 * 将不同提供商和模式的 API 响应统一为标准格式
 */

import { NextResponse } from 'next/server';

// ==================== 类型定义 ====================

export interface StandardizedResult {
  url: string;
  type: 'image';
}

export interface StandardizedMetadata {
  task_id: string;
  share_id?: string;
  duration_ms?: number;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  [key: string]: any;
}

export interface StandardizedResponse {
  success: true;
  data: {
    results: StandardizedResult[];
    metadata: StandardizedMetadata;
  };
}

export interface StandardizeOptions {
  provider?: 'wavespeed' | string;
  taskId?: string;
  model?: string;
  [key: string]: any;
}

// ==================== 标准化函数 ====================

/**
 * 标准化 API 响应
 *
 * @param apiResponse - 第三方 API 的原始响应
 * @param options - 标准化选项
 * @returns 标准化后的响应对象
 */
export function standardizeResponse(
  apiResponse: any,
  options: StandardizeOptions = {}
): StandardizedResponse {
  const { provider = 'wavespeed', taskId, model } = options;

  // 根据提供商处理响应
  if (provider === 'wavespeed') {
    return standardizeWavespeedResponse(apiResponse, { taskId, model });
  }

  // 默认处理
  return standardizeGenericResponse(apiResponse, { taskId, model });
}

/**
 * 标准化 Wavespeed API 响应
 * 支持同步和异步两种格式
 */
function standardizeWavespeedResponse(
  apiResponse: any,
  options: { taskId?: string; model?: string }
): StandardizedResponse {
  const { taskId, model } = options;

  try {
    // 提取响应数据层次
    // Wavespeed 同步: { data: { data: { outputs: [...], ... } } }
    // Wavespeed 异步: { data: { outputs: [...], ... } }
    const innerData = apiResponse?.data;

    // 获取输出 URL 列表
    let outputs: string[] = [];

    if (innerData?.data && Array.isArray(innerData.data.outputs)) {
      // 同步响应格式
      outputs = innerData.data.outputs;
    } else if (innerData?.outputs && Array.isArray(innerData.outputs)) {
      // 异步响应或其他格式
      outputs = innerData.outputs;
    } else if (Array.isArray(innerData)) {
      // 直接是数组
      outputs = innerData;
    } else if (innerData?.results && Array.isArray(innerData.results)) {
      // results 数组
      outputs = innerData.results;
    }

    // 标准化结果列表
    const results: StandardizedResult[] = outputs.map(
      (output: string | { url: string }) => ({
        url: typeof output === 'string' ? output : output.url,
        type: 'image' as const,
      })
    );

    // 提取元数据
    const innerDataInfo = innerData?.data || innerData;
    const metadata: StandardizedMetadata = {
      task_id: taskId || innerDataInfo?.id || `wavespeed-${Date.now()}`,
      share_id: innerDataInfo?.share_id,
      duration_ms: innerDataInfo?.executionTime || innerDataInfo?.duration_ms,
      created_at: innerDataInfo?.created_at,
      started_at: innerDataInfo?.started_at,
      completed_at: innerDataInfo?.completed_at,
      model,
    };

    // 移除 undefined 的字段
    Object.keys(metadata).forEach(
      (key) => metadata[key] === undefined && delete metadata[key]
    );

    return {
      success: true,
      data: {
        results,
        metadata,
      },
    };
  } catch (error) {
    console.error('Error standardizing Wavespeed response:', error);
    throw new Error('Failed to standardize Wavespeed API response');
  }
}

/**
 * 标准化通用 API 响应
 */
function standardizeGenericResponse(
  apiResponse: any,
  options: { taskId?: string; model?: string }
): StandardizedResponse {
  const { taskId, model } = options;

  try {
    const data = apiResponse?.data;

    // 尝试提取输出 URL 列表
    let outputs: string[] = [];

    if (data?.results && Array.isArray(data.results)) {
      outputs = data.results.map((r: any) =>
        typeof r === 'string' ? r : r.url || r
      );
    } else if (data?.outputs && Array.isArray(data.outputs)) {
      outputs = data.outputs.map((o: any) =>
        typeof o === 'string' ? o : o.url || o
      );
    } else if (Array.isArray(data)) {
      outputs = data;
    } else if (Array.isArray(apiResponse)) {
      outputs = apiResponse;
    }

    const results: StandardizedResult[] = outputs.map((url: string) => ({
      url,
      type: 'image' as const,
    }));

    const metadata: StandardizedMetadata = {
      task_id: taskId || data?.id || `generic-${Date.now()}`,
      share_id: data?.share_id,
      duration_ms: data?.duration_ms || data?.executionTime,
      created_at: data?.created_at,
      started_at: data?.started_at,
      completed_at: data?.completed_at,
      model,
    };

    // 移除 undefined 的字段
    Object.keys(metadata).forEach(
      (key) => metadata[key] === undefined && delete metadata[key]
    );

    return {
      success: true,
      data: {
        results,
        metadata,
      },
    };
  } catch (error) {
    console.error('Error standardizing generic response:', error);
    throw new Error('Failed to standardize API response');
  }
}

/**
 * 返回标准化的 NextResponse
 */
export function standardizeAndRespond(
  apiResponse: any,
  options: StandardizeOptions = {}
): NextResponse {
  try {
    const standardized = standardizeResponse(apiResponse, options);
    return NextResponse.json(standardized);
  } catch (error) {
    console.error('Error in standardizeAndRespond:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to standardize response',
      },
      { status: 500 }
    );
  }
}
