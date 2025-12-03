// 翻译文件中的方案数据接口
export interface TierTranslation {
  name: string;
  description: string;
  features: string[];
  unsupportedFeatures?: string[];
  cta: string;
}

// 订阅信息接口
export interface Subscription {
  id: string;
  planType: string;
  nextPlanType: string | null;
  status: string;
  amount: number;
}

// 订阅状态类型
export type SubscriptionStatus = 'current' | 'scheduled' | 'upgrade' | 'downgrade' | 'new' | 'free' | 'configuring';
