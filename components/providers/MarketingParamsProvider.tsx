'use client';

import { useMarketingTracking } from '@/hooks/useMarketingTracking';

interface MarketingParamsProviderProps {
  children: React.ReactNode;
}

/**
 * 营销参数提供者
 *
 * 在页面加载时自动捕获 URL 中的 UTM 参数，保存到 Cookie
 * 当用户登录时，UserProvider 会自动读取 Cookie 中的参数
 *
 * UTM 参数示例：
 * - utm_source: 来源（google, facebook, direct 等）
 * - utm_medium: 媒介（cpc, email, organic 等）
 * - utm_campaign: 活动名称
 * - utm_content: 广告内容标识
 * - utm_term: 关键词
 *
 * 使用示例 URL：
 * https://site.com?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale
 */
export default function MarketingParamsProvider({ children }: MarketingParamsProviderProps) {
  // 自动捕获和保存 UTM 参数到 Cookie
  useMarketingTracking({
    saveToCookie: true,
    cookieExpireDays: 7,
    debug: process.env.NODE_ENV === 'development',
  });

  return <>{children}</>;
}
