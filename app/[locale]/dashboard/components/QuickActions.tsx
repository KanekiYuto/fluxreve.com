'use client';

import { useTranslations } from 'next-intl';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  color: string;
  hoverColor: string;
  bgColor: string;
  hoverBgColor: string;
}

export default function QuickActions() {
  const t = useTranslations('dashboard.quickActions');

  const actions: QuickAction[] = [
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      label: t('newProject'),
      color: 'text-primary',
      hoverColor: 'group-hover:text-primary',
      bgColor: 'bg-primary/10',
      hoverBgColor: 'group-hover:bg-primary',
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: t('uploadImage'),
      color: 'text-secondary',
      hoverColor: 'group-hover:text-secondary',
      bgColor: 'bg-secondary/10',
      hoverBgColor: 'group-hover:bg-secondary',
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      label: t('templates'),
      color: 'text-purple-500',
      hoverColor: 'group-hover:text-purple-500',
      bgColor: 'bg-purple-500/10',
      hoverBgColor: 'group-hover:bg-purple-500',
    },
    {
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      label: t('tutorial'),
      color: 'text-blue-500',
      hoverColor: 'group-hover:text-blue-500',
      bgColor: 'bg-blue-500/10',
      hoverBgColor: 'group-hover:bg-blue-500',
    },
  ];

  return (
    <div className="rounded-xl gradient-border p-8 mb-8">
      <h2 className="text-xl font-bold text-white mb-6">{t('title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-lg ${action.bgColor} ${action.hoverBgColor} flex items-center justify-center mb-3 transition-all group-hover:scale-110`}
            >
              <div className={`w-6 h-6 ${action.color} group-hover:text-white transition-colors`}>
                {action.icon}
              </div>
            </div>
            <span className={`text-sm font-semibold text-text ${action.hoverColor} transition-colors`}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
