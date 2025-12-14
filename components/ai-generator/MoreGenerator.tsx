'use client';

import { useTranslations } from 'next-intl';
import ImageUpscalerGenerator from './models/ImageUpscalerGenerator';
import ImageWatermarkRemoverGenerator from './models/ImageWatermarkRemoverGenerator';
import ModelSelector from './base/ModelSelector';
import { type ModelGroup } from './base/ModelSelector';
import { useGeneratorModelSelector } from '@/hooks/useGeneratorModelSelector';

interface MoreGeneratorProps {
  defaultModel?: string;
  defaultParameters?: any;
}

// 支持的模型列表
const SUPPORTED_MODELS = ['image-upscaler', 'image-watermark-remover'];

export default function MoreGenerator({
  defaultModel = 'image-upscaler',
  defaultParameters,
}: MoreGeneratorProps) {
  const tModels = useTranslations('ai-generator.models');
  const tGroups = useTranslations('ai-generator.modelGroups');

  const { selectedModel, setSelectedModel } = useGeneratorModelSelector({
    defaultModel,
    supportedModels: SUPPORTED_MODELS,
  });

  // 定义可用的模型
  const modelOptions: ModelGroup[] = [
    {
      groupName: tGroups('more'),
      options: [
        {
          value: 'image-upscaler',
          label: 'Image Upscaler',
          description: tModels('imageUpscaler.description'),
        },
        {
          value: 'image-watermark-remover',
          label: 'Image Watermark Remover',
          description: tModels('imageWatermarkRemover.description'),
        },
      ],
    },
  ];

  // ModelSelector 组件
  const modelSelector = (
    <ModelSelector options={modelOptions} value={selectedModel} onChange={setSelectedModel} />
  );

  return (
    <div className="space-y-6">
      {/* 根据选择的模型渲染对应的生成器 */}
      {selectedModel === 'image-upscaler' && (
        <ImageUpscalerGenerator modelSelector={modelSelector} />
      )}
      {selectedModel === 'image-watermark-remover' && (
        <ImageWatermarkRemoverGenerator modelSelector={modelSelector} />
      )}
    </div>
  );
}
