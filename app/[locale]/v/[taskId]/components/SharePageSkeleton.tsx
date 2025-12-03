export default function SharePageSkeleton() {
  return (
    <div className="min-h-screen bg-bg py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* 标题区域骨架 */}
        <div className="mb-8">
          <div className="h-10 bg-bg-hover rounded-lg w-3/4 mb-3 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-5 bg-bg-hover rounded w-32 animate-pulse" />
            <div className="h-5 bg-bg-hover rounded w-2 animate-pulse" />
            <div className="h-5 bg-bg-hover rounded w-40 animate-pulse" />
          </div>
        </div>

        {/* 主内容区域骨架 */}
        <div className="bg-surface-secondary rounded-2xl p-4 border border-border/50 mb-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：图片骨架 */}
            <div className="lg:col-span-2">
              <div className="relative bg-bg-hover rounded-2xl overflow-hidden border border-border/50">
                <div className="w-full aspect-square bg-bg-card" />
              </div>
            </div>

            {/* 右侧：信息骨架 */}
            <div className="lg:col-span-1 flex flex-col justify-between gap-4">
              <div className="grid grid-cols-2 gap-3">
                {/* AI 模型卡片 */}
                <div className="col-span-2 bg-bg-hover rounded-xl p-3 border border-border/50">
                  <div className="h-4 bg-bg-card rounded w-16 mb-1.5" />
                  <div className="h-6 bg-bg-card rounded w-32" />
                </div>

                {/* 分辨率卡片 */}
                <div className="bg-bg-hover rounded-xl p-3 border border-border/50">
                  <div className="h-4 bg-bg-card rounded w-12 mb-1.5" />
                  <div className="h-6 bg-bg-card rounded w-16" />
                </div>

                {/* 宽高比卡片 */}
                <div className="bg-bg-hover rounded-xl p-3 border border-border/50">
                  <div className="h-4 bg-bg-card rounded w-12 mb-1.5" />
                  <div className="h-6 bg-bg-card rounded w-16" />
                </div>

                {/* 提示词卡片 */}
                <div className="col-span-2 bg-bg-hover rounded-xl p-3 border border-border/50">
                  <div className="h-4 bg-bg-card rounded w-16 mb-1.5" />
                  <div className="h-5 bg-bg-card rounded w-full mb-1" />
                  <div className="h-5 bg-bg-card rounded w-3/4" />
                </div>
              </div>

              {/* 操作按钮骨架 */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 bg-bg-hover rounded-md" />
                  <div className="w-8 h-8 bg-bg-hover rounded-md" />
                  <div className="w-8 h-8 bg-bg-hover rounded-md" />
                </div>
                <div className="h-8 bg-bg-hover rounded-lg w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
