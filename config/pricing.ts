// 计费周期类型
export type BillingCycle = 'monthly' | 'yearly';

// 方案类型
export type PlanType = 'free' | 'hobby' | 'basic' | 'pro';

// 订阅计划类型常量
export const SUBSCRIPTION_PLANS = {
  MONTHLY_HOBBY: 'monthly_hobby',
  YEARLY_HOBBY: 'yearly_hobby',
  MONTHLY_BASIC: 'monthly_basic',
  YEARLY_BASIC: 'yearly_basic',
  MONTHLY_PRO: 'monthly_pro',
  YEARLY_PRO: 'yearly_pro',
  FREE: 'free',
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
  HOBBY: 10,
  BASIC: 20,
  PRO: 100,
} as const;

// 定价方案配置
export const pricingTiers: PricingTier[] = [
  // 爱好版 - 月付
  {
    planType: 'hobby',
    billingCycle: 'monthly',
    price: PLAN_PRICES.HOBBY,
    subscriptionPlanType: SUBSCRIPTION_PLANS.MONTHLY_HOBBY,
    creemPayProductId: process.env.NEXT_PUBLIC_CREEM_PAY_HOBBY_MONTHLY_ID,
  },
  // 爱好版 - 年付
  {
    planType: 'hobby',
    billingCycle: 'yearly',
    price: calculateYearlyPrice(PLAN_PRICES.HOBBY),
    subscriptionPlanType: SUBSCRIPTION_PLANS.YEARLY_HOBBY,
    creemPayProductId: process.env.NEXT_PUBLIC_CREEM_PAY_HOBBY_YEARLY_ID,
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
