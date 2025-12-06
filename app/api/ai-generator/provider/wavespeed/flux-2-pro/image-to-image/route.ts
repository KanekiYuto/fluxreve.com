import { NextRequest, NextResponse } from 'next/server';
import { handleWavespeedRequest } from '@/lib/ai-generator/handleWavespeedRequest';
import { ProcessParamsResult } from '@/lib/ai-generator/handleRequest';
import { validateImageUrls, filterValidImages } from '@/lib/ai-generator/utils';

// 请求参数接口
interface Flux2ProImageToImageRequest {
  prompt: string;
  images: string[];
  seed?: number;
  enable_base64_output?: boolean;
  enable_sync_mode?: boolean;
}

/**
 * POST /api/ai-generator/provider/wavespeed/flux-2-pro/image-to-image
 * Flux 2 Pro 图生图 API (异步模式，使用 webhook)
 */
export async function POST(request: NextRequest) {
  return handleWavespeedRequest(request, {
    endpoint: 'wavespeed-ai/flux-2-pro/edit',
    taskType: 'image-to-image',
    model: 'flux-2-pro',

    // 参数处理回调函数
    processParams: (body: Flux2ProImageToImageRequest): ProcessParamsResult | NextResponse => {
      // 解析参数
      const {
        prompt,
        images,
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

      // 验证图片数组
      if (!Array.isArray(images)) {
        return NextResponse.json(
          { success: false, error: 'Images must be an array' },
          { status: 400 }
        );
      }

      // 验证图片 URL
      const validationError = validateImageUrls(images);
      if (validationError) {
        return validationError;
      }

      // 过滤出有效的图片 URL
      const validImages = filterValidImages(images);

      // 构建 API 请求参数
      const apiParams: Record<string, any> = {
        prompt,
        images: validImages,
        enable_base64_output,
        enable_sync_mode,
        seed: seed ?? -1, // 默认使用 -1 表示随机 seed
      };

      // 返回处理结果
      return {
        // 用于积分计算的参数
        creditsParams: {
          image_count: validImages.length,
          seed,
        },
        // 发送给 Wavespeed API 的参数
        apiParams,
        // 存储到数据库的参数
        dbParams: {
          prompt,
          images: validImages,
          seed: seed ?? -1,
          enable_base64_output,
          enable_sync_mode,
        },
        // 配额消费描述
        description: `Flux 2 Pro image-to-image: ${prompt.substring(0, 50)}...`,
      };
    },
  });
}

