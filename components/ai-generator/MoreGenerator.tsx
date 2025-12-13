'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ImageUpscalerGenerator from './models/ImageUpscalerGenerator';
import ModelSelector from './base/ModelSelector';
import { type ModelGroup } from './base/ModelSelector';

interface MoreGeneratorProps {
  defaultModel?: string;
  defaultParameters?: any;
}

export default function MoreGenerator({
  defaultModel = 'image-upscaler',
  defaultParameters,
}: MoreGeneratorProps) {
  const tModels = useTranslations('ai-generator.models');
  const tGroups = useTranslations('ai-generator.modelGroups');

  // 选中的模型
  const [selectedModel, setSelectedModel] = useState(defaultModel);

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

  // 模型选择器组件
  const modelSelector = (
    <ModelSelector
      value={selectedModel}
      onChange={setSelectedModel}
      options={modelOptions}
    />
  );

  // 根据选中的模型渲染对应的生成器
  const renderGenerator = () => {
    switch (selectedModel) {
      case 'image-upscaler':
        return (
          <ImageUpscalerGenerator
            modelSelector={modelSelector}
            defaultParameters={defaultParameters}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderGenerator()}</>;
}
