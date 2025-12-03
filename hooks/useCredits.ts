'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * 用户积分信息
 */
export interface CreditsInfo {
  credits: number | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * 获取和管理用户积分的自定义 Hook
 * @returns 积分信息和刷新函数
 */
export function useCredits(): CreditsInfo {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 获取配额数据
  const fetchCredits = useCallback(async () => {
    setIsLoading(true);
    setCredits(null); // 刷新时先显示 null
    try {
      const response = await fetch('/api/quota/total');
      const result = await response.json();

      if (result.success && result.data) {
        setCredits(result.data.totalAvailable);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 组件挂载时获取配额
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    isLoading,
    refresh: fetchCredits,
  };
}
