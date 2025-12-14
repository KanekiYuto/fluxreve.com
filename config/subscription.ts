/**
 * 订阅计划配置
 */

import { PLAN_PRICES, SUBSCRIPTION_PLANS, type SubscriptionPlanType } from './pricing';

// 重新导出订阅计划常量，方便其他模块使用
export { SUBSCRIPTION_PLANS, type SubscriptionPlanType };

// 积分汇率：单位价格对应的积分数
export const QUOTA_EXCHANGE_RATE = 150;

// 订阅计划配额配置
// 公式：单价 * QUOTA_EXCHANGE_RATE（月付）或 单价 * QUOTA_EXCHANGE_RATE * 12（年付）
export const SUBSCRIPTION_QUOTA_CONFIG: Record<string, number> = {
  // 体验版 - 一次性付费
  [SUBSCRIPTION_PLANS.TRIAL]: PLAN_PRICES.TRIAL * QUOTA_EXCHANGE_RATE,

  // 基础版 - 月付
  [SUBSCRIPTION_PLANS.MONTHLY_BASIC]: PLAN_PRICES.BASIC * QUOTA_EXCHANGE_RATE,

  // 基础版 - 年付
  [SUBSCRIPTION_PLANS.YEARLY_BASIC]: PLAN_PRICES.BASIC * QUOTA_EXCHANGE_RATE * 12,

  // 专业版 - 月付
  [SUBSCRIPTION_PLANS.MONTHLY_PRO]: PLAN_PRICES.PRO * QUOTA_EXCHANGE_RATE,

  // 专业版 - 年付
  [SUBSCRIPTION_PLANS.YEARLY_PRO]: PLAN_PRICES.PRO * QUOTA_EXCHANGE_RATE * 12,
};

/**
 * 获取订阅计划对应的积分数量
 */
export function getSubscriptionQuota(planType: string): number {
  return SUBSCRIPTION_QUOTA_CONFIG[planType] || 0;
}

/**
 * 检查是否为有效的订阅计划
 */
export function isValidSubscriptionPlan(planType: string): boolean {
  return planType in SUBSCRIPTION_QUOTA_CONFIG;
}
