import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 验证用户是否为管理员
 * @param userId - 用户 ID
 * @returns 是否为管理员
 */
export async function verifyAdmin(userId: string): Promise<boolean> {
  try {
    const result = await db
      .select({ isAdmin: user.isAdmin })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return result[0]?.isAdmin || false;
  } catch (error) {
    console.error('Failed to verify admin status:', error);
    return false;
  }
}
