import { NextRequest, NextResponse } from 'next/server';
import { handleFalRequest } from '@/lib/ai-generator/handleFalRequest';
import { ProcessParamsResult } from '@/lib/ai-generator/handleRequest';

// 请求参数接口
interface ImageToImageRequest {
  prompt: string;
  image_urls: string[];
  negative_prompt?: string;
  num_images?: number;
  guidance_scale?: number;
  seed?: number;
  quality?: 'low' | 'medium' | 'high';
  size?: '1024x1024' | '1024x1536' | '1536x1024';
}

/**
 * POST /api/ai-generator/provider/fal/gpt-image-1.5/image-to-image
 * GPT Image 1.5 图生图 API (异步模式，使用 webhook)
 */
export async function POST(request: NextRequest) {
  return handleFalRequest(request, {
    endpoint: 'fal-ai/gpt-image-1.5/edit',
    taskType: 'image-to-image',
    model: 'gpt-image-1.5',

    // 参数处理回调函数
    processParams: (body: ImageToImageRequest): ProcessParamsResult | NextResponse => {
      // 解析参数
      const {
        prompt,
        image_urls,
        negative_prompt,
        num_images,
        guidance_scale,
        seed,
        quality,
        size,
      } = body;

      // 验证必填参数
      if (!prompt || !prompt.trim()) {
        return NextResponse.json(
          { success: false, error: 'Prompt is required' },
          { status: 400 }
        );
      }

      if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
        return NextResponse.json(
          { success: false, error: 'At least one image URL is required' },
          { status: 400 }
        );
      }

      // 构建 API 请求参数
      const apiParams: Record<string, any> = {
        prompt,
        image_urls,
      };

      // 添加可选参数
      if (negative_prompt) {
        apiParams.negative_prompt = negative_prompt;
      }

      if (num_images) {
        apiParams.num_images = num_images;
      }

      if (guidance_scale !== undefined) {
        apiParams.guidance_scale = guidance_scale;
      }

      if (seed !== undefined) {
        apiParams.seed = seed;
      }

      if (quality) {
        apiParams.quality = quality;
      }

      if (size) {
        apiParams.size = size;
      }

      // 返回处理结果
      return {
        // 用于积分计算的参数
        creditsParams: {
          num_images: num_images || 1,
          quality: quality || 'medium',
          size: size || '1024x1024',
        },
        // 发送给 Fal AI API 的参数
        apiParams,
        // 存储到数据库的参数
        dbParams: {
          prompt,
          image_urls,
          negative_prompt,
          num_images,
          guidance_scale,
          seed,
          quality,
          size,
        },
        // 配额消费描述
        description: `Image-to-image generation: ${prompt.substring(0, 50)}...`,
      };
    },
  });
}
