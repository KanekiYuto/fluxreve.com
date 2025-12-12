import { createAuthClient } from 'better-auth/react';
import { oneTapClient } from 'better-auth/client/plugins';

// Better Auth 客户端配置
// 用于在 React 组件中调用认证功能
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  plugins: [
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      // 可选配置
      autoSelect: false,
      cancelOnTapOutside: true,
      context: 'signin',
      // One Tap 重试配置
      promptOptions: {
        baseDelay: 1000,   // 基础延迟（毫秒）
        maxAttempts: 5,    // 最大尝试次数
      },
    }),
  ],
});

// 导出常用的 hooks 和方法
export const { useSession, signIn, signOut, signUp, oneTap } = authClient;
