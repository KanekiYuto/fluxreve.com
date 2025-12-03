import { useSession } from '@/lib/auth-client';

/**
 * 带缓存的 session hook
 * 直接使用 better-auth 自带的缓存机制
 */
export function useCachedSession() {
  return useSession();
}

/**
 * 清除缓存占位函数
 * better-auth 会自动管理缓存
 */
export function clearSessionCache(): void {
  // better-auth 会在 signOut 时自动清除缓存
  // 这里保留函数接口以保持兼容性
}
