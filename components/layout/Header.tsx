'use client';

import { useState } from 'react';
import useSidebarStore from '@/store/useSidebarStore';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import UserButton from '@/components/auth/UserButton';
import { siteConfig } from '@/config/site';
import { headerNavigation } from '@/config/navigation';
import { PanelLeft, Menu, X } from 'lucide-react';

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
              {headerNavigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-semibold leading-6 text-text-muted hover:text-text transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-bg-hover"
                >
                  {t(`navigation.${item.name}`)}
                </a>
              ))}
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
          <div className="px-4 py-4 flex flex-col h-full">
            {/* 导航菜单 */}
            <div className="flex flex-col space-y-1">
              {headerNavigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-text-muted hover:bg-white/8 hover:text-white transition-all duration-200"
                >
                  {t(`navigation.${item.name}`)}
                </a>
              ))}
            </div>

            {/* 底部用户按钮 */}
            <div className="mt-auto pt-4 border-t border-border">
              <UserButton fullWidth />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
