'use client';

import { useState } from 'react';
import ModelSelector from './base/ModelSelector';
import NanoBananaProGenerator from './models/NanoBananaProGenerator';

export default function TextToImageGenerator() {
  const [selectedModel, setSelectedModel] = useState('nano-banana-pro');

  // 模型选项
  const modelOptions = [
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
      {selectedModel === 'nano-banana-pro' && <NanoBananaProGenerator modelSelector={modelSelector} />}
    </div>
  );
}
