'use client';

export default function QuotaSkeletonCards() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-bg-elevated to-bg-elevated/50 gradient-border rounded-2xl p-6 animate-pulse"
        >
          {/* 配额类型和状态 */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              <div className="h-6 bg-bg-hover rounded-lg w-32 mb-2" />
              <div className="h-4 bg-bg-hover rounded w-48" />
            </div>
            <div className="h-7 bg-bg-hover rounded-lg w-16" />
          </div>

          {/* 配额进度条 */}
          <div className="mb-4">
            <div className="flex items-baseline justify-between mb-3">
              <div className="h-9 bg-bg-hover rounded w-24" />
              <div className="h-5 bg-bg-hover rounded w-12" />
            </div>
            <div className="w-full h-3 bg-bg-card rounded-full" />
          </div>

          {/* 使用统计 */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="h-5 bg-bg-hover rounded w-20" />
            <div className="h-5 bg-bg-hover rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
