import { SUBSCRIPTION_PLANS } from '@/config/subscription';

// 配额配置
export const quotaConfig = {
  // 每日免费配额数量
  dailyFreeQuota: 150,

  // 配额类型
  quotaTypes: {
    dailyFree: 'daily_free',
    monthlyBasic: SUBSCRIPTION_PLANS.MONTHLY_BASIC,
    monthlyPro: SUBSCRIPTION_PLANS.MONTHLY_PRO,
    yearlyBasic: SUBSCRIPTION_PLANS.YEARLY_BASIC,
    yearlyPro: SUBSCRIPTION_PLANS.YEARLY_PRO,
    quotaPack: 'quota_pack',
  },
} as const;
