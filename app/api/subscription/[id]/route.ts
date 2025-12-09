import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { subscription, transaction } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * 获取指定订阅的详细信息
 * GET /api/subscription/[id]
 *
 * 参数 id: 支付平台订阅 ID (例如: "sub_xxx")
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // 使用 payment_subscription_id 查询订阅信息
    const [subscriptionData] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.paymentSubscriptionId, id))
      .limit(1);

    if (!subscriptionData) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // 验证订阅属于当前用户
    if (subscriptionData.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 查询该订阅最新的交易记录，获取 paymentTransactionId
    const [latestTransaction] = await db
      .select()
      .from(transaction)
      .where(eq(transaction.subscriptionId, subscriptionData.id))
      .orderBy(desc(transaction.createdAt))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        ...subscriptionData,
        paymentTransactionId: latestTransaction?.paymentTransactionId || null,
      },
    });
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
