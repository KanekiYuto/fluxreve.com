'use client';

import { motion } from 'framer-motion';

export interface TabItem {
  key: string;
  label: string;
  component: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex items-center overflow-x-auto gap-3 pb-2 px-6 scrollbar-hide md:justify-start">
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.key;

        return (
          <motion.button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className="relative flex-shrink-0 md:flex-1 cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 按钮内容 */}
            <div
              className={`relative rounded-xl px-6 py-3 bg-card transition-all duration-300 whitespace-nowrap md:whitespace-normal ${
                isActive ? 'gradient-border-colorful' : 'gradient-border'
              }`}
            >
              {/* 非活动状态的渐变边框（hover 显示） */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none gradient-border-colorful" />
              )}
              {/* 文字内容 */}
              <span
                className={`relative z-10 text-sm sm:text-base font-semibold flex items-center justify-center transition-colors duration-200 ${
                  isActive ? 'gradient-text' : ''
                }`}
              >
                {isActive ? (
                  tab.label
                ) : (
                  <span className="text-text-muted group-hover:text-foreground">{tab.label}</span>
                )}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
