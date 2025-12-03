'use client';

import { useState } from 'react';

interface UpgradeSubscriptionButtonProps {
  productId: string;
  children?: React.ReactNode;
  className?: string;
  updateBehavior?: 'proration-charge-immediately' | 'proration-charge' | 'proration-none';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * 升级订阅按钮组件
 * 用于升级现有订阅到更高级别的方案
 */
export default function UpgradeSubscriptionButton({
  productId,
  children,
  className = '',
  updateBehavior = 'proration-charge-immediately',
  onSuccess,
  onError,
}: UpgradeSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          updateBehavior,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to upgrade subscription');
      }

      // 升级成功
      console.log('Subscription upgraded successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upgrade subscription';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <span className="relative z-10 flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          处理中...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
