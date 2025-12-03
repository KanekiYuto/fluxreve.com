'use client';

import { useState, useEffect } from 'react';

interface CreditsCardProps {
  onRefresh?: () => void;
}

export default function CreditsCard({
  onRefresh,
}: CreditsCardProps) {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 获取配额数据
  const fetchCredits = async () => {
    setIsLoading(true);
    setCredits(null); // 刷新时先显示 -
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
  };

  // 组件挂载时获取配额
  useEffect(() => {
    fetchCredits();
  }, []);

  // 刷新配额
  const handleRefresh = async () => {
    await fetchCredits();
    onRefresh?.();
  };
  return (
    <div className="rounded-lg border border-border bg-card/50 p-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="text-base font-semibold text-foreground">
            {credits !== null ? credits.toLocaleString() : '***'}
          </span>
          <span className="text-sm text-gray-400">配额</span>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-md hover:bg-zinc-700/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="刷新配额"
        >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
        </button>
      </div>
    </div>
  );
}
