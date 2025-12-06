import { NextRequest, NextResponse } from 'next/server';
import { handleWavespeedRequest } from '@/lib/ai-generator/handleWavespeedRequest';
import { ProcessParamsResult } from '@/lib/ai-generator/handleRequest';
import { validateImageUrls, filterValidImages } from '@/lib/ai-generator/utils';

// 请求参数接口
interface SeedreamImageToImageRequest {
  prompt: string;
  images: string[];
  enable_base64_output?: boolean;
  enable_sync_mode?: boolean;
}

/**
 * POST /api/ai-generator/provider/wavespeed/seedream-v4.5/image-to-image
 * Seedream v4.5 图生图 API (异步模式，使用 webhook)
 */
export async function POST(request: NextRequest) {
  return handleWavespeedRequest(request, {
    endpoint: 'bytedance/seedream-v4.5/edit',
    taskType: 'image-to-image',
    model: 'seedream-v4.5',

    // 参数处理回调函数
    processParams: (body: SeedreamImageToImageRequest): ProcessParamsResult | NextResponse => {
      // 解析参数
      const {
        prompt,
        images,
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
      };

      // 返回处理结果
      return {
        // 用于积分计算的参数
        creditsParams: {
          image_count: validImages.length,
        },
        // 发送给 Wavespeed API 的参数
        apiParams,
        // 存储到数据库的参数
        dbParams: {
          prompt,
          images: validImages,
          enable_base64_output,
          enable_sync_mode,
        },
        // 配额消费描述
        description: `Seedream v4.5 image-to-image: ${prompt.substring(0, 50)}...`,
      };
    },
  });
}

