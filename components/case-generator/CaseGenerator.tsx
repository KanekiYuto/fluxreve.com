'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { getRequiredCredits } from '@/config/ai-generator';
import useUserStore from '@/store/useUserStore';
import ModelSelector from './ModelSelector';
import ImageUploadArea from './ImageUploadArea';
import ExampleSelector from './ExampleSelector';
import GenerateSection from './GenerateSection';
import BeforeAfterComparison from './BeforeAfterComparison';
import GeneratingAnimation from './GeneratingAnimation';
import ResultDisplay from './ResultDisplay';

interface CaseGeneratorProps {
  className?: string;
}

const exampleImages = [
  {
    id: 1,
    before: 'https://pub-04d3b22080e84f99972445cc153d93a8.r2.dev/beta/image-to-image/nano-banana-pro/92e9e3e6-789d-4aa5-b46b-1c6fd30fa2be-1766070832641.webp',
    after: 'https://d1q70pf5vjeyhc.cloudfront.net/predictions/788114823f0c41e4ae12d202034fd680/1.png',
    alt: 'animal'
  },
  {
    id: 2,
    before: 'https://pub-04d3b22080e84f99972445cc153d93a8.r2.dev/beta/image-to-image/nano-banana-pro/c04d618b-bccd-4804-8114-c55f5d856efe-1766070177962.jpeg',
    after: 'https://d1q70pf5vjeyhc.cloudfront.net/predictions/0d116991d9bf4ac9832a403d1305ef57/1.png',
    alt: 'figure'
  },
];

