'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import '@/app/nprogress.css';

// 配置 NProgress
NProgress.configure({
  showSpinner: false, // 不显示右上角的加载指示器
  trickleSpeed: 200, // 自动递增间隔(毫秒)
  minimum: 0.08, // 初始化时的最小百分比
  easing: 'ease', // 动画缓动函数
  speed: 200, // 递增进度条的速度(毫秒)
});

/**
 * NavigationProgress 组件
 *
 * 用于在页面导航时显示顶部进度条
 * 适用于 Next.js App Router
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 当路径或查询参数改变时,结束进度条
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // 监听链接点击事件
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href) {
        // 忽略下载链接
        if (link.hasAttribute('data-download-link')) {
          return;
        }

        const url = new URL(link.href);

        // 忽略锚点导航（仅包含 hash 的链接）
        if (url.hash && url.pathname === window.location.pathname) {
          return;
        }

        // 只在站内导航时显示进度条
        if (url.origin === window.location.origin) {
          NProgress.start();
        }
      }
    };

    // 添加事件监听
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}
