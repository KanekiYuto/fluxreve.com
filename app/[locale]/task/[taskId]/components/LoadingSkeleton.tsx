'use client';

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-bg">
      {/* 页面标题骨架 */}
      <header className="bg-bg-elevated border-b border-border">
        <div className="px-6 py-8 animate-pulse">
          <div className="h-9 bg-bg-hover rounded-lg w-48 mb-2"></div>
          <div className="h-5 bg-bg-hover rounded w-64"></div>
        </div>
      </header>

      <div className="py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* 内容骨架 */}
          <section className="bg-surface-secondary rounded-2xl p-4 border border-border/50 mb-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 图片骨架 */}
              <div className="lg:col-span-2">
                <div className="relative bg-bg-hover rounded-2xl overflow-hidden border border-border/50 aspect-square"></div>
              </div>

              {/* 信息骨架 */}
              <aside className="lg:col-span-1 flex flex-col">
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    {/* AI 模型卡片 (全宽) */}
                    <div className="col-span-2 bg-surface-secondary rounded-xl p-3 border border-border/50">
                      <div className="h-3 bg-bg-hover rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-bg-hover rounded w-2/3"></div>
                    </div>

                    {/* 生成耗时 & 消耗积分 */}
                    <div className="bg-surface-secondary rounded-xl p-3 border border-border/50">
                      <div className="h-3 bg-bg-hover rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-bg-hover rounded w-1/2"></div>
                    </div>
                    <div className="bg-surface-secondary rounded-xl p-3 border border-border/50">
                      <div className="h-3 bg-bg-hover rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-bg-hover rounded w-1/2"></div>
                    </div>

                    {/* Prompt 卡片 (全宽) */}
                    <div className="col-span-2 bg-surface-secondary rounded-xl p-3 border border-border/50">
                      <div className="h-3 bg-bg-hover rounded w-1/4 mb-2"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-bg-hover rounded w-full"></div>
                        <div className="h-3 bg-bg-hover rounded w-5/6"></div>
                        <div className="h-3 bg-bg-hover rounded w-4/6"></div>
                      </div>
                    </div>

                    {/* 尺寸 & 分辨率 */}
                    <div className="bg-surface-secondary rounded-xl p-3 border border-border/50">
                      <div className="h-3 bg-bg-hover rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-bg-hover rounded w-3/4"></div>
                    </div>
                    <div className="bg-surface-secondary rounded-xl p-3 border border-border/50">
                      <div className="h-3 bg-bg-hover rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-bg-hover rounded w-1/2"></div>
                    </div>

                    {/* 私有模式 & NSFW */}
                    <div className="bg-surface-secondary rounded-xl p-3 border border-border/50">
                      <div className="h-3 bg-bg-hover rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-bg-hover rounded w-1/3"></div>
                    </div>
                    <div className="bg-surface-secondary rounded-xl p-3 border border-border/50">
                      <div className="h-3 bg-bg-hover rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-bg-hover rounded w-1/3"></div>
                    </div>

                    {/* 创建时间 (全宽) */}
                    <div className="col-span-2 bg-surface-secondary rounded-xl p-3 border border-border/50">
                      <div className="h-3 bg-bg-hover rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-bg-hover rounded w-1/2"></div>
                    </div>

                    {/* 完成时间 (全宽) */}
                    <div className="col-span-2 bg-surface-secondary rounded-xl p-3 border border-border/50">
                      <div className="h-3 bg-bg-hover rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-bg-hover rounded w-1/2"></div>
                    </div>
                  </div>
                </div>

                {/* 操作按钮骨架 */}
                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-7 h-7 bg-bg-hover rounded-md"></div>
                    <div className="w-7 h-7 bg-bg-hover rounded-md"></div>
                  </div>
                  <div className="w-32 h-8 bg-bg-hover rounded-lg"></div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
