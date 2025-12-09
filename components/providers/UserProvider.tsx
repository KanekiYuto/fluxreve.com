'use client';

import { useEffect, startTransition } from 'react';
import { useCachedSession } from '@/hooks/useCachedSession';
import useUserStore from '@/store/useUserStore';
import { USER_TYPE } from '@/config/constants';
import posthog from 'posthog-js';

interface UserProviderProps {
  children: React.ReactNode;
}

export default function UserProvider({ children }: UserProviderProps) {
  const { data: session, isPending } = useCachedSession();
  const { setUser, setLoading, clearUser, setQuotaInfo, setQuotaLoading } = useUserStore();

  useEffect(() => {
    // 使用 startTransition 降低优先级,不阻塞渲染
    startTransition(() => {
      if (isPending) {
        setLoading(true);
        return;
      }
    });

    if (session?.user) {
      const userId = session.user.id;
      const userEmail = session.user.email;
      const userType = (session.user as any).userType || USER_TYPE.FREE;

      // 立即设置用户信息,不等待配额加载
      startTransition(() => {
        setUser({
          id: userId,
          name: session.user.name || '',
          email: session.user.email || '',
          emailVerified: session.user.emailVerified,
          image: session.user.image ?? '',
          userType: userType,
          createdAt: new Date((session.user as any).createdAt || Date.now()),
          updatedAt: new Date((session.user as any).updatedAt || Date.now()),
        });
      });

      // PostHog 用户识别和追踪信息保存
      if (typeof window !== 'undefined') {
        console.log('[User Tracking] Starting tracking process...');
        console.log('[User Tracking] PostHog available:', !!posthog);
        console.log('[User Tracking] PostHog initialized:', posthog?.__loaded);

        if (!posthog) {
          console.warn('[User Tracking] PostHog not available. Please configure NEXT_PUBLIC_POSTHOG_KEY');
          return;
        }

        // 1. 识别 PostHog 用户
        posthog.identify(userId, {
          email: session.user.email,
        });

        console.log('[User Tracking] User identified:', userId);

        // 2. 保存追踪信息到数据库（首次登录时）
        const trackingKey = `tracking_saved_${userId}`;
        const trackingSaved = sessionStorage.getItem(trackingKey);
        console.log('[User Tracking] Already saved:', !!trackingSaved);
        
        if (!trackingSaved) {
          const saveTracking = () => {
            console.log('[User Tracking] Collecting tracking data...');

            // 从 URL 读取 UTM 参数
            const urlParams = new URLSearchParams(window.location.search);

            // 尝试从 PostHog localStorage 读取初始 UTM（如果当前 URL 没有）
            const persistence = posthog.persistence?.props || {};

            const trackingData = {
              // UTM 参数：优先使用 PostHog 保存的初始 UTM，其次使用当前 URL
              utmSource: persistence.$initial_utm_source || urlParams.get('utm_source') || undefined,
              utmMedium: persistence.$initial_utm_medium || urlParams.get('utm_medium') || undefined,
              utmCampaign: persistence.$initial_utm_campaign || urlParams.get('utm_campaign') || undefined,
              utmContent: persistence.$initial_utm_content || urlParams.get('utm_content') || undefined,
              utmTerm: persistence.$initial_utm_term || urlParams.get('utm_term') || undefined,
            };

            console.log('[User Tracking] UTM data:', trackingData);
            console.log('[User Tracking] PostHog persistence:', persistence);

            // IP 和国家信息由服务器端从请求头获取
            // 发送到 API，服务器会自动添加 IP 和国家信息
            fetch('/api/user/tracking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(trackingData),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log('[User Tracking] API response:', data);
                if (data.success) {
                  sessionStorage.setItem(trackingKey, 'true');
                  console.log('[User Tracking] ✓ Tracking data saved successfully');
                }
              })
              .catch((err) => {
                console.error('[User Tracking] Failed to save:', err);
              });
          };

          // 延迟执行，确保 PostHog 完全加载
          setTimeout(() => saveTracking(), 2000);
        }
      }

      // 延迟加载配额信息,使用 requestIdleCallback 在浏览器空闲时执行
      const loadQuota = () => {
        if (userType === USER_TYPE.FREE) {
          // 免费用户:先检查每日配额,再获取配额信息
          fetch('/api/quota/daily-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userType }),
          })
            .then(() => fetch('/api/quota/info'))
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                startTransition(() => {
                  setQuotaInfo({
                    available: data.data.available,
                    expiresAt: data.data.expiresAt ? new Date(data.data.expiresAt) : null,
                  });
                });
              }
            })
            .catch((err) => {
              console.error('Failed to fetch quota info:', err);
            });
        } else {
          // 付费用户:直接获取配额信息
          setQuotaLoading(true);
          fetch('/api/quota/info')
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                startTransition(() => {
                  setQuotaInfo({
                    available: data.data.available,
                    expiresAt: data.data.expiresAt ? new Date(data.data.expiresAt) : null,
                  });
                });
              }
            })
            .catch((err) => {
              console.error('Failed to fetch quota info:', err);
              setQuotaLoading(false);
            });
        }
      };

      // 使用 requestIdleCallback 或 setTimeout 延迟执行
      if (typeof window !== 'undefined') {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => loadQuota(), { timeout: 1000 });
        } else {
          setTimeout(() => loadQuota(), 100);
        }
      }
    } else {
      // 用户登出时重置 PostHog
      if (typeof window !== 'undefined' && posthog) {
        posthog.reset();
      }
      startTransition(() => {
        clearUser();
      });
    }
  }, [session, isPending, setUser, setLoading, clearUser, setQuotaInfo, setQuotaLoading]);

  return <>{children}</>;
}
