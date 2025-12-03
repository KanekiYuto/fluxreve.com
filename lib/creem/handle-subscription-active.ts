import { db } from '@/lib/db';
import { user, subscription } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getPricingTierByProductId } from '@/config/pricing';

/**
 * 订阅激活事件处理器
 * 当订阅首次激活时触发，仅创建订阅记录
 * 交易和积分发放由 onSubscriptionPaid 事件处理
 */
export async function handleSubscriptionActive(data: any) {
  const {
    id,
    customer,
    product,
    next_transaction_date,
    current_period_end_date,
    metadata
  } = data;

  const userId = (metadata?.referenceId) as string || null;

  // 从产品ID获取订阅计划信息
  const pricingTier = getPricingTierByProductId(product.id);

  if (!pricingTier) {
    console.error('✗ Subscription active: Product ID not found in pricing config', { productId: product.id });
    return;
  }

  const planInfo = {
    planType: pricingTier.planType,
    subscriptionPlanType: pricingTier.subscriptionPlanType,
  };

  if (!userId || !planInfo?.subscriptionPlanType) {
    console.error('✗ Subscription active: Missing required data', { userId, productId: product.id, planInfo });
    return;
  }

  try {
    // 创建订阅记录并更新用户的当前订阅ID
    const [subscriptionRecord] = await db
      .insert(subscription)
      .values({
        userId,
        paymentPlatform: 'creem',
        paymentSubscriptionId: id,
        paymentCustomerId: customer?.id || '',
        planType: planInfo.subscriptionPlanType,
        status: 'active',
        amount: product.price,
        currency: product.currency || 'USD',
        startedAt: new Date(),
        expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
        nextBillingAt: next_transaction_date ? new Date(next_transaction_date) : null,
      })
      .returning();

    await db
      .update(user)
      .set({
        currentSubscriptionId: subscriptionRecord.id,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    console.log(`✓ Created subscription for user ${userId} - Subscription ID: ${id}`);

  } catch (error) {
    console.error('✗ Subscription active handler error:', error);
    throw error;
  }
}
