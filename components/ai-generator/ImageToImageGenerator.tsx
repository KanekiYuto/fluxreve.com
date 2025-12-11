'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ModelSelector, { type ModelGroup } from './base/ModelSelector';
import NanoBananaProGenerator from './models/NanoBananaProGenerator';
import Flux2ProGenerator from './models/Flux2ProGenerator';
import SeedreamGenerator from './models/SeedreamGenerator';

interface ImageToImageGeneratorProps {
  defaultModel?: string;
  defaultParameters?: any;
}

// 支持图生图的模型列表
const SUPPORTED_MODELS = ['nano-banana-pro', 'flux-2-pro', 'seedream-v4.5'];

export default function ImageToImageGenerator({ defaultModel = 'nano-banana-pro', defaultParameters }: ImageToImageGeneratorProps) {
  const t = useTranslations('ai-generator.models');
  const tGroups = useTranslations('ai-generator.modelGroups');

  // 如果 defaultModel 不支持图生图，回退到第一个支持的模型
  const initialModel = SUPPORTED_MODELS.includes(defaultModel) ? defaultModel : SUPPORTED_MODELS[0];
  const [selectedModel, setSelectedModel] = useState(initialModel);

  // 当 defaultModel 变化时更新
  useEffect(() => {
    const model = SUPPORTED_MODELS.includes(defaultModel) ? defaultModel : SUPPORTED_MODELS[0];
    setSelectedModel(model);
  }, [defaultModel]);

  // 模型选项（分组格式）- 只包含支持 image-to-image 的模型
  const modelOptions: ModelGroup[] = [
    {
      groupName: tGroups('nano'),
      options: [
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
      ]
    },
    {
      groupName: tGroups('flux'),
      options: [
        {
          value: 'flux-2-pro',
          label: 'Flux 2 Pro',
          description: t('flux2Pro.description'),
          tags: [
            { text: t('flux2Pro.tags.professional'), variant: 'highlight' as const },
            { text: t('flux2Pro.tags.highQuality'), variant: 'default' as const },
            { text: t('flux2Pro.tags.versatile'), variant: 'default' as const },
          ]
        },
      ]
    },
    {
      groupName: tGroups('seedream'),
      options: [
        {
          value: 'seedream-v4.5',
          label: 'Seedream 4.5',
          description: t('seedream.description'),
          tags: [
            { text: t('seedream.tags.bytedance'), variant: 'highlight' as const },
            { text: t('seedream.tags.ultraHD'), variant: 'default' as const },
            { text: t('seedream.tags.creative'), variant: 'default' as const },
          ]
        },
      ]
    },
  ];

  // ModelSelector 组件
  const modelSelector = (
    <ModelSelector options={modelOptions} value={selectedModel} onChange={setSelectedModel} />
  );

  // 渲染对应的生成器
  const renderGenerator = () => {
    switch (selectedModel) {
      case 'nano-banana-pro':
        return <NanoBananaProGenerator modelSelector={modelSelector} defauldMode="image-to-image" defaultParameters={defaultParameters} />;
      case 'flux-2-pro':
        return <Flux2ProGenerator modelSelector={modelSelector} defauldMode="image-to-image" defaultParameters={defaultParameters} />;
      case 'seedream-v4.5':
        return <SeedreamGenerator modelSelector={modelSelector} defauldMode="image-to-image" defaultParameters={defaultParameters} />;
      default:
        return <NanoBananaProGenerator modelSelector={modelSelector} defauldMode="image-to-image" defaultParameters={defaultParameters} />;
    }
  };

  return (
    <div className="space-y-6">
      {renderGenerator()}
    </div>
  );
}
