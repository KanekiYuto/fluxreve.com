'use client';

import { useTranslations } from 'next-intl';
import { CreemPortal } from '@creem_io/nextjs';

interface ManageSubscriptionButtonProps {
  customerId: string;
}

/**
 * 管理订阅按钮组件
 * 点击后打开 Creem 客户门户，用户可以管理订阅、查看发票等
 */
export default function ManageSubscriptionButton({ customerId }: ManageSubscriptionButtonProps) {
  const t = useTranslations('subscription.card');

  return (
    <CreemPortal customerId={customerId}>
      <button className="px-4 py-2 rounded-lg gradient-bg text-white font-semibold hover:brightness-110 transition-all cursor-pointer">
        {t('manageButton')}
      </button>
    </CreemPortal>
  );
}
