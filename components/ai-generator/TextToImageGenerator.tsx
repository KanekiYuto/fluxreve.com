'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ModelSelector from './base/ModelSelector';
import NanoBananaProGenerator from './models/NanoBananaProGenerator';

export default function TextToImageGenerator() {
  const t = useTranslations('ai-generator.models');
  const [selectedModel, setSelectedModel] = useState('nano-banana-pro');

  // 模型选项
  const modelOptions = [
    {
      value: 'nano-banana-pro',
      label: 'Nano Banana Pro',
      description: t('nanoBananaPro.description'),
    },
  ];

  // ModelSelector 组件
  const modelSelector = (
    <ModelSelector options={modelOptions} value={selectedModel} onChange={setSelectedModel} />
  );

  return (
    <div className="space-y-6">
      {/* 根据选择的模型渲染对应的生成器 */}
      {selectedModel === 'nano-banana-pro' && <NanoBananaProGenerator modelSelector={modelSelector} />}
    </div>
  );
}
