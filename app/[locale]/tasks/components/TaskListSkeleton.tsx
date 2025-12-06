'use client';

export default function TaskListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl overflow-hidden bg-surface-secondary border border-border/50 animate-pulse"
        >
          {/* 图片骨架 */}
          <div className="aspect-square bg-bg-elevated" />

          {/* 信息区域骨架 */}
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="h-5 w-16 bg-bg-elevated rounded-full" />
              <div className="h-4 w-20 bg-bg-elevated rounded" />
            </div>
            <div className="h-4 w-full bg-bg-elevated rounded mb-1" />
            <div className="h-4 w-2/3 bg-bg-elevated rounded mb-2" />
            <div className="h-3 w-24 bg-bg-elevated rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

