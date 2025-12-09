interface StatsCardsProps {
  stats: {
    total: number;
    active: number;
    canceled: number;
    expired: number;
    monthlyRevenue: number;
  };
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: '总订阅数',
      value: stats.total,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: '活跃订阅',
      value: stats.active,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: '已取消',
      value: stats.canceled,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: '已过期',
      value: stats.expired,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
    },
    {
      title: '月度收入',
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-bg-elevated/50 border border-border/50 rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl" />
            </div>
            <div className="h-4 w-20 bg-white/5 rounded mb-2" />
            <div className="h-8 w-16 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="group relative bg-gradient-to-br from-bg-elevated to-bg-subtle border border-border/50 rounded-xl p-6 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-black/10"
        >
          {/* 背景光效 */}
          <div className={`absolute inset-0 ${card.bgColor} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bgColor} ${card.color} p-3 rounded-xl shadow-sm`}>
                {card.icon}
              </div>
            </div>
            <p className="text-text-muted text-sm mb-2 font-medium">{card.title}</p>
            <p className="text-white text-3xl font-bold tracking-tight">
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
