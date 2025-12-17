'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { locales, localeNames } from '@/i18n/config';
import { ChevronDown, Globe } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface LanguageSwitcherProps {
  direction?: 'up' | 'down';
}

export const LanguageSwitcher = memo(function LanguageSwitcher({
  direction = 'up'
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() as Locale;
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(false);

  const handleMouseEnter = () => {
    if (isMobileRef.current) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobileRef.current) return;
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClick = () => {
    isMobileRef.current = true;
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (newLocale: Locale) => {
    // 设置语言 Cookie，告诉 next-intl 用户的语言偏好
    // 这样可以防止 localeDetection 自动重定向
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    // 使用 next-intl router 的 locale 参数切换语言
    router.push(pathname, { locale: newLocale });
    setIsOpen(false);
    isMobileRef.current = false;
  };

  // 点击菜单外部时关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        isMobileRef.current = false;
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 text-text-muted hover:text-text transition-colors duration-200 px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm cursor-pointer"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span>{localeNames[locale]}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute -right-2 z-10 w-48 overflow-hidden rounded-lg bg-bg-elevated/95 backdrop-blur-sm shadow-xl ring-1 ring-white/10 animate-in fade-in duration-200 ${
          direction === 'up'
            ? 'bottom-full mb-2 slide-in-from-bottom-2'
            : 'top-full mt-2 slide-in-from-top-2'
        }`}>
          <div className="p-2">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLanguageChange(loc as Locale)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                  locale === loc
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'text-text-muted hover:text-text hover:bg-white/5'
                }`}
              >
                {locale === loc && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                )}
                <span className={locale === loc ? '' : 'ml-2.5'}>
                  {localeNames[loc as Locale]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default LanguageSwitcher;
