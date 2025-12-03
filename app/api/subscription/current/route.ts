import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { subscription } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

/**
 * 获取用户当前的订阅信息
 * GET /api/subscription/current
 */
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 查询用户的当前激活订阅
    const [currentSubscription] = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.userId, userId),
          eq(subscription.status, 'active')
        )
      )
      .orderBy(subscription.createdAt)
      .limit(1);

    if (!currentSubscription) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: currentSubscription,
    });
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
