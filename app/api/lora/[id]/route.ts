import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getLoraById, updateLora, deleteLora, isLoraOwner } from '@/lib/lora';
import type { UpdateLoraInput } from '@/lib/lora/types';

/**
 * 获取 LoRA 详情
 * GET /api/lora/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 获取 LoRA
    const lora = await getLoraById(id);

    if (!lora) {
      return NextResponse.json(
        { error: 'LoRA not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lora,
    });
  } catch (error) {
    console.error('Get LoRA error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 更新 LoRA
 * PATCH /api/lora/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // 检查用户是否拥有该 LoRA
    const isOwner = await isLoraOwner(id, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this LoRA' },
        { status: 403 }
      );
    }

    // 解析请求体
    const body = await request.json();

    // 构建更新参数
    const input: UpdateLoraInput = {};
    if (body.url !== undefined) input.url = body.url;
    if (body.triggerWord !== undefined) input.triggerWord = body.triggerWord;
    if (body.prompt !== undefined) input.prompt = body.prompt;
    if (body.title !== undefined) input.title = body.title;
    if (body.description !== undefined) input.description = body.description;
    if (body.compatibleModels !== undefined) {
      // 验证是数组
      if (!Array.isArray(body.compatibleModels)) {
        return NextResponse.json(
          { error: 'compatibleModels must be an array' },
          { status: 400 }
        );
      }
      input.compatibleModels = body.compatibleModels;
    }
    if (body.assetUrls !== undefined) {
      // 验证是数组
      if (!Array.isArray(body.assetUrls)) {
        return NextResponse.json(
          { error: 'assetUrls must be an array' },
          { status: 400 }
        );
      }
      input.assetUrls = body.assetUrls;
    }

    // 更新 LoRA
    const updatedLora = await updateLora(id, input);

    if (!updatedLora) {
      return NextResponse.json(
        { error: 'LoRA not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedLora,
    });
  } catch (error) {
    console.error('Update LoRA error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 删除 LoRA
 * DELETE /api/lora/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // 检查用户是否拥有该 LoRA
    const isOwner = await isLoraOwner(id, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this LoRA' },
        { status: 403 }
      );
    }

    // 删除 LoRA
    const success = await deleteLora(id);

    if (!success) {
      return NextResponse.json(
        { error: 'LoRA not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'LoRA deleted successfully',
    });
  } catch (error) {
    console.error('Delete LoRA error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
