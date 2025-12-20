import { db } from '@/lib/db';
import { quota } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { quotaConfig, getDailyFreeQuotaByCountry } from './config';
import { USER_TYPE, type UserType } from '@/config/constants';

/**
 * 检查并下发每日免费配额
 * @param userId 用户ID
 * @param userType 用户类型
 * @param countryCode 国家代码 (ISO 3166-1 alpha-2)
 * @returns 是否成功下发配额
 */
export async function checkAndIssueDailyQuota(
  userId: string,
  userType: UserType,
  countryCode?: string
): Promise<boolean> {
  // 只为免费用户下发每日配额
  if (userType !== USER_TYPE.FREE) {
    return false;
  }

  try {
    // 获取当前时间
    const now = new Date();

    // 计算今天开始时间 (UTC 00:00:00)
    const todayStart = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));

    // 计算今天结束时间 (UTC 23:59:59.999)
    const todayEnd = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59, 999
    ));

    // 检查今天是否已经下发过配额
    const existingQuota = await db
      .select()
      .from(quota)
      .where(
        and(
          eq(quota.userId, userId),
          eq(quota.type, quotaConfig.quotaTypes.dailyFree),
          gte(quota.issuedAt, todayStart)
        )
      )
      .limit(1);

    // 如果今天已经下发过,则不再下发
    if (existingQuota.length > 0) {
      return false;
    }

    // 根据国家代码获取配额数量
    const quotaAmount = getDailyFreeQuotaByCountry(countryCode);

    // 下发每日免费配额 (id 由数据库自动生成 UUID)
    await db.insert(quota).values({
      userId: userId,
      type: quotaConfig.quotaTypes.dailyFree,
      amount: quotaAmount,
      consumed: 0,
      issuedAt: new Date(),
      expiresAt: todayEnd, // 当天23:59:59过期
    });

    return true;
  } catch (error) {
    console.error('Failed to issue daily quota:', error);
    return false;
  }
}

/**
 * 获取用户当前可用配额总数
 * @param userId 用户ID
 * @returns 可用配额总数
 */
export async function getAvailableQuota(userId: string): Promise<number> {
  try {
    const now = new Date();

    // 获取所有未过期的配额
    const userQuotas = await db
      .select()
      .from(quota)
      .where(
        and(
          eq(quota.userId, userId),
          // 过期时间为null或大于当前时间
          gte(quota.expiresAt, now)
        )
      );

    // 计算总的可用配额 (总配额 - 已消耗)
    const totalAvailable = userQuotas.reduce((sum, q) => {
      return sum + (q.amount - q.consumed);
    }, 0);

    return Math.max(0, totalAvailable);
  } catch (error) {
    console.error('Failed to get available quota:', error);
    return 0;
  }
}

/**
 * 消耗配额
 * @param userId 用户ID
 * @param amount 消耗数量
 * @returns 是否成功消耗
 */
export async function consumeQuota(
  userId: string,
  amount: number = 1
): Promise<boolean> {
  try {
    const now = new Date();

    // 获取所有未过期的配额,按过期时间排序(先到期的先用)
    const userQuotas = await db
      .select()
      .from(quota)
      .where(
        and(
          eq(quota.userId, userId),
          gte(quota.expiresAt, now)
        )
      )
      .orderBy(quota.expiresAt);

    // 检查是否有无限配额
    const unlimitedQuota = userQuotas.find((q) => q.amount === -1);
    if (unlimitedQuota) {
      // 有无限配额,直接返回成功(不需要更新consumed)
      return true;
    }

    // 计算总的可用配额
    const totalAvailable = userQuotas.reduce((sum, q) => {
      return sum + (q.amount - q.consumed);
    }, 0);

    // 检查配额是否足够
    if (totalAvailable < amount) {
      return false;
    }

    // 从配额中扣除,优先使用即将过期的配额
    let remaining = amount;
    for (const q of userQuotas) {
      if (remaining <= 0) break;

      const available = q.amount - q.consumed;
      if (available <= 0) continue;

      const toConsume = Math.min(available, remaining);

      // 更新配额消耗量
      await db
        .update(quota)
        .set({
          consumed: q.consumed + toConsume,
          updatedAt: new Date(),
        })
        .where(eq(quota.id, q.id));

      remaining -= toConsume;
    }

    return true;
  } catch (error) {
    console.error('Failed to consume quota:', error);
    return false;
  }
}
