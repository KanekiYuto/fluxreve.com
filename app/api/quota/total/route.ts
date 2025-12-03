import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { quota } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * 获取用户总配额
 * GET /api/quota/total
 */
export async function GET() {
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

    const userId = session.user.id;
    const now = new Date();

    // 获取所有配额
    const allQuotas = await db
      .select()
      .from(quota)
      .where(eq(quota.userId, userId))
      .orderBy(desc(quota.issuedAt));

    // 只计算有效配额（未过期）
    const activeQuotas = allQuotas.filter(
      (q) => !q.expiresAt || q.expiresAt > now
    );

    // 计算总可用配额
    let totalAvailable = 0;
    for (const q of activeQuotas) {
      const available = q.amount - q.consumed;
      totalAvailable += Math.max(0, available);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalAvailable,
      },
    });
  } catch (error) {
    console.error('Get total quota error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
