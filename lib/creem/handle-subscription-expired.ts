import { db } from '@/lib/db';
import { subscription } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 订阅过期事件处理器
 * 当订阅过期时触发
 */
export async function handleSubscriptionExpired(data: any) {
  const { id } = data;

  try {
    await db
      .update(subscription)
      .set({
        status: 'expired',
        updatedAt: new Date(),
      })
      .where(eq(subscription.paymentSubscriptionId, id));

    console.log(`✓ Subscription expired: ${id}`);
  } catch (error) {
    console.error('✗ Subscription expired handler error:', error);
    throw error;
  }
}
