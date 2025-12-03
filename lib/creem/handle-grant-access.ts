import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getPricingTierByProductId } from '@/config/pricing';

/**
 * 授予访问权限事件处理器
 * 在以下情况触发:
 * - 订阅激活 (subscription.active)
 * - 订阅试用 (subscription.trialing)
 * - 订阅续费成功 (subscription.paid)
 *
 * 更新用户的订阅状态,授予相应权限
 */
export async function handleGrantAccess(data: any) {
  const { reason, customer, product, metadata } = data;
  const userId = (metadata?.referenceId) as string || null;

  // 从产品ID获取订阅计划信息
  const pricingTier = getPricingTierByProductId(product.id);

  if (!pricingTier) {
    console.error('✗ Grant access: Product ID not found in pricing config', { productId: product.id });
    return;
  }

  const planInfo = {
    planType: pricingTier.planType,
    subscriptionPlanType: pricingTier.subscriptionPlanType,
  };

  console.log(`Grant access: ${reason} - User: ${userId}, Email: ${customer?.email}, Product: ${product.name}`);

  // 验证必需字段
  if (!userId || !planInfo?.planType) {
    console.error('✗ Grant access: Missing required data', { userId, productId: product.id, planInfo });
    return;
  }
}
