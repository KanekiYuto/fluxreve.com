import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaGenerationTask } from '@/lib/db/schema';
import { randomUUID } from 'crypto';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { generateShareId } from '@/lib/utils/generate-share-id';
import { getRequiredCredits } from '@/config/ai-generator';
import { getAvailableQuota, consumeQuota } from '@/lib/quota';

// Wavespeed API 配置
const WAVESPEED_API_URL = 'https://api.wavespeed.ai/api/v3/google/nano-banana-pro/text-to-image';
const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL;

// 请求参数接口
interface TextToImageRequest {
  prompt: string;
  aspect_ratio?: string;
  output_format?: 'png' | 'jpeg' | 'webp';
  resolution?: '1k' | '2k' | '4k';
  seed?: string;
}

// Wavespeed API 响应接口
interface WavespeedResponse {
  request_id: string;
  status: string;
  output?: {
    images?: string[];
  };
  error?: {
    message: string;
    code: string;
  };
}

/**
 * POST /api/ai-generator/provider/wavespeed/nano-banana-pro/text-to-image
 * Nano Banana Pro 文生图 API (异步模式，使用 webhook)
 */
export async function POST(request: NextRequest) {
  try {
    // 验证 API Key
    if (!WAVESPEED_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Wavespeed API key not configured' },
        { status: 500 }
      );
    }

    // 解析请求参数
    const body: TextToImageRequest = await request.json();
    const {
      prompt,
      aspect_ratio = '1:1',
      output_format = 'png',
      resolution = '1k',
      seed,
    } = body;

    // 验证必填参数
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // 验证 webhook 配置
    if (!APP_URL) {
      return NextResponse.json(
        { success: false, error: 'Webhook URL not configured' },
        { status: 500 }
      );
    }

    // 获取当前用户
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 计算需要消耗的配额
    const creditsRequired = getRequiredCredits('text-to-image', 'nano-banana-pro', {
      resolution,
      aspect_ratio,
      seed,
    });

    // 检查可用配额
    const availableCredits = await getAvailableQuota(userId);

    if (availableCredits < creditsRequired) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient credits',
          required: creditsRequired,
          available: availableCredits,
        },
        { status: 400 }
      );
    }

    // 1. 先生成 taskId
    const taskId = randomUUID();

    // 2. 构建 webhook URL
    const webhookUrl = `${APP_URL}/api/ai-generator/webhook/wavespeed/${taskId}`;

    // 3. 构建请求参数
    const requestParams: Record<string, any> = {
      prompt,
      aspect_ratio,
      output_format,
      resolution,
      enable_base64_output: false,
      enable_sync_mode: false,
    };

    // 如果提供了 seed，添加到参数中
    if (seed) {
      requestParams.seed = parseInt(seed, 10);
    }

    // 4. 构建包含 webhook 的 API URL
    const apiUrlWithWebhook = `${WAVESPEED_API_URL}?webhook=${encodeURIComponent(webhookUrl)}`;

    // 5. 调用 Wavespeed API
    const response = await fetch(apiUrlWithWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WAVESPEED_API_KEY}`,
      },
      body: JSON.stringify(requestParams),
    });

    const data: WavespeedResponse = await response.json();

    // 处理错误响应
    if (!response.ok || data.error) {
      console.error('Wavespeed API error:', data.error);
      return NextResponse.json(
        {
          success: false,
          error: data.error?.message || 'Failed to generate image',
          code: data.error?.code,
        },
        { status: response.status }
      );
    }

    // 6. 先消费配额
    const consumeResult = await consumeQuota(
      userId,
      creditsRequired,
      `Text-to-image generation: ${prompt.substring(0, 50)}...`
    );

    if (!consumeResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: consumeResult.error || 'Failed to consume quota',
        },
        { status: 500 }
      );
    }

    // 7. 生成 shareId 并创建任务记录
    const taskType = 'text-to-image';
    const model = 'nano-banana-pro';
    const shareId = generateShareId(taskType, model);

    await db.insert(mediaGenerationTask).values({
      taskId,
      shareId,
      userId,
      taskType,
      provider: 'wavespeed',
      providerRequestId: data.request_id,
      model,
      status: 'pending',
      progress: 0,
      parameters: {
        prompt,
        aspect_ratio,
        output_format,
        resolution,
        seed,
      },
      consumeTransactionId: consumeResult.transactionId!,
      startedAt: new Date(),
    });

    // 返回任务ID和分享ID，前端可以通过轮询获取进度
    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        share_id: shareId,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Text-to-image generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
