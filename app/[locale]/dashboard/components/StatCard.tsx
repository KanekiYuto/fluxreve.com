'use client';

import { useRouter } from 'next/navigation';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  badge?: string;
  color: 'primary' | 'secondary' | 'blue' | 'purple';
  expiryInfo?: React.ReactNode;
  href?: string;
}

const colorStyles = {
  primary: {
    bg: 'bg-primary/5',
    hoverBg: 'group-hover:bg-primary/10',
    iconBg: 'bg-primary/10',
    hoverIconBg: 'group-hover:bg-primary',
    iconColor: 'text-primary',
    hoverIconColor: 'group-hover:text-white',
    border: 'hover:border-primary/50',
    hoverTextColor: 'group-hover:text-primary',
    badgeBg: 'bg-gray-500/10',
    badgeText: 'text-gray-400',
  },
  secondary: {
    bg: 'bg-secondary/5',
    hoverBg: 'group-hover:bg-secondary/10',
    iconBg: 'bg-secondary/10',
    hoverIconBg: 'group-hover:bg-secondary',
    iconColor: 'text-secondary',
    hoverIconColor: 'group-hover:text-white',
    border: 'hover:border-secondary/50',
    hoverTextColor: 'group-hover:text-secondary',
    badgeBg: 'bg-secondary/10',
    badgeText: 'text-secondary',
  },
  blue: {
    bg: 'bg-blue-500/5',
    hoverBg: 'group-hover:bg-blue-500/10',
    iconBg: 'bg-blue-500/10',
    hoverIconBg: 'group-hover:bg-blue-500',
    iconColor: 'text-blue-500',
    hoverIconColor: 'group-hover:text-white',
    border: 'hover:border-blue-500/50',
    hoverTextColor: 'group-hover:text-blue-500',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-400',
  },
  purple: {
    bg: 'bg-purple-500/5',
    hoverBg: 'group-hover:bg-purple-500/10',
    iconBg: 'bg-purple-500/10',
    hoverIconBg: 'group-hover:bg-purple-500',
    iconColor: 'text-purple-500',
    hoverIconColor: 'group-hover:text-white',
    border: 'hover:border-purple-500/50',
    hoverTextColor: 'group-hover:text-purple-500',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
  },
};

export default function StatCard({ icon, value, label, badge, color, expiryInfo, href }: StatCardProps) {
  const styles = colorStyles[color];
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <div
      className="group relative bg-gradient-to-br from-bg-elevated to-bg-elevated/50 rounded-2xl gradient-border p-6 transition-all duration-300 overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10"
      onClick={handleClick}
    >
      {/* 悬停时的光晕效果 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${styles.iconBg} ${styles.hoverIconBg} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
            <div className={`w-6 h-6 ${styles.iconColor} ${styles.hoverIconColor} transition-colors duration-300`}>
              {icon}
            </div>
          </div>
          {badge && (
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${styles.badgeBg} ${styles.badgeText} group-hover:scale-105 transition-transform duration-300`}>
              {badge}
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-2 flex-wrap">
          <h3 className={`text-3xl font-bold text-white ${styles.hoverTextColor} transition-all duration-300 group-hover:scale-105`}>
            {value}
          </h3>
          {expiryInfo}
        </div>
        <p className="text-sm text-text-muted group-hover:text-text transition-colors duration-300">{label}</p>
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
