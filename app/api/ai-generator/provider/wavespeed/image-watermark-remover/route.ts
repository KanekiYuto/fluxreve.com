import { NextRequest, NextResponse } from 'next/server';
import { handleSyncDirect, ProcessSyncParamsResult } from '@/lib/ai-generator/handlers/sync-direct';
import { standardizeResponse } from '@/lib/ai-generator/response-standardizer';

// 请求参数接口
interface ImageWatermarkRemoverRequest {
  image: string;
  output_format?: 'jpeg' | 'png' | 'webp';
  enable_base64_output?: boolean;
}

/**
 * POST /api/ai-generator/provider/wavespeed/image-watermark-remover
 * 图片去水印 API (同步模式，直接返回结果)
 */
export async function POST(request: NextRequest) {
  return handleSyncDirect(request, {
    endpoint: 'wavespeed-ai/image-watermark-remover',
    taskType: 'image-watermark-remover',
    model: 'wavespeed-image-watermark-remover',

    // 参数处理回调函数
    processParams: (body: ImageWatermarkRemoverRequest): ProcessSyncParamsResult | NextResponse => {
      // 解析参数
      const {
        image,
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

      // 验证输出格式
      const validFormats = ['jpeg', 'jpg', 'png', 'webp'];
      if (!validFormats.includes(output_format.toLowerCase())) {
        return NextResponse.json(
          { success: false, error: `Output format must be one of: ${validFormats.join(', ')}` },
          { status: 400 }
        );
      }

      // 构建 API 请求参数
      const apiParams: Record<string, any> = {
        image,
        output_format: output_format.toLowerCase(),
        enable_base64_output,
        enable_sync_mode: true, // 强制使用同步模式
      };

      // 返回处理结果
      return {
        // 用于积分计算的参数
        creditsParams: {},
        // 发送给 Wavespeed API 的参数
        apiParams,
        // 配额消费描述
        description: `Image watermark remover: ${image.substring(0, 50)}...`,
      };
    },

    // API 响应处理回调函数 - 标准化 Wavespeed 响应格式
    handleResponse: (apiResponse: any) => {
      const standardized = standardizeResponse(apiResponse, {
        provider: 'wavespeed',
        model: 'wavespeed-image-watermark-remover',
      });
      return NextResponse.json(standardized);
    },
  });
}
