import { NextRequest, NextResponse } from 'next/server';
import { handleWavespeedRequest } from '@/lib/ai-generator/handleWavespeedRequest';
import { ProcessParamsResult } from '@/lib/ai-generator/handleRequest';

// 请求参数接口
interface FluxSchnellTextToImageRequest {
  prompt: string;
  size: string;
  num_images?: number;
  seed?: number;
  enable_base64_output?: boolean;
  enable_sync_mode?: boolean;
}

/**
 * POST /api/ai-generator/provider/wavespeed/flux-schnell/text-to-image
 * Flux Schnell 文生图 API (异步模式，使用 webhook)
 */
export async function POST(request: NextRequest) {
  return handleWavespeedRequest(request, {
    endpoint: 'wavespeed-ai/flux-schnell',
    taskType: 'text-to-image',
    model: 'flux-schnell',

    // 参数处理回调函数
    processParams: (body: FluxSchnellTextToImageRequest): ProcessParamsResult | NextResponse => {
      // 解析参数
      const {
        prompt,
        size,
        num_images = 1,
        seed,
        enable_base64_output = false,
        enable_sync_mode = false,
      } = body;

      // 验证必填参数
      if (!prompt || !prompt.trim()) {
        return NextResponse.json(
          { success: false, error: 'Prompt is required' },
          { status: 400 }
        );
      }

      if (!size || !size.trim()) {
        return NextResponse.json(
          { success: false, error: 'Size is required' },
          { status: 400 }
        );
      }

      // 验证 size 格式 (例如: "1024*1024")
      const sizePattern = /^\d+\*\d+$/;
      if (!sizePattern.test(size)) {
        return NextResponse.json(
          { success: false, error: 'Invalid size format. Expected format: "width*height" (e.g., "1024*1024")' },
          { status: 400 }
        );
      }

      // 验证 num_images
      if (num_images < 1 || num_images > 4) {
        return NextResponse.json(
          { success: false, error: 'num_images must be between 1 and 4' },
          { status: 400 }
        );
      }

      // 构建 API 请求参数
      const apiParams: Record<string, any> = {
        prompt,
        size,
        num_images,
        enable_base64_output,
        enable_sync_mode,
        seed: seed ?? -1, // 默认使用 -1 表示随机 seed
        strength: 0.8
      };

      // 返回处理结果
      return {
        // 用于积分计算的参数
        creditsParams: {
          size,
          num_images,
          seed,
        },
        // 发送给 Wavespeed API 的参数
        apiParams,
        // 存储到数据库的参数
        dbParams: {
          prompt,
          size,
          num_images,
          seed: seed ?? -1,
          enable_base64_output,
          enable_sync_mode,
        },
        // 配额消费描述
        description: `Flux Schnell text-to-image (${num_images} images): ${prompt.substring(0, 50)}...`,
      };
    },
  });
}
