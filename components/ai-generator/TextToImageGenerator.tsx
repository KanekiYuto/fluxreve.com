'use client';

import { useState } from 'react';
import ModelSelector from './base/ModelSelector';
import SeedreamV4Generator from './models/SeedreamV4Generator';
import NanoBananaProGenerator from './models/NanoBananaProGenerator';

export default function TextToImageGenerator() {
  const [selectedModel, setSelectedModel] = useState('nano-banana-pro');

  // 模型选项
  const modelOptions = [
    {
      value: 'seedream-v4',
      label: 'SeeDream V4',
      description: '先进的图像生成模型，支持高质量图像创作和精细控制',
    },
    {
      value: 'nano-banana-pro',
      label: 'Nano Banana Pro',
      description: '超快速生成，专为高效创作优化',
    },
  ];

  // ModelSelector 组件
  const modelSelector = (
    <ModelSelector options={modelOptions} value={selectedModel} onChange={setSelectedModel} />
  );

  return (
    <div className="space-y-6">
      {/* 根据选择的模型渲染对应的生成器 */}
      {selectedModel === 'seedream-v4' && <SeedreamV4Generator modelSelector={modelSelector} />}
      {selectedModel === 'nano-banana-pro' && <NanoBananaProGenerator modelSelector={modelSelector} />}
    </div>
  );
}
