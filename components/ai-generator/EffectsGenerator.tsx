'use client';

import { useTranslations } from 'next-intl';
import LofiPixelCharacterGenerator from './models/LofiPixelCharacterGenerator';
import ModelSelector from './base/ModelSelector';
import { type ModelGroup } from './base/ModelSelector';
import { useGeneratorModelSelector } from '@/hooks/useGeneratorModelSelector';

interface EffectsGeneratorProps {
  defaultModel?: string;
  defaultParameters?: any;
}

// 支持的效果模型列表
const SUPPORTED_MODELS = ['lofi-pixel-character-mini-card'];

export default function EffectsGenerator({
  defaultModel = 'lofi-pixel-character-mini-card',
  defaultParameters,
}: EffectsGeneratorProps) {
  const tModels = useTranslations('ai-generator.models');
  const tGroups = useTranslations('ai-generator.modelGroups');

  const { selectedModel, setSelectedModel } = useGeneratorModelSelector({
    defaultModel,
    supportedModels: SUPPORTED_MODELS,
  });

  // 定义可用的模型
  const modelOptions: ModelGroup[] = [
    {
      groupName: tGroups('effects'),
      options: [
        {
          value: 'lofi-pixel-character-mini-card',
          label: 'Lofi Pixel Character',
          description: tModels('lofiPixelCharacter.description'),
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
      {selectedModel === 'lofi-pixel-character-mini-card' && (
        <LofiPixelCharacterGenerator modelSelector={modelSelector} />
      )}
    </div>
  );
}
