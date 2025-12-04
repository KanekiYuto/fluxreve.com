'use client';

/**
 * 订阅列表骨架屏组件
 */
export default function SubscriptionSkeletonCards() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-bg-elevated to-bg-elevated/50 gradient-border rounded-2xl p-4 sm:p-6 animate-pulse"
        >
          {/* 头部骨架 */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="flex-1 min-w-0">
              <div className="h-7 w-40 bg-bg-hover rounded-lg"></div>
            </div>
            <div className="h-7 w-20 bg-bg-hover rounded-full flex-shrink-0"></div>
          </div>

          {/* 信息网格骨架 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j}>
                <div className="h-4 w-20 bg-bg-hover rounded mb-1"></div>
                <div className="h-6 w-32 bg-bg-hover rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
