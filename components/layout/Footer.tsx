'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { siteConfig } from '@/config/site';
import { footerSections } from '@/config/navigation';

export default function Footer() {
  const t = useTranslations('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-elevated">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* 品牌区域 - 移动端占1列，平板占2列，桌面占1列 */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-block text-2xl font-bold text-white hover:opacity-80 transition-opacity mb-4"
            >
              {siteConfig.name}
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-md">
              {t('seo.description')}
            </p>
          </div>

          {/* 动态链接区域 - 三列菜单，响应式布局 */}
          {footerSections.map((section) => (
            <div key={section.title} className="min-w-0">
              <div className="text-text font-semibold mb-4 text-base">{t(`navigation.${section.title}`)}</div>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      {...(link.external && {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      })}
                      className="text-text-muted hover:text-primary transition-colors text-sm inline-flex items-center gap-1.5 group"
                    >
                      <span className="truncate">{t(`navigation.${link.name}`)}</span>
                      {link.external && (
                        <svg className="w-3 h-3 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 底部栏 */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-text-muted text-sm">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
