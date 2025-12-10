import { db } from '@/lib/db';
import { subscription, transaction, quota, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getPricingTierByProductId } from '@/config/pricing';
import { getSubscriptionQuota } from '@/config/subscription';

/**
 * 一次性付费完成事件处理器
 * 仅处理 Trial 产品（NEXT_PUBLIC_CREEM_PAY_TRIAL_ID）的一次性付费
 * 将一次性付费作为一个月的订阅来处理
 */
export async function handleCheckoutCompleted(data: any) {
  const {
    id,
    order,
    product,
    customer,
    metadata,
  } = data;

  const userId = (metadata?.referenceId) as string || null;

  // 仅处理 Trial 产品
  const trialProductId = process.env.NEXT_PUBLIC_CREEM_PAY_TRIAL_ID;
  if (product.id !== trialProductId) {
    console.log(`⚠ Checkout completed: Skipping non-trial product - Product ID: ${product.id}`);
    return;
  }

  // 从产品ID获取定价信息
  const pricingTier = getPricingTierByProductId(product.id);

  if (!pricingTier) {
    console.error('✗ Checkout completed: Product ID not found in pricing config', { productId: product.id });
    return;
  }

  const planInfo = {
    planType: pricingTier.planType,
    subscriptionPlanType: pricingTier.subscriptionPlanType,
    quota: pricingTier.price * 100,
  };

  if (!userId || !planInfo?.subscriptionPlanType) {
    console.error('✗ Checkout completed: Missing required data', { userId, productId: product.id, planInfo });
    return;
  }

  try {
    // 计算订阅过期时间（一个月后）
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // 1. 检查是否已存在 Trial 订阅
    // Trial 订阅只能存在一个，如果用户已有 Trial 订阅则不处理
    const [existingTrialSubscription] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId))
      .limit(1);

    if (existingTrialSubscription && existingTrialSubscription.planType === planInfo.subscriptionPlanType) {
      console.log(`⚠ Trial subscription already exists for user ${userId} - Skipping duplicate Trial purchase`);
      return;
    }

    let subscriptionId: string;

    // 2. 创建新的 Trial 订阅记录
    const [newSubscription] = await db
      .insert(subscription)
      .values({
        userId,
        paymentPlatform: 'creem',
        paymentSubscriptionId: id,
        paymentCustomerId: customer?.id || '',
        planType: planInfo.subscriptionPlanType,
        status: 'active',
        amount: order.amount,
        currency: order.currency || 'USD',
        startedAt: new Date(),
        expiresAt,
      })
      .returning();

    subscriptionId = newSubscription.id;
    console.log(`✓ Trial subscription created via checkout: ${id} - User: ${userId}`);

    // 3. 更新用户类型
    await db
      .update(user)
      .set({
        userType: planInfo.planType,
        currentSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    // 4. 创建交易记录
    const [transactionRecord] = await db
      .insert(transaction)
      .values({
        userId,
        subscriptionId,
        paymentTransactionId: order.transaction || id,
        type: 'one_time_payment',
        amount: order.amount_paid || order.amount,
        currency: order.currency || 'USD',
      })
      .returning();

    console.log(`✓ Created transaction ${transactionRecord.id} - Amount paid: ${order.amount_paid || order.amount}`);

    // 5. 发放配额
    const quotaAmount = getSubscriptionQuota(planInfo.subscriptionPlanType);

    await db.insert(quota).values({
      userId,
      transactionId: transactionRecord.id,
      type: planInfo.subscriptionPlanType,
      amount: quotaAmount,
      consumed: 0,
      issuedAt: new Date(),
      expiresAt,
    });

    console.log(`✓ Granted ${quotaAmount} quota to user ${userId} - Type: ${planInfo.subscriptionPlanType}`);

  } catch (error) {
    console.error('✗ Checkout completed handler error:', error);
    throw error;
  }
}
