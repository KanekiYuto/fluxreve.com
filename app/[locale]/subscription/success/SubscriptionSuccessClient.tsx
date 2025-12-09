'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 声明 gtag 函数类型
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, any>) => void;
  }
}

interface SubscriptionData {
  id: string;
  planType: string;
  amount: number;
  currency: string;
  status: string;
  startedAt: string | null;
  expiresAt: string | null;
  paymentTransactionId: string | null;
}

export default function SubscriptionSuccessClient() {
  const t = useTranslations('subscription-success');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10000);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从 URL 参数获取订阅 ID（必需参数）
  const subscriptionId = searchParams.get('subscription_id');

  // 从数据库获取订阅信息
  useEffect(() => {
    if (!subscriptionId) {
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const response = await fetch(`/api/subscription/${subscriptionId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setSubscriptionData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [subscriptionId]);

  // 谷歌广告转化跟踪 - 使用数据库返回的信息
  useEffect(() => {
    if (!subscriptionData) return;

    if (typeof window !== 'undefined' && window.gtag) {
      const conversionValue = subscriptionData.amount
        ? parseFloat((subscriptionData.amount / 100).toFixed(2))
        : 1.0;

      window.gtag('event', 'conversion', {
        'send_to': 'AW-17790324344/i2oYCKCfrc4bEPici6NC',
        'value': conversionValue,
        'currency': subscriptionData.currency,
        'transaction_id': subscriptionData.id
      });

      window.gtag('event', 'conversion', {
        'seed_to': 'AW-17790324344/xHVlCLHFws4bEPici6NC',
        'value': conversionValue,
        'currency': subscriptionData.currency,
        'transaction_id': subscriptionData.id
      });
    }
  }, [subscriptionData]);

  // 倒计时自动跳转
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRedirect = () => {
    setIsRedirecting(true);
    router.push('/dashboard');
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-white/50 animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/60">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // 如果没有订阅数据，显示错误
  if (!subscriptionData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white/60 mb-4">{t('notFound')}</p>
          <Button
            onClick={() => router.push('/subscription')}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            {t('actions.viewSubscription')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md md:max-w-lg">
        {/* 成功图标和标题 */}
        <div className="text-center mb-6 md:mb-10 animate-in fade-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full mb-4 md:mb-5" style={{
            background: 'linear-gradient(135deg, #C721FF 0%, #FF3466 100%)',
            boxShadow: '0 8px 24px -6px rgba(199, 33, 255, 0.4)'
          }}>
            <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {t('title')}
          </h1>
          <p className="text-sm md:text-base text-white/60">
            {t('description')}
          </p>
        </div>

        {/* 订阅信息卡片 */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 md:p-7 mb-5 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="space-y-4 md:space-y-5">
            {/* 订阅方案 */}
            <div>
              <div className="text-xs md:text-sm text-white/50 mb-1 md:mb-1.5">{t('details.plan')}</div>
              <div className="text-sm md:text-base text-white font-medium">
                {t(`planTypes.${subscriptionData.planType}`, { defaultValue: subscriptionData.planType })}
              </div>
            </div>

            {/* 订阅金额 */}
            <div className="border-t border-white/10" />
            <div>
              <div className="text-xs md:text-sm text-white/50 mb-1 md:mb-1.5">{t('details.amount')}</div>
              <div className="text-sm md:text-base text-white font-medium">
                {subscriptionData.currency === 'CNY' ? '¥' : '$'}
                {(subscriptionData.amount / 100).toFixed(2)}
              </div>
            </div>

            {/* 状态 */}
            <div className="border-t border-white/10" />
            <div>
              <div className="text-xs md:text-sm text-white/50 mb-1 md:mb-1.5">{t('details.status')}</div>
              <div className="inline-flex items-center gap-1.5 md:gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ backgroundColor: '#E0B3FF' }} />
                <span className="text-sm md:text-base font-medium" style={{ color: '#E0B3FF' }}>
                  {t('details.statusActive')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 下一步 */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6 mb-5 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <h3 className="text-sm md:text-base font-medium text-white mb-3 md:mb-4">{t('nextSteps.title')}</h3>
          <ul className="space-y-2.5 md:space-y-3">
            <li className="flex items-start gap-2.5 md:gap-3 text-sm md:text-base text-white/70">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full mt-1.5 md:mt-2 flex-shrink-0" style={{ backgroundColor: '#E0B3FF' }} />
              <span>{t('nextSteps.step1')}</span>
            </li>
            <li className="flex items-start gap-2.5 md:gap-3 text-sm md:text-base text-white/70">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full mt-1.5 md:mt-2 flex-shrink-0" style={{ backgroundColor: '#E0B3FF' }} />
              <span>{t('nextSteps.step2')}</span>
            </li>
            <li className="flex items-start gap-2.5 md:gap-3 text-sm md:text-base text-white/70">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full mt-1.5 md:mt-2 flex-shrink-0" style={{ backgroundColor: '#E0B3FF' }} />
              <span>{t('nextSteps.step3')}</span>
            </li>
          </ul>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <Button
            onClick={handleRedirect}
            disabled={isRedirecting}
            className="w-full text-white border-0 h-11 md:h-12 text-sm md:text-base font-medium transition-all duration-200"
            style={{
              background: 'linear-gradient(90deg, #C721FF 0%, #FF3466 100%)',
            }}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                {t('actions.redirecting')}
              </>
            ) : (
              <>
                {t('actions.startUsing')}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </>
            )}
          </Button>

          <Button
            onClick={() => router.push('/subscription')}
            disabled={isRedirecting}
            variant="ghost"
            className="w-full text-white/70 hover:text-white hover:bg-white/5 h-11 md:h-12 text-sm md:text-base"
          >
            {t('actions.viewSubscription')}
          </Button>
        </div>

        {/* 倒计时 */}
        {countdown > 0 && (
          <p className="text-center text-white/40 text-xs md:text-sm mt-5 md:mt-6 animate-in fade-in duration-500 delay-400">
            {t('autoRedirect', { seconds: countdown })}
          </p>
        )}
      </div>
    </div>
  );
}
