import { NextRequest, NextResponse } from 'next/server';
import { handleWavespeedRequest } from '@/lib/ai-generator/handleWavespeedRequest';
import { ProcessParamsResult } from '@/lib/ai-generator/handleRequest';

// LoRA 配置接口
interface LoraConfig {
  [key: string]: any;
}

// 请求参数接口
interface ZImageTurboLoraRequest {
  prompt: string;
  size: string;
  seed?: number;
  enable_base64_output?: boolean;
  enable_sync_mode?: boolean;
  loras?: LoraConfig[];
}

/**
 * POST /api/ai-generator/provider/wavespeed/z-image/turbo-lora
 * Z-Image Turbo LoRA 文生图 API (异步模式，使用 webhook，支持 LoRA 模型)
 */
export async function POST(request: NextRequest) {
  return handleWavespeedRequest(request, {
    endpoint: 'wavespeed-ai/z-image/turbo-lora',
    taskType: 'text-to-image',
    model: 'z-image-lora',

    // 参数处理回调函数
    processParams: (body: ZImageTurboLoraRequest): ProcessParamsResult | NextResponse => {
      // 解析参数
      const {
        prompt,
        size,
        seed,
        enable_base64_output = false,
        enable_sync_mode = false,
        loras = [],
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

      // 验证 size 格式 (例如: "1024*1536")
      const sizePattern = /^\d+\*\d+$/;
      if (!sizePattern.test(size)) {
        return NextResponse.json(
          { success: false, error: 'Invalid size format. Expected format: "width*height" (e.g., "1024*1536")' },
          { status: 400 }
        );
      }

      // 验证 loras 参数
      if (loras && !Array.isArray(loras)) {
        return NextResponse.json(
          { success: false, error: 'loras must be an array' },
          { status: 400 }
        );
      }

      // 构建 API 请求参数
      const apiParams: Record<string, any> = {
        prompt: `出现的女性角色是谢楚灵，${prompt}`,
        size,
        enable_base64_output,
        enable_sync_mode,
        seed: seed ?? -1, // 默认使用 -1 表示随机 seed
        loras,
      };

      // 返回处理结果
      return {
        // 用于积分计算的参数
        creditsParams: {},
        // 发送给 Wavespeed API 的参数
        apiParams,
        // 存储到数据库的参数
        dbParams: {
          prompt,
          size,
          seed: seed ?? -1,
          enable_base64_output,
          enable_sync_mode,
          loras,
        },
        // 配额消费描述
        description: `Z-Image Turbo LoRA generation${loras?.length ? ` with ${loras.length} LoRA(s)` : ''}: ${prompt.substring(0, 50)}...`,
      };
    },
  });
}

