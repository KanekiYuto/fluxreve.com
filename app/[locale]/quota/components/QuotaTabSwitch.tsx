'use client';

import { useTranslations } from 'next-intl';

interface QuotaTabSwitchProps {
  activeTab: 'active' | 'expired';
  setActiveTab: (tab: 'active' | 'expired') => void;
  activeQuotasCount: number;
  expiredQuotasCount: number;
}

export default function QuotaTabSwitch({
  activeTab,
  setActiveTab,
  activeQuotasCount,
  expiredQuotasCount,
}: QuotaTabSwitchProps) {
  const t = useTranslations('quota');

  return (
    <div className="mb-8">
      <div className="relative flex items-center gap-8 border-b border-border">
        <button
          onClick={() => setActiveTab('active')}
          className={`relative pb-4 font-semibold transition-colors duration-300 cursor-pointer ${
            activeTab === 'active'
              ? 'text-white'
              : 'text-text-muted hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {t('tabs.active')}
            {activeQuotasCount > 0 && (
              <span
                className={`min-w-[24px] h-6 px-2 flex items-center justify-center rounded text-xs font-medium transition-all duration-300 ${
                  activeTab === 'active'
                    ? 'bg-white text-black'
                    : 'badge-gradient-bg text-gray-400'
                }`}
              >
                {activeQuotasCount}
              </span>
            )}
          </div>

          {/* CSS 下划线指示器 */}
          {activeTab === 'active' && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full gradient-bg" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-4 w-10 rounded-full bg-primary/20 blur-xl" />
            </>
          )}
        </button>

        <button
          onClick={() => setActiveTab('expired')}
          className={`relative pb-4 font-semibold transition-colors duration-300 cursor-pointer ${
            activeTab === 'expired'
              ? 'text-white'
              : 'text-text-muted hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {t('tabs.expired')}
            {expiredQuotasCount > 0 && (
              <span
                className={`min-w-[24px] h-6 px-2 flex items-center justify-center rounded text-xs font-medium transition-all duration-300 ${
                  activeTab === 'expired'
                    ? 'bg-white text-black'
                    : 'badge-gradient-bg text-gray-400'
                }`}
              >
                {expiredQuotasCount}
              </span>
            )}
          </div>

          {/* CSS 下划线指示器 */}
          {activeTab === 'expired' && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full gradient-bg" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-4 w-10 rounded-full bg-primary/20 blur-xl" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
