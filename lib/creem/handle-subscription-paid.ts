import { db } from '@/lib/db';
import { subscription, transaction, quota } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getPricingTierByProductId } from '@/config/pricing';
import { getSubscriptionQuota } from '@/config/subscription';
import { user } from '@/lib/db/schema';
/**
 * 订阅支付成功事件处理器
 * 当订阅支付成功时触发（首次支付、续费或升级）
 * 根据产品配置发放对应的积分配额
 */
export async function handleSubscriptionPaid(data: any) {
  const {
    id,
    last_transaction,
    last_transaction_id,
    product,
    current_period_end_date,
    next_transaction_date,
    metadata
  } = data;

  const userId = (metadata?.referenceId) as string || null;

  // 从产品ID获取订阅计划信息
  const pricingTier = getPricingTierByProductId(product.id);

  if (!pricingTier) {
    console.error('✗ Subscription paid: Product ID not found in pricing config', { productId: product.id });
    return;
  }

  if (!userId || !pricingTier.subscriptionPlanType) {
    console.error('✗ Subscription paid: Missing required data', { userId, productId: product.id, pricingTier });
    return;
  }

  // 根据订阅计划类型从配置中获取积分配额
  const quotaAmount = getSubscriptionQuota(pricingTier.subscriptionPlanType);

  try {
    // 查找当前激活的订阅
    const [existingSubscription] = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.userId, userId),
          eq(subscription.status, 'active')
        )
      )
      .limit(1);

    if (!existingSubscription) {
      console.error(`✗ Active subscription not found for user: ${userId}`);
      return;
    }

    // 检查是否为重复推送（通过比较 nextBillingAt 和 next_transaction_date）
    const newNextBillingAt = new Date(next_transaction_date);
    if (existingSubscription.nextBillingAt &&
        existingSubscription.nextBillingAt.getTime() === newNextBillingAt.getTime()) {
      console.log(`⚠ Duplicate webhook detected for subscription ${existingSubscription.id} - nextBillingAt already set to ${newNextBillingAt.toISOString()}`);
      return;
    }

    // 更新订阅信息
    await db
      .update(subscription)
      .set({
        planType: pricingTier.subscriptionPlanType,
        amount: product.price,
        currency: product.currency,
        expiresAt: new Date(current_period_end_date),
        nextBillingAt: newNextBillingAt,
        updatedAt: new Date(),
      })
      .where(eq(subscription.id, existingSubscription.id));

    // 更新用户类型
    await db
      .update(user)
      .set({
        userType: pricingTier.planType,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    console.log(`✓ Subscription updated: ${id} - Plan: ${pricingTier.subscriptionPlanType}, Quota: ${quotaAmount}`);

    // 如果有交易信息且支付金额大于0，创建交易记录并发放积分
    if (last_transaction && last_transaction.amount_paid > 0) {
      // 1. 创建交易记录
      const [transactionRecord] = await db.insert(transaction).values({
        userId,
        subscriptionId: existingSubscription.id,
        paymentTransactionId: last_transaction_id || last_transaction.id,
        type: 'subscription_payment',
        amount: last_transaction.amount_paid,
        currency: last_transaction.currency || 'USD',
      }).returning();

      console.log(`✓ Created transaction ${transactionRecord.id} - Amount paid: ${last_transaction.amount_paid} ${last_transaction.currency || 'USD'}`);

      // 2. 根据产品配置发放积分配额
      await db.insert(quota).values({
        userId,
        transactionId: transactionRecord.id,
        type: pricingTier.subscriptionPlanType,
        amount: quotaAmount,
        consumed: 0,
        issuedAt: new Date(),
        expiresAt: current_period_end_date ? new Date(current_period_end_date) : null,
      });

      console.log(`✓ Granted ${quotaAmount} quota to user ${userId} - Plan: ${pricingTier.subscriptionPlanType}`);
    } else {
      console.log(`⚠ No quota granted: amount_paid is ${last_transaction?.amount_paid || 0}`);
    }

  } catch (error) {
    console.error('✗ Subscription paid handler error:', error);
    throw error;
  }
}
