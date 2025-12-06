'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ModelSelector, { type ModelOption } from './base/ModelSelector';
import NanoBananaProGenerator from './models/NanoBananaProGenerator';
import ZImageGenerator from './models/ZImageGenerator';
import Flux2ProGenerator from './models/Flux2ProGenerator';

interface TextToImageGeneratorProps {
  defaultModel?: string;
}

export default function TextToImageGenerator({ defaultModel = 'nano-banana-pro' }: TextToImageGeneratorProps) {
  const t = useTranslations('ai-generator.models');
  const [selectedModel, setSelectedModel] = useState(defaultModel);

  // 模型选项
  const modelOptions: ModelOption[] = [
    {
      value: 'nano-banana-pro',
      label: 'Nano Banana Pro',
      description: t('nanoBananaPro.description'),
      badge: 'NEW',
      tags: [
        { text: t('nanoBananaPro.tags.fast'), variant: 'default' as const },
        { text: t('nanoBananaPro.tags.highQuality'), variant: 'default' as const },
        { text: t('nanoBananaPro.tags.latest'), variant: 'default' as const },
      ]
    },
    {
      value: 'z-image',
      label: 'Z-Image',
      description: t('zImage.description'),
      badge: 'HOT',
      tags: [
        { text: 'NSFW', variant: 'highlight' as const },
        { text: t('zImage.tags.ultraFast'), variant: 'default' as const },
        { text: t('zImage.tags.affordable'), variant: 'default' as const },
        { text: t('zImage.tags.quality'), variant: 'default' as const },
      ]
    },
    {
      value: 'flux-2-pro',
      label: 'Flux 2 Pro',
      description: t('flux2Pro.description'),
      badge: 'PRO',
      tags: [
        { text: t('flux2Pro.tags.professional'), variant: 'highlight' as const },
        { text: t('flux2Pro.tags.highQuality'), variant: 'default' as const },
        { text: t('flux2Pro.tags.versatile'), variant: 'default' as const },
      ]
    },
  ];

  // ModelSelector 组件
  const modelSelector = (
    <ModelSelector options={modelOptions} value={selectedModel} onChange={setSelectedModel} />
  );

  return (
    <div className="space-y-6">
      {/* 根据选择的模型渲染对应的生成器 */}
      {selectedModel === 'nano-banana-pro' && <NanoBananaProGenerator modelSelector={modelSelector} defauldMode='text-to-image' />}
      {selectedModel === 'z-image' && <ZImageGenerator modelSelector={modelSelector} />}
      {selectedModel === 'flux-2-pro' && <Flux2ProGenerator modelSelector={modelSelector} defauldMode='text-to-image' />}
    </div>
  );
}
