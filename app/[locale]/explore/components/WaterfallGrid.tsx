import { ReactNode } from 'react';
import styles from './WaterfallGrid.module.css';

interface WaterfallGridProps {
  children: ReactNode;
}

/**
 * 瀑布流网格容器
 * 使用 CSS Grid 实现响应式瀑布流布局
 *
 * 响应式列数:
 * - 移动端 (< 640px): 2 列
 * - 平板 (640px - 1024px): 3 列
 * - 桌面 (>= 1024px): 4 列
 */
export default function WaterfallGrid({ children }: WaterfallGridProps) {
  return (
    <div className={styles.waterfallGrid}>
      {children}
    </div>
  );
}
