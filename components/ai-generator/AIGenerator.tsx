'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import TextToImageGenerator from './TextToImageGenerator';
import ImageToImageGenerator from './ImageToImageGenerator';
import MoreGenerator from './MoreGenerator';
import Tabs, { type TabItem } from './base/Tabs';

interface AIGeneratorProps {
  defaultTab?: string;
  defaultModel?: string;
  defaultParameters?: any;
}

export default function AIGenerator({ defaultTab = 'text-to-image', defaultModel, defaultParameters }: AIGeneratorProps) {
  const tTabs = useTranslations('ai-generator.tabs');

  // 定义所有 tabs
  const tabs: TabItem[] = [
    {
      key: 'text-to-image',
      label: tTabs('textToImage'),
      component: <TextToImageGenerator defaultModel={defaultModel} defaultParameters={defaultParameters} />,
    },
    {
      key: 'image-to-image',
      label: tTabs('imageToImage'),
      component: <ImageToImageGenerator defaultModel={defaultModel} defaultParameters={defaultParameters} />,
    },
    {
      key: 'more',
      label: tTabs('more'),
      component: <MoreGenerator defaultModel={defaultModel} defaultParameters={defaultParameters} />,
    },
  ];

  // 验证并设置默认 tab
  const validDefaultTab = tabs.find((tab) => tab.key === defaultTab) ? defaultTab : tabs[0]?.key;
  const [activeTab, setActiveTab] = useState(validDefaultTab || '');

  const currentTab = tabs.find((tab) => tab.key === activeTab);

  return (
    <div className="space-y-6 pb-8">
      {/* Tab 切换按钮 - 在移动端可水平滚动，PC 占满宽度 */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

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
