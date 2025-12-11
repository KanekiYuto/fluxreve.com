/**
 * 加载骨架屏 - 瀑布流布局
 * 显示 24 个占位卡片模拟加载中的状态
 */
export default function ExploreLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[10px]">
      {Array.from({ length: 24 }).map((_, i) => {
        // 随机分配不同的行跨度来创建瀑布流效果
        const rowSpans = [22, 30, 38, 45];
        const rowSpan = rowSpans[i % rowSpans.length];

        return (
          <div
            key={i}
            style={{
              gridRow: `span ${rowSpan}`,
            }}
            className="rounded-lg sm:rounded-xl overflow-hidden bg-surface-secondary border border-border/50 animate-pulse"
          >
            {/* 图片骨架 */}
            <div className="w-full h-full bg-gradient-to-br from-bg-elevated to-bg-elevated/50" />

            {/* 信息骨架 */}
            <div className="p-3 space-y-2">
              <div className="h-3 bg-bg-elevated/50 rounded w-3/4" />
              <div className="h-2 bg-bg-elevated/50 rounded w-1/2" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
