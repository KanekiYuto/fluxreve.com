interface DividerProps {
  className?: string;
  variant?: 'gradient' | 'solid';
}

/**
 * 分割线组件
 * @param variant - 'gradient': 渐变分割线（用于页面区块间） | 'solid': 实线分割线（用于内容区域）
 */
export default function Divider({ className = '', variant = 'gradient' }: DividerProps) {
  if (variant === 'solid') {
    return (
      <div className={className}>
        <div className="h-px bg-border" />
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 ${className}`}>
      <div className="h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />
    </div>
  );
}
