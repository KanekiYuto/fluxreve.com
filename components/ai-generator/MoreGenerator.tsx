'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ImageUpscalerGenerator from './models/ImageUpscalerGenerator';
import ModelSelector from './base/ModelSelector';
import { type ModelGroup } from './base/ModelSelector';

interface MoreGeneratorProps {
  defaultModel?: string;
  defaultParameters?: any;
}

export default function MoreGenerator({
  defaultModel,
  defaultParameters,
}: MoreGeneratorProps) {
  const tModels = useTranslations('ai-generator.models');
  const tGroups = useTranslations('ai-generator.modelGroups');

  // 选中的模型，more 标签页只有 image-upscaler 这一个模型
  const [selectedModel, setSelectedModel] = useState('image-upscaler');

  // 当 defaultModel 变化时更新（仅当 defaultModel 是 image-upscaler 时）
  useEffect(() => {
    if (defaultModel === 'image-upscaler') {
      setSelectedModel('image-upscaler');
    }
  }, [defaultModel]);

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
      {selectedModel === 'image-upscaler' && <ImageUpscalerGenerator modelSelector={modelSelector} />}
    </div>
  );
}
