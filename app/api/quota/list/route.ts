import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { quota } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * 获取用户配额列表
 * GET /api/quota/list?type=active|expired
 * 支持通过 type 参数获取指定类型的配额
 */
export async function GET(request: NextRequest) {
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

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'active' | 'expired' | null

    // 获取所有配额(包括已过期和未过期的)
    const allQuotas = await db
      .select()
      .from(quota)
      .where(eq(quota.userId, userId))
      .orderBy(desc(quota.issuedAt));

    // 分类配额
    const activeQuotas = allQuotas.filter(
      (q) => !q.expiresAt || q.expiresAt > now
    );
    const expiredQuotas = allQuotas.filter(
      (q) => q.expiresAt && q.expiresAt <= now
    );

    const mapQuota = (q: typeof allQuotas[0]) => ({
      id: q.id,
      type: q.type,
      amount: q.amount,
      consumed: q.consumed,
      available: Math.max(0, q.amount - q.consumed),
      issuedAt: q.issuedAt,
      expiresAt: q.expiresAt,
    });

    // 根据 type 参数返回不同的数据
    if (type === 'active') {
      return NextResponse.json({
        success: true,
        data: activeQuotas.map(mapQuota),
      });
    }

    if (type === 'expired') {
      return NextResponse.json({
        success: true,
        data: expiredQuotas.map(mapQuota),
      });
    }

    // 如果没有指定 type，返回所有数据（向后兼容）
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
        activeQuotas: activeQuotas.map(mapQuota),
        expiredQuotas: expiredQuotas.map(mapQuota),
      },
    });
  } catch (error) {
    console.error('Get quota list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
