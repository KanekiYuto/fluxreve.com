'use client';

import { useTranslations } from 'next-intl';

export default function What() {
  const t = useTranslations('nanoBananaPro.what');

  return (
    <section className="py-8 sm:py-10 md:py-12 bg-bg-elevated">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 区域标题 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-semibold gradient-text">{t('badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t('title')}
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* 产品特点展示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* 左侧：可视化展示 */}
          <div className="relative">
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-white/10 overflow-hidden">
              {/* 模拟产品界面/演示 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="w-20 h-20 mx-auto rounded-2xl gradient-bg flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-white/60 text-sm">{t('demoPlaceholder')}</div>
                </div>
              </div>
            </div>

            {/* 装饰元素 */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
          </div>

          {/* 右侧：核心特性列表 */}
          <div className="space-y-6">
            {(['core1', 'core2', 'core3'] as const).map((item) => (
              <div key={item}>
                <h3 className="text-lg font-bold text-white mb-2">
                  {t(`coreFeatures.${item}.title`)}
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {t(`coreFeatures.${item}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
