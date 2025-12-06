'use client';

import { usePathname, Link } from '@/i18n/routing';
import useSidebarStore from '@/store/useSidebarStore';
import useModalStore from '@/store/useModalStore';
import { useTranslations } from 'next-intl';
import { siteConfig } from '@/config/site';
import { navigationGroups, type NavItem } from '@/config/navigation';
import { useCachedSession, clearSessionCache } from '@/hooks/useCachedSession';
import { signOut } from '@/lib/auth-client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  LayoutDashboard,
  Zap,
  Tag,
  BarChart3,
  Folder,
  FileText,
  Image as ImageIcon,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  X,
  CreditCard,
  Sparkles,
  ListTodo,
} from 'lucide-react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// 增强的图标组件
function Icon({ name, className }: { name: string; className?: string }) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    home: Home,
    dashboard: LayoutDashboard,
    tasks: ListTodo,
    quota: Zap,
    subscription: CreditCard,
    pricing: Tag,
    chart: BarChart3,
    folder: Folder,
    document: FileText,
    image: ImageIcon,
    sparkles: Sparkles,
    user: User,
    settings: Settings,
    help: HelpCircle,
  };

  const IconComponent = iconMap[name] || Home;
  return <IconComponent className={className} />;
}

// 用户区域组件
function UserSection() {
  const t = useTranslations('auth');
  const { data: session, isPending } = useCachedSession();
  const { openLoginModal } = useModalStore();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      // 清除 session 缓存
      clearSessionCache();

      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = '/';
          },
        },
      });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // 统一的动画变体
  const fadeInVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  // 加载中状态
  if (isPending) {
    return (
      <motion.div
        key="loading"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeInVariants}
        transition={{ duration: 0.2 }}
        className="flex w-full items-center gap-3 rounded-xl gradient-border px-3 py-2.5 animate-pulse"
      >
        <div className="w-8 h-8 rounded-full bg-border shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="w-20 h-4 bg-border rounded mb-1" />
          <div className="w-32 h-3 bg-border rounded" />
        </div>
      </motion.div>
    );
  }

  // 未登录状态
  if (!session) {
    return (
      <motion.button
        key="login"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeInVariants}
        transition={{ duration: 0.2 }}
        onClick={openLoginModal}
        className="flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer gradient-bg text-white hover:brightness-110"
      >
        <span>{t('login')}</span>
      </motion.button>
    );
  }

  // 已登录状态
  return (
    <motion.div
      key="user"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInVariants}
      transition={{ duration: 0.2 }}
      className="relative w-full"
    >
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex w-full items-center gap-3 rounded-xl gradient-border px-3 py-2.5 text-sm text-text-muted hover:bg-white/5 hover:text-white transition-all cursor-pointer"
      >
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name || t('user')}
            className="w-8 h-8 rounded-full gradient-border shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 text-left min-w-0">
          <div className="font-medium text-white text-sm truncate">
            {session.user.name || t('user')}
          </div>
          <div className="text-xs text-text-muted truncate">
            {session.user.email}
          </div>
        </div>
        <ChevronDown
          className={classNames(
            'w-4 h-4 transition-transform',
            showMenu ? 'rotate-180' : ''
          )}
        />
      </button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 gradient-border rounded-lg shadow-xl overflow-hidden"
          >
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-muted hover:bg-white/5 hover:text-white transition-colors cursor-pointer bg-bg-elevated"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('menu.logout')}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// 菜单项组件
function MenuItem({ item, isActive, onClick, t }: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
  t: (key: string) => string;
}) {
  // 处理鼠标悬停时的预加载
  const handleMouseEnter = () => {
    // 预加载路由
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = item.href;
    document.head.appendChild(link);
  };

  return (
    <Link
      href={item.href}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      className={classNames(
        'group relative flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden',
        isActive
          ? 'bg-primary/10 text-white'
          : 'text-text-muted hover:text-white hover:bg-white/5'
      )}
    >
      {/* 左侧激活指示条 */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full gradient-bg" />
      )}

      {/* 图标容器 */}
      <div className="relative flex items-center justify-center shrink-0 transition-all duration-200 z-10 w-5 h-5">
        <Icon
          name={item.icon}
          className={classNames(
            'w-full h-full transition-all duration-200',
            isActive
              ? 'text-white'
              : 'text-text-muted group-hover:text-white'
          )}
        />
      </div>

      {/* 文本 */}
      <span className={classNames(
        'flex-1 truncate transition-all duration-200 z-10 relative',
        isActive ? 'font-medium' : ''
      )}>
        {t(`navigation.${item.name}`)}
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebarStore();
  const t = useTranslations('common');

  return (
    <>
      {/* 移动端 Sidebar - 抽屉式 */}
      {isOpen && (
        <div className="fixed inset-0 z-[260] lg:hidden">
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeSidebar}
          />

          {/* Sidebar 面板 */}
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-bg-elevated border-r border-border shadow-2xl animate-in slide-in-from-left duration-300 z-10">
            {/* 头部 */}
            <div className="relative flex h-[60px] items-center justify-center border-b border-border">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt={siteConfig.name}
                  className="h-8 w-auto"
                />
              </Link>
              <button
                type="button"
                className="absolute right-4 rounded-lg p-2 text-text-muted hover:bg-bg-hover hover:text-text transition-colors"
                onClick={closeSidebar}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 导航菜单 */}
            <nav className="flex-1 px-3 py-6 overflow-y-auto scrollbar-dark">
              <div className="space-y-6">
                {navigationGroups.map((group) => (
                  <div key={group.title}>
                    <div className="px-3 mb-3 text-[11px] font-semibold text-text-dim/60 uppercase tracking-widest">
                      {t(`navigation.${group.title}`)}
                    </div>
                    <ul className="space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <li key={item.name}>
                            <MenuItem
                              item={item}
                              isActive={isActive}
                              onClick={closeSidebar}
                              t={t}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>

            {/* 底部用户区域 */}
            <div className="border-t border-border/50 p-3 flex-shrink-0 h-[80px] flex items-center">
              <AnimatePresence mode="wait">
                <UserSection />
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* 桌面端 Sidebar - 固定宽度 */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 flex-shrink-0 bg-bg-elevated border-r border-border z-[250]">
        {/* Logo 区域 */}
        <div className="flex h-[60px] shrink-0 items-center justify-center border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt={siteConfig.name}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto scrollbar-dark">
          <div className="space-y-6">
            {navigationGroups.map((group) => (
              <div key={group.title}>
                <div className="px-3 mb-3 text-[11px] font-semibold text-text-dim/60 uppercase tracking-widest">
                  {t(`navigation.${group.title}`)}
                </div>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <MenuItem
                          item={item}
                          isActive={isActive}
                          t={t}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* 底部用户区域 */}
        <div className="border-t border-border/50 p-3 flex-shrink-0 h-[80px] flex items-center">
          <AnimatePresence mode="wait">
            <UserSection />
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
