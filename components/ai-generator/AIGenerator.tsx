'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import TextToImageGenerator from './TextToImageGenerator';
import Tabs, { type TabItem } from './base/Tabs';
import ComingSoon from './base/ComingSoon';

interface AIGeneratorProps {
  defaultTab?: string;
}

export default function AIGenerator({ defaultTab }: AIGeneratorProps) {
  const tTabs = useTranslations('ai-generator.tabs');
  const tComingSoon = useTranslations('ai-generator.comingSoon');

  // 定义所有 tabs
  const tabs: TabItem[] = [
    {
      key: 'text-to-image',
      label: tTabs('textToImage'),
      component: <TextToImageGenerator />,
    },
    {
      key: 'image-editor',
      label: tTabs('imageEditor'),
      component: (
        <ComingSoon
          icon={
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          }
          title={tComingSoon('imageEditor.title')}
          description={tComingSoon('imageEditor.description')}
        />
      ),
    },
    {
      key: 'more',
      label: tTabs('more'),
      component: (
        <ComingSoon
          icon={
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          }
          title={tComingSoon('moreTools.title')}
          description={tComingSoon('moreTools.description')}
        />
      ),
    },
  ];

  // 验证并设置默认 tab
  const validDefaultTab = tabs.find((tab) => tab.key === defaultTab) ? defaultTab : tabs[0]?.key;
  const [activeTab, setActiveTab] = useState(validDefaultTab || '');

  const currentTab = tabs.find((tab) => tab.key === activeTab);

  return (
    <div className="space-y-6 pb-8">
      {/* Tab 切换按钮 */}
      <div className="px-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab 内容区域 */}
      <div className="px-6">
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {currentTab?.component}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
