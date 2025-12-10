// 用户类型常量
export const USER_TYPE = {
  FREE: 'free',
  TRIAL: 'trial',
  BASIC: 'basic',
  PRO: 'pro',
} as const;

export type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE];