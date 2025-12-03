/**
 * 订阅计划配置
 */

import { PLAN_PRICES, SUBSCRIPTION_PLANS, type SubscriptionPlanType } from './pricing';

// 重新导出订阅计划常量，方便其他模块使用
export { SUBSCRIPTION_PLANS, type SubscriptionPlanType };

// 订阅计划配额配置
// 公式：单价 * 100（月付）或 单价 * 100 * 12（年付）
export const SUBSCRIPTION_QUOTA_CONFIG: Record<string, number> = {
  // 基础版 - 月付：$15 * 100 = 1500 积分
  [SUBSCRIPTION_PLANS.MONTHLY_BASIC]: PLAN_PRICES.BASIC * 100,

  // 基础版 - 年付：$15 * 100 * 12 = 18000 积分
  [SUBSCRIPTION_PLANS.YEARLY_BASIC]: PLAN_PRICES.BASIC * 100 * 12,

  // 专业版 - 月付：$75 * 100 = 7500 积分
  [SUBSCRIPTION_PLANS.MONTHLY_PRO]: PLAN_PRICES.PRO * 100,

  // 专业版 - 年付：$75 * 100 * 12 = 90000 积分
  [SUBSCRIPTION_PLANS.YEARLY_PRO]: PLAN_PRICES.PRO * 100 * 12,
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
