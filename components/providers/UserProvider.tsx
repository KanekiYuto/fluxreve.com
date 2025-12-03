'use client';

import { useEffect, startTransition } from 'react';
import { useCachedSession } from '@/hooks/useCachedSession';
import useUserStore from '@/store/useUserStore';
import { USER_TYPE } from '@/config/constants';

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
      startTransition(() => {
        clearUser();
      });
    }
  }, [session, isPending, setUser, setLoading, clearUser, setQuotaInfo, setQuotaLoading]);

  return <>{children}</>;
}
