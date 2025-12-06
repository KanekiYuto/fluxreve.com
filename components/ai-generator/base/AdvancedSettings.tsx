'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';
import { Lock } from 'lucide-react';

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
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors">
            <label htmlFor="private-mode" className="flex items-center gap-3 cursor-pointer flex-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <Lock className="w-4 h-4 text-text-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">{t('privateMode')}</p>
                <p className="text-xs text-text-muted mt-0.5">{t('privateModeDesc')}</p>
              </div>
            </label>
            <Switch
              id="private-mode"
              checked={isPrivate}
              onCheckedChange={handlePrivateChange}
            />
          </div>

          {children}
        </div>
      </div>
    </details>
  );
}
