import { createAuthClient } from 'better-auth/react';

// Better Auth 客户端配置
// 用于在 React 组件中调用认证功能
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
});

// 导出常用的 hooks
export const { useSession, signIn, signOut, signUp } = authClient;
