import { NextRequest, NextResponse } from 'next/server';
import { handleWavespeedRequest } from '@/lib/ai-generator/handleWavespeedRequest';
import { ProcessParamsResult } from '@/lib/ai-generator/handleRequest';

// 请求参数接口
interface ZImageTurboRequest {
  prompt: string;
  size: string;
  seed?: number;
  enable_base64_output?: boolean;
  enable_sync_mode?: boolean;
}

/**
 * POST /api/ai-generator/provider/wavespeed/z-image/turbo
 * Z-Image Turbo 文生图 API (异步模式，使用 webhook)
 */
export async function POST(request: NextRequest) {
  return handleWavespeedRequest(request, {
    endpoint: 'wavespeed-ai/z-image/turbo',
    taskType: 'text-to-image',
    model: 'z-image',

    // 参数处理回调函数
    processParams: (body: ZImageTurboRequest): ProcessParamsResult | NextResponse => {
      // 解析参数
      const {
        prompt,
        size,
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

      // 构建 API 请求参数
      const apiParams: Record<string, any> = {
        prompt,
        size,
        enable_base64_output,
        enable_sync_mode,
        seed: seed ?? -1, // 默认使用 -1 表示随机 seed
      };

      // 返回处理结果
      return {
        // 用于积分计算的参数
        creditsParams: {
          size,
          seed,
        },
        // 发送给 Wavespeed API 的参数
        apiParams,
        // 存储到数据库的参数
        dbParams: {
          prompt,
          size,
          seed: seed ?? -1,
          enable_base64_output,
          enable_sync_mode,
        },
        // 配额消费描述
        description: `Z-Image Turbo generation: ${prompt.substring(0, 50)}...`,
      };
    },
  });
}
