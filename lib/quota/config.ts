import { SUBSCRIPTION_PLANS } from '@/config/subscription';

// 配额配置
export const quotaConfig = {
  // 每日免费配额数量
  dailyFreeQuota: {
    default: 50,
    to_pro_amount: 100, // 特定国家的增强配额
    to_pro: [
      'SA',
      'FR',
      'DE',
      'BH',
      'BE',
      'NL',
      'AE',
      'QA',
      'LU',
      'IL',
    ]
  },

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

/**
 * 根据国家代码获取每日免费配额数量
 * @param countryCode 国家代码 (ISO 3166-1 alpha-2)
 * @returns 配额数量
 */
export function getDailyFreeQuotaByCountry(countryCode?: string): number {
  if (!countryCode) {
    return quotaConfig.dailyFreeQuota.default;
  }

  // 检查是否在特定国家列表中
  if (quotaConfig.dailyFreeQuota.to_pro.includes(countryCode as any)) {
    return quotaConfig.dailyFreeQuota.to_pro_amount;
  }

  return quotaConfig.dailyFreeQuota.default;
}
