'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * PostHog 分析工具
 * 自动追踪页面浏览、UTM 参数、用户行为
 */
export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 只在客户端且有 API Key 时初始化
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        // 自动捕获页面浏览
        capture_pageview: false, // 手动控制，因为我们在路由变化时捕获
        // 自动捕获点击事件
        autocapture: true,
        // 持久化用户属性
        persistence: 'localStorage',
        // PostHog 自动捕获 UTM 参数（无需配置）
      });
    }
  }, []);

  useEffect(() => {
    // 页面变化时捕获页面浏览
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
