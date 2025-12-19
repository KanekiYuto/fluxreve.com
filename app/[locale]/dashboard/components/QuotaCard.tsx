'use client';

import { useTranslations } from 'next-intl';
import StatCard from './StatCard';
import { USER_TYPE, type UserType } from '@/config/constants';

interface QuotaCardProps {
  userType: UserType;
  quota: number | null;
}

export default function QuotaCard({ userType, quota }: QuotaCardProps) {
  const t = useTranslations('dashboard.stats');

  const badgeLabels = {
    [USER_TYPE.PRO]: 'PRO',
    [USER_TYPE.BASIC]: 'BASIC',
    [USER_TYPE.HOBBY]: 'HOBBY',
    [USER_TYPE.FREE]: 'FREE',
  };

  const displayValue = quota !== null ? quota : '∞';

  const label = userType === USER_TYPE.PRO ? t('quota.unlimited') : t('quota.remaining');

  // 不再显示过期时间，因为 quota 只是数值
  const expiryInfo = null;

  const icon = (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  return (
    <StatCard
      icon={icon}
      value={displayValue}
      label={label}
      badge={badgeLabels[userType]}
      color="primary"
      expiryInfo={expiryInfo}
      href="/quota"
    />
  );
}
