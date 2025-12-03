import { db } from '@/lib/db';
import { subscription } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 订阅暂停事件处理器
 * 当订阅被暂停时触发
 */
export async function handleSubscriptionPaused(data: any) {
  const { id } = data;

  try {
    await db
      .update(subscription)
      .set({
        status: 'paused',
        updatedAt: new Date(),
      })
      .where(eq(subscription.paymentSubscriptionId, id));

    console.log(`✓ Subscription paused: ${id}`);
  } catch (error) {
    console.error('✗ Subscription paused handler error:', error);
    throw error;
  }
}
