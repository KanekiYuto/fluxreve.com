'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ModelSelector, { type ModelOption } from './base/ModelSelector';
import NanoBananaProGenerator from './models/NanoBananaProGenerator';

interface ImageToImageGeneratorProps {
  defaultModel?: string;
}

export default function ImageToImageGenerator({ defaultModel = 'nano-banana-pro' }: ImageToImageGeneratorProps) {
  const t = useTranslations('ai-generator.models');
  const [selectedModel, setSelectedModel] = useState(defaultModel);

  // 模型选项 - 只包含支持 image-to-image 的模型
  const modelOptions: ModelOption[] = [
    {
      value: 'nano-banana-pro',
      label: 'Nano Banana Pro',
      description: t('nanoBananaPro.description'),
      badge: 'NEW',
      tags: [
        { text: 'NSFW', variant: 'highlight' as const },
        { text: t('nanoBananaPro.tags.fast'), variant: 'default' as const },
        { text: t('nanoBananaPro.tags.highQuality'), variant: 'default' as const },
        { text: t('nanoBananaPro.tags.latest'), variant: 'default' as const },
      ]
    },
  ];

  // ModelSelector 组件
  const modelSelector = (
    <ModelSelector options={modelOptions} value={selectedModel} onChange={setSelectedModel} />
  );

  return (
    <div className="space-y-6">
      {/* 根据选择的模型渲染对应的生成器，强制使用 image-to-image 模式 */}
      {selectedModel === 'nano-banana-pro' && (
        <NanoBananaProGenerator modelSelector={modelSelector} defauldMode="image-to-image" />
      )}
    </div>
  );
}
