'use client';

import { useState, useEffect, startTransition } from 'react';
import { usePathname } from '@/i18n/routing';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Loading from '@/components/common/Loading';
import DiscordInviteBanner from '@/components/common/DiscordInviteBanner';

// 不显示全局布局的路由路径
const HIDDEN_LAYOUT_PATHS: string[] = [
  // 在这里添加不需要显示布局的路径
  // '/admin',
];

// 需要显示 loading 的路由路径(白名单)
const LOADING_ENABLED_PATHS: string[] = [
  '/dashboard',
  '/tasks',
  '/settings',
  '/quota',
  '/ai-generator',
  '/subscription',
];

interface PageLayoutProps {
  children: React.ReactNode;
}

/**
 * 全局页面布局组件
 * 包含 Sidebar 和 Header
 *
 * Loading 策略:
 * - 白名单模式,只在指定路径显示 loading
 * - 通过监听 children 渲染状态自动控制
 * - 确保 loading 至少显示 500ms,避免闪烁
 */
export default function PageLayout({ children }: PageLayoutProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // 检查当前路径是否应该隐藏全局布局
  const shouldHideLayout = HIDDEN_LAYOUT_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // 检查当前路径是否启用 loading
  const isLoadingEnabled = LOADING_ENABLED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // 路由变化时显示 loading 并在内容加载后隐藏
  useEffect(() => {
    if (!isLoadingEnabled) {
      return;
    }

    // 使用 startTransition 包裹状态更新
    const loadStartTime = Date.now();
    startTransition(() => {
      setIsLoading(true);
    });

    // 等待下一帧后检查内容是否已加载
    const timeoutId = setTimeout(() => {
      const elapsed = Date.now() - loadStartTime;
      const remaining = Math.max(0, 500 - elapsed);

      // 确保 loading 至少显示 500ms
      setTimeout(() => {
        startTransition(() => {
          setIsLoading(false);
        });
      }, remaining);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname, isLoadingEnabled, children]);

  if (shouldHideLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-bg lg:flex-row overflow-hidden">
      {/* Sidebar - 左侧固定宽度 (桌面端) */}
      <Sidebar />

      {/* 右侧内容区域 - flex-1 自动占用剩余空间 */}
      <div className="flex flex-col flex-1 min-h-0 lg:min-h-screen overflow-hidden">

        {/* Header - 固定在顶部 */}
        <Header />

        {/* Main 内容区域 - 可滚动 */}
        <main className="relative flex-1 min-h-0 bg-bg text-text overflow-y-auto scrollbar-dark">
          {/* Discord 邀请横幅 */}
          <DiscordInviteBanner />

          {/* 全局 Loading 遮罩层 - 只在白名单页面显示 */}
          {isLoadingEnabled && isLoading && (
            <div className="fixed inset-0 lg:left-64 top-[60px] bg-bg/90 backdrop-blur-md z-[200] flex items-center justify-center">
              <Loading fullScreen={false} />
            </div>
          )}

          {children}

          {/* Footer - 放在 main 内容底部 */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
