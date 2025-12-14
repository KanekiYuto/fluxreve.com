import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaGenerationTask, taskViewRecord } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getClientIp, getCountryFromHeaders } from '@/lib/utils/user-tracking';
import { auth } from '@/lib/auth';

/**
 * POST /api/ai-generator/tasks/[taskId]/view
 * 记录任务访问（公开接口，无需身份验证）
 *
 * 防刷机制：同一IP的同一任务只能记录一次访问
 * 使用事务确保访问记录插入和计数增加的原子性
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // 1. 获取IP地址
    const ip = getClientIp(request.headers);
    if (!ip) {
      return NextResponse.json(
        { success: false, error: 'Unable to determine IP address' },
        { status: 400 }
      );
    }

    // 2. 获取其他信息
    const userAgent = request.headers.get('user-agent') || null;
    const country = getCountryFromHeaders(request.headers);

    // 3. 尝试获取用户ID（如果已登录）
    let userId: string | null = null;
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      userId = session?.user?.id || null;
    } catch {
      // 未登录，忽略错误
    }

    // 4. 检查是否已有该IP的访问记录（防刷）
    const existing = await db
      .select()
      .from(taskViewRecord)
      .where(
        and(
          eq(taskViewRecord.taskId, taskId as any),
          eq(taskViewRecord.ipAddress, ip)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // 已访问过，直接返回成功（幂等）
      return NextResponse.json({ success: true, duplicate: true });
    }

    // 5. 使用事务：插入访问记录 + 增加计数
    await db.transaction(async (tx) => {
      // 插入访问记录
      await tx.insert(taskViewRecord).values({
        taskId: taskId as any,
        ipAddress: ip,
        userId,
        userAgent,
        country,
      });

      // 增加访问计数（使用 SQL 表达式增加计数）
      await tx
        .update(mediaGenerationTask)
        .set({ viewCount: sql`${mediaGenerationTask.viewCount} + 1` })
        .where(eq(mediaGenerationTask.taskId, taskId as any));
    });

    return NextResponse.json({ success: true, duplicate: false });
  } catch (error) {
    console.error('[Task View] Record error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
