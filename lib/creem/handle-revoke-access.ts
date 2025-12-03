import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 撤销访问权限事件处理器
 * 在以下情况触发:
 * - 订阅暂停 (subscription.paused)
 * - 订阅过期 (subscription.expired)
 *
 * 撤销用户权限,将用户降级为免费用户
 */
export async function handleRevokeAccess(data: any) {
  const { reason, customer, product, metadata } = data;
  const userId = (metadata?.referenceId) as string || null;

  console.log(`Revoke access: ${reason} - User: ${userId}, Email: ${customer?.email}, Product: ${product.name}`);

  // 验证必需字段
  if (!userId) {
    console.error('✗ Revoke access: Missing user ID');
    return;
  }

  try {
    await db
      .update(user)
      .set({
        userType: 'free',
        currentSubscriptionId: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    console.log(`✓ Revoked access from user ${userId} (${customer?.email})`);
  } catch (error) {
    console.error('✗ Revoke access handler error:', error);
    throw error;
  }
}
