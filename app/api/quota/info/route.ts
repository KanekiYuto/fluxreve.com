import { NextResponse } from 'next/server';
import { getAvailableQuota } from '@/lib/quota';
import { db } from '@/lib/db';
import { quota } from '@/lib/db/schema';
import { eq, and, gte, or, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  try {
    // 从 session 中获取当前用户
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 获取可用配额总数
    const availableQuota = await getAvailableQuota(userId);

    // 获取最近的配额记录(用于显示过期时间)
    const now = new Date();
    const recentQuota = await db
      .select()
      .from(quota)
      .where(
        and(
          eq(quota.userId, userId),
          or(
            gte(quota.expiresAt, now),
            isNull(quota.expiresAt)
          )
        )
      )
      .orderBy(quota.expiresAt)
      .limit(1);

    // 获取过期时间
    const expiresAt = recentQuota.length > 0 ? recentQuota[0].expiresAt : null;

    return NextResponse.json({
      success: true,
      data: {
        available: availableQuota,
        expiresAt: expiresAt,
      },
    });
  } catch (error) {
    console.error('获取配额信息失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
