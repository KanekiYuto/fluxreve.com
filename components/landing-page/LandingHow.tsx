'use client';

import { useTranslations } from 'next-intl';

const steps = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    key: 'step1',
    color: 'from-[#6366f1] to-[#8b5cf6]',
    bgColor: 'bg-[#6366f1]/10',
    borderColor: 'border-[#6366f1]/30',
    shadowColor: 'shadow-[#6366f1]/50',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    key: 'step2',
    color: 'from-[#8b5cf6] to-[#a855f7]',
    bgColor: 'bg-[#8b5cf6]/10',
    borderColor: 'border-[#8b5cf6]/30',
    shadowColor: 'shadow-[#8b5cf6]/50',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    key: 'step3',
    color: 'from-[#a855f7] to-[#d946ef]',
    bgColor: 'bg-[#a855f7]/10',
    borderColor: 'border-[#a855f7]/30',
    shadowColor: 'shadow-[#a855f7]/50',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    key: 'step4',
    color: 'from-[#d946ef] to-[#ec4899]',
    bgColor: 'bg-[#d946ef]/10',
    borderColor: 'border-[#d946ef]/30',
    shadowColor: 'shadow-[#d946ef]/50',
  },
];

interface LandingHowProps {
  namespace: string;
}

export default function LandingHow({ namespace }: LandingHowProps) {
  const t = useTranslations(`${namespace}.how`);

  return (
    <section className="relative py-8 sm:py-10 md:py-12 overflow-hidden bg-bg-elevated">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 区域标题 */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('title')}
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* 步骤卡片 - 优化移动端 */}
        <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`group relative ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12 lg:ml-auto'} max-w-4xl`}
            >
              {/* 步骤卡片 */}
              <div className="relative bg-gradient-to-br from-bg-elevated to-bg-base border border-white/10 rounded-2xl lg:rounded-3xl overflow-hidden transition-all duration-300 hover:border-white/20">
                <div className="relative flex items-start p-6 sm:p-8 lg:p-10">
                  {/* 左侧：步骤编号 */}
                  <div className="flex-shrink-0 mr-6 sm:mr-8 lg:mr-10">
                    <div className={`text-6xl sm:text-7xl lg:text-8xl font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-20 select-none leading-none`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* 右侧：内容 */}
                  <div className="flex-1 min-w-0 pt-1 sm:pt-2">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
                      {t(`steps.${step.key}.title`)}
                    </h3>

                    <p className="text-base sm:text-lg text-text-muted leading-relaxed">
                      {t(`steps.${step.key}.description`)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
