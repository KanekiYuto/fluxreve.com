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
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>

          {/* 社交媒体图标 */}
          <div className="flex items-center gap-4">
            {siteConfig.social?.telegram && (
              <a
                href={siteConfig.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-block"
                aria-label="Telegram"
              >
                <svg
                  className="w-6 h-6"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Telegram</title>
                  {/* 外圆背景 - 保持白色 */}
                  <circle cx="12" cy="12" r="12" className="fill-white" />
                  {/* 小飞机图标 - hover 时变色 */}
                  <path
                    className="fill-black group-hover:fill-[#0088cc] transition-colors"
                    d="M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                  />
                </svg>
              </a>
            )}

            {siteConfig.social?.discord && (
              <a
                href={siteConfig.social.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-block"
                aria-label="Discord"
              >
                <svg
                  className="w-6 h-6"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Discord</title>
                  {/* 外圆背景 - 保持白色 */}
                  <circle cx="12" cy="12" r="12" className="fill-white" />
                  {/* Discord 图标 - hover 时变色 */}
                  <path
                    className="fill-black group-hover:fill-[#5865F2] transition-colors"
                    d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4c-.09.2-.2.48-.25.7A18.27 18.27 0 0 0 12 4c-1.5.26-2.93.71-4.27 1.33.04.67-.07 1.35-.19 2.01.63.76 1.5 1.49 2.48 2.08-1.26.57-2.48 1.36-3.52 2.36.27.8.64 1.56 1.1 2.28 1.86 1.76 4.49 2.8 7.25 2.92-.1.56-.16 1.12-.16 1.67 0 2.92 2.23 5.29 5 5.29 1.55 0 2.94-.6 3.94-1.57-.32 1.12-1.08 2.12-2.08 2.8.96-.1 1.89-.37 2.75-.82-.64 1.03-1.52 1.93-2.56 2.64 0 .08 0 .15 0 .23 0 3.67-2.8 6.67-6.23 6.97.6-.54 1.14-1.14 1.59-1.81-.42.1-.84.15-1.27.15-.4 0-.78-.04-1.16-.11 1.37 4.05 4.95 6.97 9.14 6.97 3.43-.3 6.23-3.3 6.23-6.97 0-.08 0-.15 0-.23 1.04-.71 1.92-1.61 2.56-2.64-1.66.5-3.4.82-5.18.92.56-.56.99-1.24 1.25-2 .7-.65 1.32-1.42 1.76-2.27.46-.86.8-1.78.98-2.74.18-.97.25-1.95.2-2.94-.05-1.36-.3-2.69-.75-3.95z"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
