'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCachedSession, clearSessionCache } from '@/hooks/useCachedSession';
import { signOut } from '@/lib/auth-client';
import useModalStore from '@/store/useModalStore';
import { LayoutDashboard, Settings, LogOut } from 'lucide-react';

interface UserButtonProps {
  fullWidth?: boolean;
}

export default function UserButton({ fullWidth = false }: UserButtonProps) {
  const t = useTranslations('auth');
  const { data: session, isPending } = useCachedSession();
  const { openLoginModal } = useModalStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // 登出
  const handleSignOut = async () => {
    // 清除 session 缓存
    clearSessionCache();

    await signOut({
      fetchOptions: {
        onSuccess: () => {
          setShowDropdown(false);
          window.location.href = '/';
        },
      },
    });
  };

  // 加载中状态
  if (isPending) {
    return (
      <div className={fullWidth ? "w-full" : "flex items-center gap-2"}>
        <div className={fullWidth ? "w-full h-12 rounded-lg bg-bg-hover animate-pulse" : "w-9 h-9 rounded-full bg-bg-hover animate-pulse"}></div>
      </div>
    );
  }

  // 未登录状态 - 显示登录按钮
  if (!session) {
    return (
      <button
        onClick={openLoginModal}
        className={`text-sm font-semibold text-white gradient-bg rounded-lg transition-all duration-200 hover:brightness-110 cursor-pointer ${
          fullWidth ? 'w-full py-3' : 'px-4 py-2'
        }`}
      >
        {t('login')}
      </button>
    );
  }

  // 已登录状态 - 显示用户头像和下拉菜单
  if (fullWidth) {
    // 全宽模式：直接展示所有菜单项
    return (
      <div className="w-full space-y-3">
        {/* 用户信息卡片 */}
        <div className="relative rounded-xl overflow-hidden gradient-border">
          <div className="flex items-center gap-4 p-4">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name || t('user')}
                className="w-14 h-14 rounded-full"
              />
            ) : (
              <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 text-left min-w-0">
              <p className="text-base font-bold text-white truncate">
                {session.user.name || t('user')}
              </p>
              <p className="text-xs text-text-muted truncate mt-1">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

        {/* 菜单项组 */}
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-all duration-200 rounded-lg group"
          >
            <LayoutDashboard className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" />
            <span>{t('menu.dashboard')}</span>
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-all duration-200 rounded-lg group"
          >
            <Settings className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" />
            <span>{t('menu.settings')}</span>
          </Link>

          {/* 登出按钮 */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-white/10 hover:text-red-300 transition-all duration-200 cursor-pointer rounded-lg group"
          >
            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
            <span>{t('menu.logout')}</span>
          </button>
        </div>
      </div>
    );
  }

  // 默认模式：显示头像和下拉菜单
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-bg-hover transition-colors duration-200 cursor-pointer"
      >
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name || t('user')}
            className="w-9 h-9 rounded-full border-2 border-border"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm border-2 border-border">
            {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </button>

      {/* 下拉菜单 */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-bg-elevated rounded-xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
          {/* 用户信息 */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name || t('user')}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                  {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {session.user.name || t('user')}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>

          {/* 菜单项 */}
          <div className="py-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-bg-hover hover:text-white transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('menu.dashboard')}</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-bg-hover hover:text-white transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              <Settings className="w-4 h-4" />
              <span>{t('menu.settings')}</span>
            </Link>
          </div>

          {/* 登出按钮 */}
          <div className="border-t border-border py-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-bg-hover hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('menu.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
