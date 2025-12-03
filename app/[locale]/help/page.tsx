'use client';

import { useTranslations } from 'next-intl';
import { siteConfig } from '@/config/site';
import FAQ from '@/components/FAQ';
import Divider from '@/components/Divider';

export default function HelpPage() {
  const t = useTranslations('help');

  return (
    <div className="min-h-screen">
      {/* 页面标题 */}
      <div className="bg-bg-elevated border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-text-muted">{t('subtitle')}</p>
        </div>
      </div>

      {/* 快速联系卡片区域 */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl gradient-border-colorful p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-start gap-4">
              {/* 图标 */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>

              {/* 内容 */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">{t('contact.title')}</h2>
                <p className="text-text-muted mb-4 leading-relaxed">{t('contact.description')}</p>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{t('contact.email')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* FAQ 组件 */}
      <FAQ namespace="help" />
    </div>
  );
}
