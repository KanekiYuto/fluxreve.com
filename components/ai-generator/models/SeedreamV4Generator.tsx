'use client';

import { useState } from 'react';
import GeneratorLayout from '../base/GeneratorLayout';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SeedreamV4GeneratorProps {
  modelSelector: React.ReactNode;
}

export default function SeedreamV4Generator({ modelSelector }: SeedreamV4GeneratorProps) {
  // 表单状态
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [numImages, setNumImages] = useState(1);
  const [seed, setSeed] = useState('');
  const [steps, setSteps] = useState(20);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  // 宽高比选项
  const aspectRatios = [
    { value: '1:1', label: '1:1 (正方形)', width: 1024, height: 1024 },
    { value: '16:9', label: '16:9 (横屏)', width: 1344, height: 768 },
    { value: '9:16', label: '9:16 (竖屏)', width: 768, height: 1344 },
    { value: '4:3', label: '4:3 (标准)', width: 1152, height: 896 },
    { value: '3:4', label: '3:4 (竖版)', width: 896, height: 1152 },
  ];

  // 生成图片数量选项
  const imageCountOptions = [1, 2, 4];

  // 模拟生成
  const handleGenerate = () => {
    if (!prompt.trim()) {
      alert('请输入提示词');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setGeneratedImages([]);

    // 模拟进度
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          // 模拟生成的图片
          const mockImages = Array.from({ length: numImages }, (_, i) =>
            `https://via.placeholder.com/1024x1024/dc2f5a/FFFFFF?text=SeeDream+V4+${i + 1}`
          );
          setGeneratedImages(mockImages);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  // 随机种子
  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000).toString());
  };

  // 表单内容
  const formContent = (
    <div className="space-y-6">
      {/* 提示词输入 */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium">
          提示词 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要生成的图像..."
          className="h-32 resize-none"
        />
        <p className="text-xs text-muted-foreground">请详细描述图像内容、风格、色彩等细节</p>
      </div>

      {/* 负面提示词 */}
      <div className="space-y-2">
        <Label htmlFor="negativePrompt" className="text-sm font-medium">
          负面提示词
        </Label>
        <Textarea
          id="negativePrompt"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="描述你不想在图像中看到的内容..."
          className="h-24 resize-none"
        />
        <p className="text-xs text-muted-foreground">指定要避免的元素、风格或特征</p>
      </div>

      {/* 宽高比选择 */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">宽高比</Label>
        <div className="grid grid-cols-2 gap-2">
          {aspectRatios.map((ratio) => (
            <Button
              key={ratio.value}
              type="button"
              variant={aspectRatio === ratio.value ? 'default' : 'outline'}
              onClick={() => setAspectRatio(ratio.value)}
              className="h-auto py-2"
            >
              {ratio.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 生成数量 */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">生成数量</Label>
        <div className="flex gap-2">
          {imageCountOptions.map((count) => (
            <Button
              key={count}
              type="button"
              variant={numImages === count ? 'default' : 'outline'}
              onClick={() => setNumImages(count)}
              className="flex-1"
            >
              {count}
            </Button>
          ))}
        </div>
      </div>

      {/* 高级选项 */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-semibold list-none flex items-center justify-between">
          <span>高级选项</span>
          <svg
            className="w-5 h-5 transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="mt-4 space-y-4">
          {/* 随机种子 */}
          <div className="space-y-2">
            <Label htmlFor="seed" className="text-sm font-medium">
              随机种子
            </Label>
            <div className="flex gap-2">
              <Input
                id="seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="留空随机生成"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleRandomSeed}
                className="flex-shrink-0"
              >
                随机
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">使用相同种子可以重现相似结果</p>
          </div>

          {/* 推理步数 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="steps" className="text-sm font-medium">
                推理步数
              </Label>
              <span className="text-sm text-muted-foreground">{steps}</span>
            </div>
            <input
              id="steps"
              type="range"
              min="10"
              max="50"
              step="5"
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              className="w-full h-2 bg-bg-elevated rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10</span>
              <span>50</span>
            </div>
          </div>

          {/* 引导系数 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="guidanceScale" className="text-sm font-medium">
                引导系数 (CFG)
              </Label>
              <span className="text-sm text-muted-foreground">{guidanceScale.toFixed(1)}</span>
            </div>
            <input
              id="guidanceScale"
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={guidanceScale}
              onChange={(e) => setGuidanceScale(Number(e.target.value))}
              className="w-full h-2 bg-bg-elevated rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1.0</span>
              <span>20.0</span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );

  // 生成按钮
  const generateButton = (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={isLoading}
      className="w-full rounded-xl px-6 py-3 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base gradient-bg"
    >
      {isLoading ? `生成中... ${progress}%` : '生成图像'}
    </button>
  );

  // 预览内容
  const previewContent = (
    <>
      {generatedImages.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">生成结果</h3>
            <span className="text-sm text-muted-foreground">{generatedImages.length} 张图片</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {generatedImages.map((img, index) => (
              <div
                key={index}
                className="group relative cursor-pointer aspect-square"
              >
                {/* 图片容器 */}
                <div className="relative w-full h-full rounded-lg overflow-hidden border border-border group-hover:border-foreground/50 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Generated ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* 图片序号 */}
                  <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded">
                    #{index + 1}
                  </div>

                  {/* 悬浮操作按钮 */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        // 下载逻辑
                      }}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      下载
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        // 放大逻辑
                      }}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      放大
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 批量操作按钮 */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              全部下载
            </Button>
            <Button variant="outline" className="flex-1">
              清空结果
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">等待生成</h3>
            <p className="text-sm text-text-muted max-w-xs mx-auto">
              填写左侧表单并点击生成按钮<br />开始创作你的 AI 图像
            </p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <GeneratorLayout
      headerContent={modelSelector}
      formContent={formContent}
      generateButton={generateButton}
      previewContent={previewContent}
      isLoading={isLoading}
      progress={progress}
    />
  );
}
