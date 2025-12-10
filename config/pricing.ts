// 计费周期类型
export type BillingCycle = 'monthly' | 'yearly';

// 方案类型
export type PlanType = 'free' | 'trial' | 'basic' | 'pro';

// 订阅计划类型常量
export const SUBSCRIPTION_PLANS = {
  TRIAL: 'trial',
  MONTHLY_BASIC: 'monthly_basic',
  YEARLY_BASIC: 'yearly_basic',
  MONTHLY_PRO: 'monthly_pro',
  YEARLY_PRO: 'yearly_pro',
} as const;

export type SubscriptionPlanType = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];

// 定价配置接口
export interface PricingTier {
  planType: PlanType; // 方案类型
  billingCycle: BillingCycle; // 计费周期
  price: number; // 价格
  subscriptionPlanType?: SubscriptionPlanType; // 订阅计划类型 (如 'monthly_basic')
  highlighted?: boolean; // 是否为推荐方案
  creemPayProductId?: string; // Creem Pay 产品 ID
}

// 年付折扣百分比
export const yearlyDiscountPercent = 20;

// 计算年付价格的辅助函数
const calculateYearlyPrice = (monthlyPrice: number): number => {
  return Math.round(monthlyPrice * 12 * (1 - yearlyDiscountPercent / 100));
};

// 单价配置（USD）
export const PLAN_PRICES = {
  TRIAL: 5,   // 体验版单价 $5（一次性付费）
  BASIC: 15,  // 基础版单价 $15
  PRO: 75,    // 专业版单价 $75
} as const;

// 定价方案配置
export const pricingTiers: PricingTier[] = [
  // 体验版 - 一次性付费
  {
    planType: 'trial',
    billingCycle: 'monthly',
    price: PLAN_PRICES.TRIAL,
    subscriptionPlanType: SUBSCRIPTION_PLANS.TRIAL,
    creemPayProductId: process.env.NEXT_PUBLIC_CREEM_PAY_TRIAL_ID,
  },

  // 基础版 - 月付
  {
    planType: 'basic',
    billingCycle: 'monthly',
    price: PLAN_PRICES.BASIC,
    subscriptionPlanType: SUBSCRIPTION_PLANS.MONTHLY_BASIC,
    highlighted: true,
    creemPayProductId: process.env.NEXT_PUBLIC_CREEM_PAY_BASIC_MONTHLY_ID,
  },
  // 基础版 - 年付
  {
    planType: 'basic',
    billingCycle: 'yearly',
    price: calculateYearlyPrice(PLAN_PRICES.BASIC),
    subscriptionPlanType: SUBSCRIPTION_PLANS.YEARLY_BASIC,
    highlighted: true,
    creemPayProductId: process.env.NEXT_PUBLIC_CREEM_PAY_BASIC_YEARLY_ID,
  },

  // 专业版 - 月付
  {
    planType: 'pro',
    billingCycle: 'monthly',
    price: PLAN_PRICES.PRO,
    subscriptionPlanType: SUBSCRIPTION_PLANS.MONTHLY_PRO,
    creemPayProductId: process.env.NEXT_PUBLIC_CREEM_PAY_PRO_MONTHLY_ID,
  },
  // 专业版 - 年付
  {
    planType: 'pro',
    billingCycle: 'yearly',
    price: calculateYearlyPrice(PLAN_PRICES.PRO),
    subscriptionPlanType: SUBSCRIPTION_PLANS.YEARLY_PRO,
    creemPayProductId: process.env.NEXT_PUBLIC_CREEM_PAY_PRO_YEARLY_ID,
  },

  // 免费版
  {
    planType: 'free',
    billingCycle: 'monthly',
    price: 0,
  },

  {
    planType: 'free',
    billingCycle: 'yearly',
    price: 0,
  },
];

/**
 * 根据方案类型和计费周期获取定价信息
 */
export function getPricingTier(planType: PlanType, billingCycle: BillingCycle): PricingTier | undefined {
  return pricingTiers.find(tier => tier.planType === planType && tier.billingCycle === billingCycle);
}

/**
 * 获取指定方案类型的所有定价（月付和年付）
 */
export function getPricingTiersByPlan(planType: PlanType): PricingTier[] {
  return pricingTiers.filter(tier => tier.planType === planType);
}

/**
 * 获取所有唯一的方案类型
 */
export function getUniquePlanTypes(): PlanType[] {
  return Array.from(new Set(pricingTiers.map(t => t.planType)));
}

/**
 * 根据方案类型和计费周期获取订阅计划类型
 * 例如: ('basic', 'monthly') => 'monthly_basic'
 */
export function getSubscriptionPlanType(planType: PlanType, billingCycle: BillingCycle): SubscriptionPlanType | null {
  if (planType === 'free') {
    return null; // 免费方案没有订阅计划类型
  }

  const key = `${billingCycle.toUpperCase()}_${planType.toUpperCase()}` as keyof typeof SUBSCRIPTION_PLANS;
  return SUBSCRIPTION_PLANS[key] || null;
}

/**
 * 根据 Creem 产品 ID 获取定价信息
 */
export function getPricingTierByProductId(productId: string): PricingTier | undefined {
  return pricingTiers.find(tier => tier.creemPayProductId === productId);
}

/**
 * 根据订阅计划类型获取定价信息
 */
export function getPricingTierBySubscriptionPlanType(subscriptionPlanType: string): PricingTier | undefined {
  return pricingTiers.find(tier => tier.subscriptionPlanType === subscriptionPlanType);
}

/**
 * 比较两个订阅计划的等级
 * 返回 true 表示 targetPlan 比 currentPlan 更高级
 * 比较规则: 按照单价(PLAN_PRICES)判断,不受计费周期影响
 */
export function isSubscriptionUpgrade(currentPlanType: string, targetPlanType: string): boolean {
  const currentTier = getPricingTierBySubscriptionPlanType(currentPlanType);
  const targetTier = getPricingTierBySubscriptionPlanType(targetPlanType);

  if (!currentTier || !targetTier) {
    return false;
  }

  // 获取单价进行比较
  // basic -> $15, pro -> $75, free -> $0
  const currentUnitPrice = currentTier.planType === 'basic' ? PLAN_PRICES.BASIC :
                           currentTier.planType === 'pro' ? PLAN_PRICES.PRO : 0;
  const targetUnitPrice = targetTier.planType === 'basic' ? PLAN_PRICES.BASIC :
                          targetTier.planType === 'pro' ? PLAN_PRICES.PRO : 0;

  // 只有单价提升才算升级 (basic $15 -> pro $75)
  // 同等级切换周期不算升级 (monthly_pro $75 -> yearly_pro $75)
  return targetUnitPrice > currentUnitPrice;
}
