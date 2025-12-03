import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { subscription } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

/**
 * 升级订阅 API
 * POST /api/subscription/upgrade
 *
 * 请求体:
 * - productId: 要升级到的产品ID
 * - updateBehavior: 升级行为 (默认: proration-charge-immediately)
 */
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { productId, updateBehavior = 'proration-charge-immediately' } = body;

    // 验证参数
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // 调用 Creem API 升级订阅
    const creemApiKey = process.env.CREEM_API_KEY;
    const creemApiUrl = process.env.CREEM_API_URL;

    if (!creemApiKey) {
      console.error('CREEM_API_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    const upgradeResponse = await fetch(
      `${creemApiUrl}/v1/subscriptions/${currentSubscription.paymentSubscriptionId}/upgrade`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': creemApiKey,
        },
        body: JSON.stringify({
          product_id: productId,
          update_behavior: updateBehavior,
        }),
      }
    );

    if (!upgradeResponse.ok) {
      const errorData = await upgradeResponse.json().catch(() => ({}));
      console.error('Failed to upgrade subscription:', errorData);
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to upgrade subscription' },
        { status: upgradeResponse.status }
      );
    }

    const upgradedSubscription = await upgradeResponse.json();

    // 更新本地数据库中的订阅信息
    // 注意: 详细的订阅更新会通过 webhook 处理
    await db
      .update(subscription)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(subscription.id, currentSubscription.id));

    return NextResponse.json({
      success: true,
      data: upgradedSubscription,
    });
  } catch (error) {
    console.error('Failed to upgrade subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
