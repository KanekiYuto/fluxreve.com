import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createLora, queryLoras } from '@/lib/lora';
import type { CreateLoraInput } from '@/lib/lora/types';

/**
 * 获取 LoRA 列表
 * GET /api/lora?model=z-image&limit=50&offset=0
 */
export async function GET(request: NextRequest) {
  try {
    // 获取当前登录用户的会话
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const onlyMine = searchParams.get('onlyMine') === 'true';

    // 构建查询参数
    const queryParams: Parameters<typeof queryLoras>[0] = {
      model,
      limit,
      offset,
    };

    // 如果需要只查询自己的 LoRA，必须登录
    if (onlyMine) {
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      queryParams.userId = session.user.id;
    }

    const loras = await queryLoras(queryParams);

    return NextResponse.json({
      success: true,
      data: loras,
    });
  } catch (error) {
    console.error('Get LoRA list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 创建新的 LoRA
 * POST /api/lora
 */
export async function POST(request: NextRequest) {
  try {
    // 获取当前登录用户的会话
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // 检查用户是否已登录
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();

    // 验证必填字段
    if (!body.url || !body.title || !body.prompt || !body.compatibleModels) {
      return NextResponse.json(
        { error: 'Missing required fields: url, title, prompt, compatibleModels' },
        { status: 400 }
      );
    }

    // 验证 compatibleModels 是数组
    if (!Array.isArray(body.compatibleModels)) {
      return NextResponse.json(
        { error: 'compatibleModels must be an array' },
        { status: 400 }
      );
    }

    // 构建创建参数
    const input: CreateLoraInput = {
      url: body.url,
      triggerWord: body.triggerWord,
      prompt: body.prompt,
      title: body.title,
      description: body.description,
      userId: session.user.id,
      compatibleModels: body.compatibleModels,
      assetUrls: body.assetUrls || [],
    };

    // 创建 LoRA
    const newLora = await createLora(input);

    return NextResponse.json({
      success: true,
      data: newLora,
    });
  } catch (error) {
    console.error('Create LoRA error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
