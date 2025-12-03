/**
 * 配额管理模块
 * 用于处理配额的消费、退款等操作
 */

import { db } from '@/lib/db';
import { quota, quotaTransaction } from '@/lib/db/schema';
import { eq, and, gt, or, isNull } from 'drizzle-orm';

/**
 * 配额消费结果
 */
export interface ConsumeQuotaResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * 配额退款结果
 */
export interface RefundQuotaResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * 消费配额
 * @param userId 用户ID
 * @param amount 消费数量
 * @param note 备注信息
 * @returns 消费结果
 */
export async function consumeQuota(
  userId: string,
  amount: number,
  note: string
): Promise<ConsumeQuotaResult> {
  try {
    // 参数验证
    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0',
      };
    }

    // 查找可用的配额记录
    const availableQuotas = await db
      .select()
      .from(quota)
      .where(
        and(
          eq(quota.userId, userId),
          gt(quota.amount, quota.consumed),
          or(isNull(quota.expiresAt), gt(quota.expiresAt, new Date()))
        )
      )
      .orderBy(quota.issuedAt);

    // 检查是否有可用配额记录
    if (availableQuotas.length === 0) {
      return {
        success: false,
        error: 'No available quota records',
      };
    }

    // 计算总可用配额
    const totalAvailable = availableQuotas.reduce(
      (sum, q) => sum + (q.amount - q.consumed),
      0
    );

    // 检查配额是否充足
    if (totalAvailable < amount) {
      return {
        success: false,
        error: 'Insufficient credits',
      };
    }

    // 扣除配额
    let remainingToConsume = amount;
    let selectedQuotaId: string | null = null;
    let balanceBefore = 0;
    let balanceAfter = 0;

    for (const quotaRecord of availableQuotas) {
      if (remainingToConsume <= 0) break;

      const available = quotaRecord.amount - quotaRecord.consumed;
      const toConsume = Math.min(available, remainingToConsume);

      if (!selectedQuotaId) {
        selectedQuotaId = quotaRecord.id;
        balanceBefore = available;
      }

      // 更新配额消耗
      await db
        .update(quota)
        .set({
          consumed: quotaRecord.consumed + toConsume,
          updatedAt: new Date(),
        })
        .where(eq(quota.id, quotaRecord.id));

      remainingToConsume -= toConsume;

      if (quotaRecord.id === selectedQuotaId) {
        balanceAfter = balanceBefore - toConsume;
      }
    }

    // 确保选择了配额记录
    if (!selectedQuotaId) {
      return {
        success: false,
        error: 'Failed to select quota record',
      };
    }

    // 创建配额交易记录
    const [transaction] = await db
      .insert(quotaTransaction)
      .values({
        userId,
        quotaId: selectedQuotaId,
        type: 'consume',
        amount: -amount,
        balanceBefore,
        balanceAfter,
        note,
      })
      .returning();

    return {
      success: true,
      transactionId: transaction.id,
    };
  } catch (error) {
    console.error('Consume quota error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to consume quota',
    };
  }
}

/**
 * 退款配额
 * @param consumeTransactionId 原始消费交易ID（必填，用于保证对账正确）
 * @param note 备注信息
 * @returns 退款结果
 */
export async function refundQuota(
  consumeTransactionId: string,
  note: string
): Promise<RefundQuotaResult> {
  try {
    // 1. 查找原始消费交易记录
    const [consumeTransaction] = await db
      .select()
      .from(quotaTransaction)
      .where(eq(quotaTransaction.id, consumeTransactionId));

    if (!consumeTransaction) {
      return {
        success: false,
        error: 'Consume transaction not found',
      };
    }

    // 验证交易类型
    if (consumeTransaction.type !== 'consume') {
      return {
        success: false,
        error: 'Transaction is not a consume type',
      };
    }

    // 2. 检查是否已经退款过（防止重复退款）
    const existingRefunds = await db
      .select()
      .from(quotaTransaction)
      .where(
        and(
          eq(quotaTransaction.relatedTransactionId, consumeTransactionId),
          eq(quotaTransaction.type, 'refund')
        )
      );

    if (existingRefunds.length > 0) {
      return {
        success: false,
        error: 'Transaction has already been refunded',
      };
    }

    // 3. 获取原始消费的配额数量（消费记录中 amount 是负数）
    const refundAmount = Math.abs(consumeTransaction.amount);

    if (refundAmount <= 0) {
      return {
        success: false,
        error: 'Invalid refund amount',
      };
    }

    // 4. 查找原始消费的配额记录
    const [targetQuota] = await db
      .select()
      .from(quota)
      .where(eq(quota.id, consumeTransaction.quotaId));

    if (!targetQuota) {
      return {
        success: false,
        error: 'Quota record not found',
      };
    }

    const balanceBefore = targetQuota.amount - targetQuota.consumed;

    // 5. 更新配额（减少已消耗的数量，即退款）
    await db
      .update(quota)
      .set({
        consumed: Math.max(0, targetQuota.consumed - refundAmount),
        updatedAt: new Date(),
      })
      .where(eq(quota.id, targetQuota.id));

    const balanceAfter = balanceBefore + refundAmount;

    // 6. 创建退款交易记录
    const [refundTransaction] = await db
      .insert(quotaTransaction)
      .values({
        userId: consumeTransaction.userId,
        quotaId: targetQuota.id,
        type: 'refund',
        amount: refundAmount,
        balanceBefore,
        balanceAfter,
        relatedTransactionId: consumeTransactionId,
        note,
      })
      .returning();

    return {
      success: true,
      transactionId: refundTransaction.id,
    };
  } catch (error) {
    console.error('Refund quota error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refund quota',
    };
  }
}

/**
 * 检查用户可用配额
 * @param userId 用户ID
 * @returns 可用配额总数
 */
export async function getAvailableQuota(userId: string): Promise<number> {
  try {
    const availableQuotas = await db
      .select()
      .from(quota)
      .where(
        and(
          eq(quota.userId, userId),
          gt(quota.amount, quota.consumed),
          or(isNull(quota.expiresAt), gt(quota.expiresAt, new Date()))
        )
      );

    return availableQuotas.reduce(
      (sum, q) => sum + (q.amount - q.consumed),
      0
    );
  } catch (error) {
    console.error('Get available quota error:', error);
    return 0;
  }
}
