'use client';

import { useTranslations } from 'next-intl';
import StatCard from './StatCard';
import { USER_TYPE, type UserType } from '@/config/constants';

interface QuotaCardProps {
  userType: UserType;
  quotaInfo: {
    available: number;
    expiresAt: Date | null;
  } | null;
}

export default function QuotaCard({ userType, quotaInfo }: QuotaCardProps) {
  const t = useTranslations('dashboard.stats');

  const badgeLabels = {
    [USER_TYPE.PRO]: 'PRO',
    [USER_TYPE.BASIC]: 'BASIC',
    [USER_TYPE.TRIAL]: 'TRIAL',
    [USER_TYPE.FREE]: 'FREE',
  };

  const displayValue = quotaInfo ? quotaInfo.available : '∞';

  const label = userType === USER_TYPE.PRO ? t('quota.unlimited') : t('quota.remaining');

  // 只有 FREE 用户才显示过期时间
  const expiryInfo = userType === USER_TYPE.FREE && quotaInfo?.expiresAt ? (
    <>
      <span className="text-sm text-text-muted">/</span>
      <span className="text-xs text-text-muted whitespace-nowrap">
        {new Date(quotaInfo.expiresAt).toLocaleDateString(undefined, {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}{' '}
        {t('quota.expires')}
      </span>
    </>
  ) : null;

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
