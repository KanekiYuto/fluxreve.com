import { NextRequest, NextResponse } from 'next/server';
import { handleSyncDirect, ProcessSyncParamsResult } from '@/lib/ai-generator/handlers/sync-direct';
import { standardizeResponse } from '@/lib/ai-generator/response-standardizer';

// 请求参数接口
interface ImageUpscalerRequest {
  image: string; // 图片 URL
  target_resolution: 'auto' | '1k' | '2k' | '4k';
  output_format?: 'jpeg' | 'png' | 'webp';
  enable_base64_output?: boolean;
}


/**
 * POST /api/ai-generator/provider/wavespeed/image-upscaler
 * 图片放大 API (同步模式，直接返回结果)
 */
export async function POST(request: NextRequest) {
  return handleSyncDirect(request, {
    endpoint: 'wavespeed-ai/image-upscaler',
    taskType: 'image-upscaler',
    model: 'wavespeed-image-upscaler',

    // 参数处理回调函数
    processParams: (body: ImageUpscalerRequest): ProcessSyncParamsResult | NextResponse => {
      // 解析参数
      const {
        image,
        target_resolution,
        output_format = 'jpeg',
        enable_base64_output = false,
      } = body;

      // 验证必填参数
      if (!image || !image.trim()) {
        return NextResponse.json(
          { success: false, error: 'Image URL is required' },
          { status: 400 }
        );
      }

      if (!target_resolution) {
        return NextResponse.json(
          { success: false, error: 'Target resolution is required' },
          { status: 400 }
        );
      }

      // 验证分辨率格式
      const validResolutions = ['auto', '1k', '2k', '4k'];
      if (!validResolutions.includes(target_resolution)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid target_resolution. Must be one of: ${validResolutions.join(', ')}`,
          },
          { status: 400 }
        );
      }

      // 构建 API 请求参数
      const apiParams: Record<string, any> = {
        image,
        target_resolution,
        output_format,
        enable_base64_output,
        enable_sync_mode: true, // 强制使用同步模式
      };

      // 返回处理结果
      return {
        // 用于积分计算的参数
        creditsParams: {
          target_resolution,
        },
        // 发送给 Wavespeed API 的参数
        apiParams,
        // 配额消费描述
        description: `Image upscaler: ${target_resolution} (from ${image.substring(0, 50)}...)`,
      };
    },

    // API 响应处理回调函数 - 标准化 Wavespeed 响应格式
    handleResponse: (apiResponse: any) => {
      const standardized = standardizeResponse(apiResponse, {
        provider: 'wavespeed',
        model: 'wavespeed-image-upscaler',
      });
      return NextResponse.json(standardized);
    },
  });
}
