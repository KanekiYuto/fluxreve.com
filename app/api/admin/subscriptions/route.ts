import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { subscription, user, transaction, quota } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { getPricingTierBySubscriptionPlanType } from '@/config/pricing';
import { QUOTA_EXCHANGE_RATE } from '@/config/subscription';

/**
 * 管理后台 - 获取所有订阅列表
 * GET /api/admin/subscriptions
 */
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 验证用户是否为管理员
    const currentUser = await db
      .select({ isAdmin: user.isAdmin })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser[0]?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 获取所有订阅（包含关联的用户信息）
    const subscriptions = await db
      .select({
        // 订阅信息
        id: subscription.id,
        userId: subscription.userId,
        paymentPlatform: subscription.paymentPlatform,
        paymentSubscriptionId: subscription.paymentSubscriptionId,
        paymentCustomerId: subscription.paymentCustomerId,
        planType: subscription.planType,
        nextPlanType: subscription.nextPlanType,
        status: subscription.status,
        amount: subscription.amount,
        currency: subscription.currency,
        startedAt: subscription.startedAt,
        expiresAt: subscription.expiresAt,
        nextBillingAt: subscription.nextBillingAt,
        canceledAt: subscription.canceledAt,
        createdAt: subscription.createdAt,
        // 用户信息
        userEmail: user.email,
        userName: user.name,
      })
      .from(subscription)
      .leftJoin(user, eq(subscription.userId, user.id))
      .orderBy(desc(subscription.createdAt));

    // 格式化数据
    const formattedSubscriptions = subscriptions.map((sub) => ({
      id: sub.id,
      userId: sub.userId,
      userEmail: sub.userEmail || '',
      userName: sub.userName || null,
      paymentPlatform: sub.paymentPlatform,
      paymentSubscriptionId: sub.paymentSubscriptionId,
      paymentCustomerId: sub.paymentCustomerId,
      planType: sub.planType,
      nextPlanType: sub.nextPlanType,
      status: sub.status,
      amount: Number(sub.amount) / 100, // 从美分转换为美元
      currency: sub.currency,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      nextBillingAt: sub.nextBillingAt,
      canceledAt: sub.canceledAt,
      createdAt: sub.createdAt,
    }));

    // 计算统计数据
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter((sub) => sub.status === 'active').length,
      canceled: subscriptions.filter((sub) => sub.status === 'canceled').length,
      expired: subscriptions.filter((sub) => sub.status === 'expired').length,
      monthlyRevenue: subscriptions
        .filter((sub) => sub.status === 'active')
        .reduce((sum, sub) => {
          const amount = Number(sub.amount) / 100; // 从美分转换为美元
          // 如果是年付计划，计算月均收入
          if (sub.planType.includes('yearly')) {
            return sum + amount / 12;
          }
          return sum + amount;
        }, 0),
    };

    return NextResponse.json({
      success: true,
      data: formattedSubscriptions,
      stats,
    });
  } catch (error) {
    console.error('Failed to fetch admin subscriptions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * 管理后台 - 创建订阅
 * POST /api/admin/subscriptions
 */
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 验证用户是否为管理员
    const currentUser = await db
      .select({ isAdmin: user.isAdmin })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser[0]?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { userEmail, planType, paymentPlatform, amount, currency, status } = body;

    // 验证必填字段
    if (!userEmail || !planType || !paymentPlatform || amount === undefined || !currency || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 查找用户
    const targetUser = await db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(eq(user.email, userEmail))
      .limit(1);

    if (!targetUser.length) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = targetUser[0].id;

    // 生成订阅 ID（用于支付平台）
    const subscriptionId = `sub_${crypto.randomBytes(12).toString('hex')}`;
    const customerId = `cus_${crypto.randomBytes(12).toString('hex')}`;

    // 计算订阅时间
    const now = new Date();
    const isYearly = planType.includes('yearly');
    const expiresAt = new Date(now);
    const nextBillingAt = new Date(now);

    if (isYearly) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      nextBillingAt.setFullYear(nextBillingAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      nextBillingAt.setMonth(nextBillingAt.getMonth() + 1);
    }

    // 获取订阅计划配置信息
    const pricingTier = getPricingTierBySubscriptionPlanType(planType);
    if (!pricingTier) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // 创建订阅记录
    const newSubscription = await db
      .insert(subscription)
      .values({
        userId,
        paymentPlatform,
        paymentSubscriptionId: subscriptionId,
        paymentCustomerId: customerId,
        planType,
        status,
        amount: Math.round(amount * 100), // 转换为美分
        currency,
        startedAt: now,
        expiresAt: status === 'active' ? expiresAt : null,
        nextBillingAt: status === 'active' ? nextBillingAt : null,
        canceledAt: status === 'canceled' ? now : null,
      })
      .returning();

    // 如果订阅状态为 active，执行后续操作
    if (status === 'active') {
      // 1. 创建交易记录
      const [transactionRecord] = await db.insert(transaction).values({
        userId,
        subscriptionId: newSubscription[0].id,
        paymentTransactionId: subscriptionId, // 使用订阅 ID 作为交易 ID
        type: 'subscription_payment',
        amount: Math.round(amount * 100), // 转换为美分
        currency,
      }).returning();

      console.log(`✓ Created transaction ${transactionRecord.id} - Amount paid: ${Math.round(amount * 100)}`);

      // 2. 发放配额（amount * QUOTA_EXCHANGE_RATE）
      const quotaAmount = Math.round(amount * QUOTA_EXCHANGE_RATE); // 配额等于支付金额乘以汇率

      await db.insert(quota).values({
        userId,
        transactionId: transactionRecord.id,
        type: planType, // 配额类型对应订阅计划类型
        amount: quotaAmount,
        consumed: 0,
        issuedAt: now,
        expiresAt: expiresAt,
      });

      console.log(`✓ Granted ${quotaAmount} quota to user ${userId} - Type: ${planType}`);

      // 3. 更新用户类型和当前订阅 ID
      await db
        .update(user)
        .set({
          userType: pricingTier.planType, // 更新为 'basic' 或 'pro'
          currentSubscriptionId: newSubscription[0].id,
          updatedAt: now,
        })
        .where(eq(user.id, userId));

      console.log(`✓ Updated user ${userId} type to ${pricingTier.planType} with subscription ${newSubscription[0].id}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newSubscription[0].id,
        userId: newSubscription[0].userId,
        userEmail: targetUser[0].email,
        paymentPlatform: newSubscription[0].paymentPlatform,
        paymentSubscriptionId: newSubscription[0].paymentSubscriptionId,
        planType: newSubscription[0].planType,
        status: newSubscription[0].status,
        amount: Number(newSubscription[0].amount) / 100,
        currency: newSubscription[0].currency,
        startedAt: newSubscription[0].startedAt,
        expiresAt: newSubscription[0].expiresAt,
        nextBillingAt: newSubscription[0].nextBillingAt,
        createdAt: newSubscription[0].createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to create subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
