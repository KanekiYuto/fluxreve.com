'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import ModelSelector, { type ModelGroup } from './base/ModelSelector';
import NanoBananaProGenerator from './models/NanoBananaProGenerator';
import ZImageGenerator from './models/ZImageGenerator';
import ZImageLoraGenerator from './models/ZImageLoraGenerator';
import Flux2ProGenerator from './models/Flux2ProGenerator';
import FluxSchnellGenerator from './models/FluxSchnellGenerator';
import SeedreamGenerator from './models/SeedreamGenerator';
import { useAutoSaveFormState } from '@/hooks/useGeneratorFormPersistence';

interface TextToImageGeneratorProps {
  defaultModel?: string;
  defaultParameters?: any;
}

export default function TextToImageGenerator({ defaultModel = 'nano-banana-pro', defaultParameters }: TextToImageGeneratorProps) {
  const t = useTranslations('ai-generator.models');
  const tGroups = useTranslations('ai-generator.modelGroups');
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  // 存储当前活跃的模型表单数据，用于在模型切换时保存
  const [formStateData, setFormStateData] = useState<any>({});

  // 自动保存表单状态到 sessionStorage
  useAutoSaveFormState(selectedModel, formStateData, 500);

  // 当 defaultModel 变化时更新
  useEffect(() => {
    setSelectedModel(defaultModel);
  }, [defaultModel]);

  // 处理模型选择变化（保存当前表单状态后再切换）
  const handleModelChange = useCallback((newModel: string) => {
    setSelectedModel(newModel);
  }, []);

  // 模型选项（分组格式）
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
      groupName: tGroups('zImage'),
      options: [
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
          value: 'z-image-lora',
          label: 'Z-Image Turbo LoRA',
          description: t('zImageLora.description'),
          badge: 'NEW',
          tags: [
            { text: 'NSFW', variant: 'highlight' as const },
            { text: t('zImageLora.tags.customizable'), variant: 'default' as const },
            { text: t('zImageLora.tags.stylized'), variant: 'default' as const },
            { text: t('zImageLora.tags.lora'), variant: 'default' as const },
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
        {
          value: 'flux-schnell',
          label: 'Flux Schnell',
          description: t('fluxSchnell.description'),
          tags: [
            { text: t('fluxSchnell.tags.ultraFast'), variant: 'highlight' as const },
            { text: t('fluxSchnell.tags.affordable'), variant: 'default' as const },
            { text: t('fluxSchnell.tags.quality'), variant: 'default' as const },
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
    <ModelSelector options={modelOptions} value={selectedModel} onChange={handleModelChange} />
  );

  return (
    <div className="space-y-6">
      {/* 根据选择的模型渲染对应的生成器 */}
      {selectedModel === 'nano-banana-pro' && (
        <NanoBananaProGenerator
          modelSelector={modelSelector}
          defauldMode='text-to-image'
          defaultParameters={defaultParameters}
          onFormStateChange={setFormStateData}
        />
      )}
      {selectedModel === 'z-image' && (
        <ZImageGenerator
          modelSelector={modelSelector}
          defaultParameters={defaultParameters}
          onFormStateChange={setFormStateData}
        />
      )}
      {selectedModel === 'z-image-lora' && (
        <ZImageLoraGenerator
          modelSelector={modelSelector}
          defaultParameters={defaultParameters}
          onFormStateChange={setFormStateData}
        />
      )}
      {selectedModel === 'flux-2-pro' && (
        <Flux2ProGenerator
          modelSelector={modelSelector}
          defauldMode='text-to-image'
          defaultParameters={defaultParameters}
          onFormStateChange={setFormStateData}
        />
      )}
      {selectedModel === 'flux-schnell' && (
        <FluxSchnellGenerator
          modelSelector={modelSelector}
          defaultParameters={defaultParameters}
          onFormStateChange={setFormStateData}
        />
      )}
      {selectedModel === 'seedream-v4.5' && (
        <SeedreamGenerator
          modelSelector={modelSelector}
          defauldMode='text-to-image'
          defaultParameters={defaultParameters}
          onFormStateChange={setFormStateData}
        />
      )}
    </div>
  );
}
