'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';
import { Lock } from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import { useCurrentSubscription } from '@/components/pricing/hooks';

interface AdvancedSettingsProps {
  children: ReactNode;
  isPrivate?: boolean;
  onPrivateChange?: (value: boolean) => void;
}

export default function AdvancedSettings({
  children,
  isPrivate: controlledIsPrivate,
  onPrivateChange,
}: AdvancedSettingsProps) {
  const t = useTranslations('ai-generator.form');
  const { user } = useUserStore();
  const { currentSubscription, isLoading } = useCurrentSubscription(user);

  // 检查用户是否有有效的订阅（Basic 或 Pro 计划，且状态为 active）
  const isSubscribed = !!(
    user &&
    currentSubscription &&
    currentSubscription.status === 'active' &&
    (currentSubscription.planType === 'basic' || currentSubscription.planType === 'pro')
  );

  // 内部状态管理（非受控模式）
  const [internalIsPrivate, setInternalIsPrivate] = useState(false);

  // 判断是否为受控模式
  const isControlled = controlledIsPrivate !== undefined;
  const isPrivate = isControlled ? controlledIsPrivate : internalIsPrivate;

  // 同步受控值
  useEffect(() => {
    if (isControlled) {
      setInternalIsPrivate(controlledIsPrivate);
    }
  }, [isControlled, controlledIsPrivate]);

  const handlePrivateChange = (value: boolean) => {
    // 如果正在加载或用户未订阅，禁止更改
    if (isLoading || !isSubscribed) {
      return;
    }
    if (!isControlled) {
      setInternalIsPrivate(value);
    }
    onPrivateChange?.(value);
  };

  return (
    <details className="group">
      <summary className="cursor-pointer text-sm font-semibold list-none flex items-center justify-between">
        <span>{t('advancedSettings')}</span>
        <svg
          className="w-5 h-5 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="mt-4 rounded-xl gradient-border">
        <div className="px-4 py-4 space-y-4">
          {/* 私有模式开关 */}
          <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
            isLoading || isSubscribed
              ? 'bg-white/5 hover:bg-white/8'
              : 'bg-white/5 opacity-60 cursor-not-allowed'
          }`}>
            <label htmlFor="private-mode" className={`flex items-center gap-3 flex-1 ${
              isLoading || isSubscribed ? 'cursor-pointer' : 'cursor-not-allowed'
            }`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <Lock className="w-4 h-4 text-text-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">{t('privateMode')}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {isLoading
                    ? t('status.loading')
                    : isSubscribed
                    ? t('privateModeDesc')
                    : t('privateModeSubscriptionRequired')}
                </p>
              </div>
            </label>
            <Switch
              id="private-mode"
              checked={isPrivate}
              onCheckedChange={handlePrivateChange}
              disabled={isLoading || !isSubscribed}
            />
          </div>

          {children}
        </div>
      </div>
    </details>
  );
}
