'use client';

import { useState, useRef, useEffect, memo } from 'react';
import useSidebarStore from '@/store/useSidebarStore';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import UserButton from '@/components/auth/UserButton';
import { headerNavigation, HeaderDropdownItem, HeaderNavEntry } from '@/config/navigation';
import { Menu, X, ChevronDown, Banana, Zap, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';
import useModalStore from '@/store/useModalStore';
import { useCachedSession } from '@/hooks/useCachedSession';
import { siteConfig } from '@/config/site';

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  banana: Banana,
  zap: Zap,
};

// 获取图标组件
function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] || Sparkles;
  return <Icon className={className} />;
}

// 桌面端下拉菜单组件
const DropdownMenu = memo(function DropdownMenu({ item, t }: { item: HeaderDropdownItem; t: (key: string) => string }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="flex items-center gap-1 text-sm font-semibold leading-6 text-text-muted hover:text-text transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-bg-hover cursor-pointer"
      >
        {t(`navigation.${item.title}`)}
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-2xl bg-bg-elevated/95 backdrop-blur-sm shadow-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3">
            {item.items.map((subItem) => (
              <a
                key={subItem.name}
                href={subItem.href}
                className="group relative flex items-center gap-x-5 rounded-xl p-3 text-sm leading-6 hover:bg-white/5 transition-all duration-150"
              >
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/5 group-hover:bg-primary/15 transition-all duration-150">
                  <NavIcon 
                    name={subItem.icon} 
                    className="h-5 w-5 text-text-muted group-hover:text-primary transition-colors duration-150" 
                  />
                </div>
                <div className="flex-auto">
                  <span className="block font-medium text-text group-hover:text-primary transition-colors duration-150">
                    {t(`navigation.${subItem.name}`)}
                  </span>
                  {subItem.description && (
                    <p className="mt-0.5 text-sm text-text-muted/70">
                      {t(`navigation.${subItem.description}`)}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
})

// 桌面端单个链接组件
const NavLink = memo(function NavLink({ name, href, t }: { name: string; href: string; t: (key: string) => string }) {
  return (
    <a
      href={href}
      className="text-sm font-semibold leading-6 text-text-muted hover:text-text transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-bg-hover"
    >
      {t(`navigation.${name}`)}
    </a>
  );
})

// 渲染导航项
function renderNavItem(entry: HeaderNavEntry, t: (key: string) => string) {
  if (entry.type === 'link') {
    return <NavLink key={entry.name} name={entry.name} href={entry.href} t={t} />;
  } else {
    return <DropdownMenu key={entry.title} item={entry} t={t} />;
  }
}

export default function Header() {
  const t = useTranslations('auth');
  const commonT = useTranslations('common');
  const { isOpen, toggleSidebar } = useSidebarStore();
  const { openLoginModal } = useModalStore();
  const { data: session } = useCachedSession();

  return (
    <header className="sticky top-0 z-[250] bg-bg-elevated border-b border-border/80 h-[60px] flex-shrink-0 shadow-sm">
      <nav className="h-full px-4 lg:px-8" aria-label="Global">
        <div className="w-full h-full flex items-center justify-between">
          {/* 左侧: 侧边栏按钮和Logo (移动端) */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
              className="inline-flex items-center justify-center rounded-lg p-2 text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
              onClick={toggleSidebar}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              aria-label={`${siteConfig.name} - ${commonT('seo.description')}`}
            >
              <Logo className="text-white h-6" />
            </Link>
          </div>

          {/* 中间: 导航菜单 (桌面端) */}
          <div className="hidden lg:flex items-center justify-center gap-x-1 flex-1">
            {headerNavigation.map((entry) => renderNavItem(entry, commonT))}
          </div>

          {/* 右侧: 社交媒体链接 + 登录/用户按钮 */}
          <div className="flex items-center gap-3 justify-end">
            {/* Discord 链接 */}
            {siteConfig.social?.discord && (
              <a
                href={siteConfig.social.discord}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="hidden min-[380px]:flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
            )}

            {!session ? (
              <>
                {/* 登录文本按钮 */}
                <button
                  onClick={openLoginModal}
                  className="text-sm font-semibold text-white hover:text-white/80 transition-colors duration-200 cursor-pointer"
                >
                  {t('login')}
                </button>
                {/* 开始按钮 */}
                <button
                  onClick={openLoginModal}
                  className="text-sm font-semibold text-white gradient-bg rounded-lg px-4 py-2 transition-all duration-200 hover:brightness-110 cursor-pointer"
                >
                  {t('startForFree')}
                </button>
              </>
            ) : (
              <UserButton />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