export default function CaseGenerator({ className = '' }: CaseGeneratorProps) {
  const t = useTranslations('case-generator');
  const { fetchQuota } = useUserStore();

  const models = [
    {
      id: 'seedream-v4.5',
      name: 'Seedream V4.5',
      description: t('models.seedream-v4-5.description'),
      badge: 'PRO'
    },
    {
      id: 'nano-banana-pro',
      name: 'Nano Banana Pro',
      description: t('models.nano-banana-pro.description')
    },
  ];

  const [selectedModel, setSelectedModel] = useState('seedream-v4.5');
  const [beforeImage, setBeforeImage] = useState<string | null>(exampleImages[0].before);
  const [afterImage, setAfterImage] = useState<string | null>(exampleImages[0].after);
  const [isLoading, setIsLoading] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(1);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(exampleImages[0].before);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [hasGeneratedResult, setHasGeneratedResult] = useState(false);

  // 使用 getRequiredCredits 计算所需积分
  const requiredCredits = useMemo(() => {
    return getRequiredCredits('image-to-image', selectedModel, {
      prompt: 'Redraw this photo in Ghibli style.',
      images: [currentImageUrl],
      is_private: true,
    });
  }, [selectedModel, currentImageUrl]);

  // 轮询任务状态
  const pollTaskStatus = useCallback(async (taskId: string) => {
    const maxAttempts = 60; // 最多轮询 60 次（5分钟）
    let attempts = 0;

    const poll = async (): Promise<boolean> => {
      attempts++;
      setGeneratingProgress(Math.min(attempts * 1.5, 90)); // 进度最高到90%

      try {
        const response = await fetch(`/api/ai-generator/status/${taskId}`);
        const result = await response.json();

        if (result.success && result.data) {
          const { status, results } = result.data;

          if (status === 'completed' && results && results.length > 0) {
            // 生成完成
            setGeneratingProgress(100);
            return true;
          } else if (status === 'failed') {
            // 生成失败
            throw new Error('Generation failed');
          }
        }

        // 继续轮询
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // 等待 5 秒
          return poll();
        } else {
          throw new Error('Timeout: Generation took too long');
        }
      } catch (error) {
        console.error('Poll error:', error);
        throw error;
      }
    };

    return poll();
  }, []);

  // 处理图片上传/URL输入
  const handleImageChange = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
  };

  // 处理示例点击
  const handleExampleClick = async (before: string, after: string) => {
    // 重置生成结果状态
    setHasGeneratedResult(false);
    // 更新当前图片URL
    setCurrentImageUrl(before);
    setBeforeImage(before);
    // 开始淡出
    setIsLoading(true);
    setImageOpacity(0);

    // 预加载两张图片
    const loadImage = (url: string) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
    };

    try {
      // 等待两张图片都加载完成
      await Promise.all([loadImage(before), loadImage(after)]);

      // 更新图片
      setBeforeImage(before);
      setAfterImage(after);

      // 等待一帧让DOM更新
      requestAnimationFrame(() => {
        setImageOpacity(1);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Image loading failed:', error);
      // 即使加载失败也要更新图片
      setBeforeImage(before);
      setAfterImage(after);
      setImageOpacity(1);
      setIsLoading(false);
    }
  };

  // 处理生成
  const handleGenerate = async () => {
    if (!currentImageUrl || isGenerating) return;

    setIsGenerating(true);
    setGeneratingProgress(0);

    try {
      // 根据选择的模型构建 API 路径
      const modelApiPath = selectedModel === 'seedream-v4.5'
        ? '/api/ai-generator/provider/wavespeed/seedream-v4.5/image-to-image'
        : '/api/ai-generator/provider/wavespeed/nano-banana-pro/image-to-image';

      // 调用生成 API
      const response = await fetch(modelApiPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Redraw this photo in Ghibli style.',
          images: [currentImageUrl],
          is_private: true,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const { task_id } = result.data;
        console.log('Generation started, task_id:', task_id);

        // 开始轮询任务状态
        await pollTaskStatus(task_id);

        // 轮询完成，获取最终结果
        const taskResponse = await fetch(`/api/ai-generator/tasks/${task_id}`);
        const taskResult = await taskResponse.json();

        if (taskResult.success && taskResult.data?.results && taskResult.data.results.length > 0) {
          // 生成成功，更新显示
          const generatedImageUrl = taskResult.data.results[0].url;

          // 开始淡出
          setIsLoading(true);
          setImageOpacity(0);

          // 预加载图片
          const img = new Image();
          img.onload = () => {
            // 更新 before 和 after 图片
            setBeforeImage(currentImageUrl);
            setAfterImage(generatedImageUrl);
            // 设置生成成功标志
            setHasGeneratedResult(true);
            // 关闭生成状态
            setIsGenerating(false);
            setGeneratingProgress(0);

            // 等待一帧让 DOM 更新
            requestAnimationFrame(() => {
              setImageOpacity(1);
              setIsLoading(false);
            });
          };
          img.onerror = () => {
            // 即使加载失败也要更新
            setBeforeImage(currentImageUrl);
            setAfterImage(generatedImageUrl);
            setHasGeneratedResult(true);
            setIsGenerating(false);
            setGeneratingProgress(0);
            setImageOpacity(1);
            setIsLoading(false);
          };
          img.src = generatedImageUrl;

          // 刷新积分
          await fetchQuota();
        } else {
          throw new Error('Failed to get generation result');
        }
      } else {
        console.error('Generation failed:', result.error);
        alert(`${t('generateFailed')}: ${result.error || t('generateFailed')}`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert(t('retryPrompt'));
      setIsGenerating(false);
      setGeneratingProgress(0);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* 左侧 - 根据状态显示不同组件 */}
        {isGenerating ? (
          <GeneratingAnimation progress={generatingProgress} />
        ) : hasGeneratedResult ? (
          <ResultDisplay
            beforeImage={beforeImage}
            afterImage={afterImage}
          />
        ) : (
          <BeforeAfterComparison
            beforeImage={beforeImage}
            afterImage={afterImage}
            isLoading={isLoading}
            imageOpacity={imageOpacity}
          />
        )}

        {/* 右侧 - 上传表单 */}
        <div className="lg:col-span-5">
          <div className="rounded-xl gradient-border">
            <div className="px-4 py-4 space-y-5">
              {/* 模型选择 */}
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />

              {/* 上传区域 */}
              <ImageUploadArea
                value={currentImageUrl}
                onChange={handleImageChange}
                modelName={selectedModel}
                generatorType="ghibli-style"
              />

              {/* 示例图片选择 */}
              <ExampleSelector
                examples={exampleImages}
                onExampleClick={handleExampleClick}
              />

              {/* 生成按钮 - 始终显示 */}
              <GenerateSection
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                requiredCredits={requiredCredits}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
