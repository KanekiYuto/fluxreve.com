'use client';

import { useState } from 'react';
import ImageCarousel from './ImageCarousel';
import InfoCard from './InfoCard';
import PromptCard from './PromptCard';
import ActionButtons from './ActionButtons';

interface ShareContentProps {
  images: Array<{ url: string; type: string }>;
  rawPrompt: string;
  displayPrompt: string;
  isNsfw: boolean;
  model: string;
  resolution?: string;
  aspectRatio?: string;
  shareUrl: string;
  taskId?: string;
  parameters?: {
    images?: string[];
    [key: string]: any;
  };
  labels: {
    aiModel: string;
    resolution: string;
    aspectRatio: string;
    generationResults: string;
    imagePreview: string;
    parametersInfo: string;
  };
}

/**
 * 分享页面内容区域 - 客户端组件
 * 管理 NSFW 内容的显示状态，同时保持初始 HTML 完整（利于 SEO）
 */
export default function ShareContent({
  images,
  rawPrompt,
  displayPrompt,
  isNsfw,
  model,
  resolution,
  aspectRatio,
  shareUrl,
  taskId,
  parameters,
  labels,
}: ShareContentProps) {
  const [nsfwRevealed, setNsfwRevealed] = useState(false);

  // 确定是否显示真实内容
  const showRealContent = !isNsfw || nsfwRevealed;
  const finalPrompt = showRealContent ? rawPrompt : displayPrompt;
  const imageUrl = images[0]?.url;

  return (
    <section className="bg-surface-secondary rounded-2xl p-4 border border-border/50 mb-8">
      <h2 className="sr-only">{model} {labels.generationResults}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：图片轮播 */}
        <div className="lg:col-span-2">
          <h3 className="sr-only">{labels.imagePreview}</h3>
          <ImageCarousel
            images={images}
            prompt={finalPrompt}
            isNsfw={isNsfw}
            parameters={parameters}
            onNsfwReveal={() => setNsfwRevealed(true)}
          />
        </div>

        {/* 右侧：信息区域 */}
        <aside className="lg:col-span-1 flex flex-col justify-between gap-4">
          <div>
            <h3 className="sr-only">{labels.parametersInfo}</h3>
            {/* 详细信息网格 */}
            <div className="grid grid-cols-2 gap-3">
              <InfoCard label={labels.aiModel} value={model} fullWidth />
              {resolution && (
                <InfoCard label={labels.resolution} value={resolution.toUpperCase()} />
              )}
              {aspectRatio && <InfoCard label={labels.aspectRatio} value={aspectRatio} />}
              {/* NSFW 内容在用户同意后显示真实提示词 */}
              {showRealContent && <PromptCard prompt={rawPrompt} />}
            </div>
          </div>

          {/* 操作按钮 */}
          <ActionButtons
            shareUrl={shareUrl}
            prompt={finalPrompt}
            imageUrl={imageUrl}
            allImages={images.map((img) => img.url)}
            model={model}
            taskId={taskId}
          />
        </aside>
      </div>
    </section>
  );
}
