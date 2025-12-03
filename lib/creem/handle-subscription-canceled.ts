import { db } from '@/lib/db';
import { subscription } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 订阅取消事件处理器
 * 当订阅被取消时触发
 */
export async function handleSubscriptionCanceled(data: any) {
  const { id } = data;

  try {
    await db
      .update(subscription)
      .set({
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscription.paymentSubscriptionId, id));

    console.log(`✓ Subscription canceled: ${id}`);
  } catch (error) {
    console.error('✗ Subscription canceled handler error:', error);
    throw error;
  }
}
