'use client';

import { useTranslations } from 'next-intl';
import { USER_TYPE, type UserType } from '@/config/constants';

interface DashboardHeaderProps {
  userName?: string;
  userType?: UserType;
  isLoggedIn?: boolean;
}

export default function DashboardHeader({ userName, userType, isLoggedIn = true }: DashboardHeaderProps) {
  const t = useTranslations('dashboard');

  const userTypeBadgeStyles = {
    [USER_TYPE.PRO]: 'bg-purple-500',
    [USER_TYPE.BASIC]: 'bg-blue-500',
    [USER_TYPE.TRIAL]: 'bg-orange-500',
    [USER_TYPE.FREE]: 'bg-gray-500',
  };

  const userTypeLabels = {
    [USER_TYPE.PRO]: t('userType.pro'),
    [USER_TYPE.BASIC]: t('userType.basic'),
    [USER_TYPE.TRIAL]: t('userType.trial'),
    [USER_TYPE.FREE]: t('userType.free'),
  };

  // 未登录状态显示
  if (!isLoggedIn) {
    return (
      <div className="bg-bg-elevated border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
              {t('guestWelcome')}
            </h1>
            <p className="text-sm sm:text-base text-text-muted">
              {t('guestSubtitle')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-elevated border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 truncate">
              {t('welcome', { name: userName || '' })}
            </h1>
            <p className="text-sm sm:text-base text-text-muted">
              {t('subtitle')}
            </p>
          </div>
          {userType && (
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-bg-hover border border-border flex-shrink-0 self-start sm:self-auto">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${userTypeBadgeStyles[userType]}`}></div>
              <span className="text-xs sm:text-sm font-semibold text-white capitalize whitespace-nowrap">
                {userTypeLabels[userType]}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
