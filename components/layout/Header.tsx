'use client';

import { useState, useRef, useEffect } from 'react';
import useSidebarStore from '@/store/useSidebarStore';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import UserButton from '@/components/auth/UserButton';
import { siteConfig } from '@/config/site';
import { headerNavigation, HeaderDropdownItem, HeaderNavEntry } from '@/config/navigation';
import { PanelLeft, Menu, X, ChevronDown, Banana, Zap, Sparkles } from 'lucide-react';

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
function DropdownMenu({ item, t }: { item: HeaderDropdownItem; t: (key: string) => string }) {
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
}

// 桌面端单个链接组件
function NavLink({ name, href, t }: { name: string; href: string; t: (key: string) => string }) {
  return (
    <a
      href={href}
      className="text-sm font-semibold leading-6 text-text-muted hover:text-text transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-bg-hover"
    >
      {t(`navigation.${name}`)}
    </a>
  );
}

// 移动端可折叠菜单组件
function MobileAccordion({ 
  item, 
  t, 
  onItemClick 
}: { 
  item: HeaderDropdownItem; 
  t: (key: string) => string;
  onItemClick: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-text hover:bg-white/5 transition-colors duration-200 cursor-pointer"
      >
        <span>{t(`navigation.${item.title}`)}</span>
        <ChevronDown className={`h-4 w-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="pb-2 animate-in slide-in-from-top-2 duration-200">
          {item.items.map((subItem) => (
            <a
              key={subItem.name}
              href={subItem.href}
              onClick={onItemClick}
              className="group flex items-center gap-x-4 px-4 py-3 text-sm hover:bg-white/5 transition-all duration-150"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white/5 group-hover:bg-primary/15 transition-all duration-150">
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
                  <p className="mt-0.5 text-xs text-text-muted/70">
                    {t(`navigation.${subItem.description}`)}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// 移动端单个链接组件
function MobileNavLink({ 
  name, 
  href, 
  t, 
  onItemClick 
}: { 
  name: string; 
  href: string; 
  t: (key: string) => string;
  onItemClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onItemClick}
      className="block px-4 py-3 text-sm font-medium text-text hover:bg-white/5 transition-colors duration-200 border-b border-border/50"
    >
      {t(`navigation.${name}`)}
    </a>
  );
}

// 渲染导航项
function renderNavItem(entry: HeaderNavEntry, t: (key: string) => string) {
  if (entry.type === 'link') {
    return <NavLink key={entry.name} name={entry.name} href={entry.href} t={t} />;
  } else {
    return <DropdownMenu key={entry.title} item={entry} t={t} />;
  }
}

// 渲染移动端导航项
function renderMobileNavItem(
  entry: HeaderNavEntry, 
  t: (key: string) => string, 
  onItemClick: () => void
) {
  if (entry.type === 'link') {
    return (
      <MobileNavLink 
        key={entry.name} 
        name={entry.name} 
        href={entry.href} 
        t={t} 
        onItemClick={onItemClick} 
      />
    );
  } else {
    return (
      <MobileAccordion 
        key={entry.title} 
        item={entry} 
        t={t} 
        onItemClick={onItemClick} 
      />
    );
  }
}

export default function Header() {
  const t = useTranslations('common');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleSidebar } = useSidebarStore();

  return (
    <>
      <header className="sticky top-0 z-[250] bg-bg-elevated border-b border-border lg:border-border border-border/80 h-[60px] flex-shrink-0 shadow-sm">
        <nav className="h-full px-4 lg:px-8" aria-label="Global">
          <div className="w-full h-full grid grid-cols-3 lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* 左侧: 侧边栏按钮 */}
            <div className="flex justify-start items-center gap-2">
              {/* Sidebar 切换按钮 - 仅在移动端显示，菜单打开时隐藏 */}
              {!mobileMenuOpen && (
                <button
                  type="button"
                  className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer"
                  onClick={toggleSidebar}
                >
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Sidebar</span>
                </button>
              )}
            </div>

            {/* 中间: Logo - 仅在移动端显示并居中 */}
            <div className="lg:hidden flex justify-center items-center">
              <Link
                href="/"
                className="flex items-center hover:opacity-80 transition-opacity duration-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt={siteConfig.name}
                  className="h-7 w-auto"
                />
              </Link>
            </div>

            {/* 中间: 导航菜单 (桌面端) */}
            <div className="hidden lg:flex items-center justify-center gap-x-1">
              {headerNavigation.map((entry) => renderNavItem(entry, t))}
            </div>

            {/* 右侧: 用户按钮和移动端菜单按钮 */}
            <div className="flex justify-end items-center gap-2">
              {/* 用户按钮 - 桌面端显示 */}
              <div className="hidden lg:block">
                <UserButton />
              </div>

              {/* 移动端菜单按钮 */}
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </nav>

      </header>

      {/* 移动端菜单打开时的遮罩层 */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-[60px] bg-black/40 z-[260] animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 移动端菜单面板 - 占满剩余高度 */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-[60px] left-0 right-0 bottom-0 bg-bg-elevated z-[270] overflow-y-auto animate-in slide-in-from-top duration-300">
          <div className="flex flex-col h-full">
            {/* 导航菜单 */}
            <div className="flex-1">
              {headerNavigation.map((entry) => 
                renderMobileNavItem(entry, t, () => setMobileMenuOpen(false))
              )}
            </div>

            {/* 底部用户按钮 */}
            <div className="p-4 border-t border-border">
              <UserButton fullWidth />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
