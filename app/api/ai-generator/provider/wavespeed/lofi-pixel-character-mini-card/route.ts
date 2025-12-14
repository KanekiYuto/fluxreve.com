import { NextRequest, NextResponse } from 'next/server';
import { handleWavespeedRequest } from '@/lib/ai-generator/handleWavespeedRequest';
import { ProcessParamsResult } from '@/lib/ai-generator/handleRequest';

// 请求参数接口
interface LofiPixelCharacterRequest {
  image: string;
  output_format?: 'jpeg' | 'png' | 'webp';
  enable_base64_output?: boolean;
  is_private?: boolean;
}

/**
 * POST /api/ai-generator/provider/wavespeed/lofi-pixel-character-mini-card
 * Lofi 像素字符生成器 API (异步模式，使用 webhook)
 */
export async function POST(request: NextRequest) {
  return handleWavespeedRequest(request, {
    endpoint: 'image-effects/lofi-pixel-character-mini-card',
    taskType: 'image-effects',
    model: 'lofi-pixel-character-mini-card',

    // 参数处理回调函数
    processParams: (body: LofiPixelCharacterRequest): ProcessParamsResult | NextResponse => {
      // 解析参数
      const {
        image,
        output_format = 'jpeg',
        enable_base64_output = false,
        is_private = false,
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
        is_private,
      };

      // 返回处理结果
      return {
        // 用于积分计算的参数
        creditsParams: {},
        // 发送给 Wavespeed API 的参数
        apiParams,
        // 存储到数据库的参数
        dbParams: {
          image,
          output_format: output_format.toLowerCase(),
          enable_base64_output,
          is_private,
        },
        // 配额消费描述
        description: `Lofi pixel character effect: ${image.substring(0, 50)}...`,
      };
    },
  });
}
