import { NextRequest, NextResponse } from 'next/server';
import { handleWavespeedRequest } from '@/lib/ai-generator/handleWavespeedRequest';
import { ProcessParamsResult } from '@/lib/ai-generator/handleRequest';

// 请求参数接口
interface TextToImageRequest {
  prompt: string;
  aspect_ratio: string;
  output_format: string;
  resolution: '1k' | '2k' | '4k';
  seed?: string;
}

/**
 * POST /api/ai-generator/provider/wavespeed/nano-banana-pro/text-to-image
 * Nano Banana Pro 文生图 API (异步模式，使用 webhook)
 */
export async function POST(request: NextRequest) {
  return handleWavespeedRequest(request, {
    endpoint: 'google/nano-banana-pro/text-to-image',
    taskType: 'text-to-image',
    model: 'nano-banana-pro',

    // 参数处理回调函数
    processParams: (body: TextToImageRequest): ProcessParamsResult | NextResponse => {
      // 解析参数
      const {
        prompt,
        aspect_ratio,
        output_format,
        resolution,
        seed,
      } = body;

      // 验证必填参数
      if (!prompt || !prompt.trim()) {
        return NextResponse.json(
          { success: false, error: 'Prompt is required' },
          { status: 400 }
        );
      }

      // 构建 API 请求参数
      const apiParams: Record<string, any> = {
        prompt,
        aspect_ratio,
        output_format,
        resolution,
        enable_base64_output: false,
        enable_sync_mode: false,
      };

      // 如果提供了 seed，添加到参数中
      if (seed) {
        apiParams.seed = parseInt(seed, 10);
      }

      // 返回处理结果
      return {
        // 用于积分计算的参数
        creditsParams: {
          resolution,
          aspect_ratio,
          output_format,
          seed,
        },
        // 发送给 Wavespeed API 的参数
        apiParams,
        // 存储到数据库的参数
        dbParams: {
          prompt,
          aspect_ratio,
          output_format,
          resolution,
          seed,
        },
        // 配额消费描述
        description: `Text-to-image generation: ${prompt.substring(0, 50)}...`,
      };
    },
  });
}
