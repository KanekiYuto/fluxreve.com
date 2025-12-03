'use client';

import { useState } from 'react';
import GeneratorLayout from '../base/GeneratorLayout';
import ExamplePreview, { ExampleItem } from '../base/ExampleGallery';
import MediaGallery, { MediaItem, TaskInfo } from '../base/MediaGallery';
import CreditsCard from '../base/CreditsCard';
import AdvancedSettings from '../base/AdvancedSettings';
import FormSelect from '../form/FormSelect';
import SeedInput from '../form/SeedInput';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRequiredCredits } from '@/hooks/useRequiredCredits';

// 分辨率类型
type Resolution = '1k' | '2k' | '4k';

interface NanoBananaProGeneratorProps {
  modelSelector: React.ReactNode;
}

export default function NanoBananaProGenerator({ modelSelector }: NanoBananaProGeneratorProps) {
  // 表单状态
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [seed, setSeed] = useState('');
  const [resolution, setResolution] = useState<Resolution>('1k');

  // 生成状态
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<MediaItem[]>([]);
  const [taskInfo, setTaskInfo] = useState<TaskInfo | undefined>(undefined);

  // 使用自定义 Hook 计算所需配额
  const requiredCredits = useRequiredCredits('text-to-image', 'nano-banana-pro', {
    resolution,
    aspect_ratio: aspectRatio,
    seed,
  });

  // 宽高比选项
  const aspectRatios = [
    { value: '1:1', label: '1:1 (正方形)', width: 1024, height: 1024 },
    { value: '16:9', label: '16:9 (横屏)', width: 1344, height: 768 },
    { value: '9:16', label: '9:16 (竖屏)', width: 768, height: 1344 },
    { value: '4:3', label: '4:3 (标准)', width: 1152, height: 896 },
    { value: '3:4', label: '3:4 (竖版)', width: 896, height: 1152 },
    { value: '21:9', label: '21:9 (超宽)', width: 1536, height: 640 },
  ];

  // 示例数据
  const examples: ExampleItem[] = [
    {
      id: '1',
      thumbnail: '/test/3c3bb2c9-f19e-4f48-b005-c27e475d6bf5.webp',
      prompt: '梦幻的奇幻风景，浮空岛屿，瀑布从云端倾泻而下，神秘的紫色天空，超现实主义风格',
      tags: ['风景', '奇幻', '超现实'],
    },
    {
      id: '2',
      thumbnail: '/test/d9c7dede-2a43-47a4-8fb7-3b591d52864a.webp',
      prompt: '赛博朋克风格的未来都市，霓虹灯闪烁，高楼林立，夜晚下着雨，反光的街道',
      tags: ['城市', '科幻', '赛博朋克'],
    },
  ];

  // 处理选择示例
  const handleSelectExample = (example: ExampleItem) => {
    setPrompt(example.prompt);
  };

  // 生成图像
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('请输入提示词');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setGeneratedImages([]);

    try {
      // 调用文生图 API
      const response = await fetch('/api/ai-generator/provider/wavespeed/nano-banana-pro/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio: aspectRatio,
          resolution,
          seed: seed || undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate image');
      }

      const taskId = result.data.task_id;

      // 轮询查询任务状态
      const pollStatus = async () => {
        try {
          const statusResponse = await fetch(`/api/ai-generator/status/${taskId}`);
          const statusResult = await statusResponse.json();

          if (!statusResult.success) {
            throw new Error(statusResult.error || 'Failed to query status');
          }

          const { status, progress: taskProgress, results, error } = statusResult.data;

          // 更新进度
          if (taskProgress !== undefined) {
            setProgress(taskProgress);
          }

          if (status === 'completed' && results) {
            // 任务完成
            setIsLoading(false);
            setProgress(100);
            setGeneratedImages(results.map((item: any, index: number) => ({
              id: `${Date.now()}-${index}`,
              url: item.url,
              type: 'image',
            })));

            // 保存任务信息（使用 share_id 而不是 task_id）
            setTaskInfo({
              task_id: statusResult.data.share_id,
              prompt,
              created_at: statusResult.data.created_at,
              completed_at: statusResult.data.completed_at,
            });
          } else if (status === 'failed') {
            // 任务失败
            throw new Error(error?.message || 'Generation failed');
          } else {
            // 继续轮询
            setTimeout(pollStatus, 2000);
          }
        } catch (err) {
          console.error('Polling error:', err);
          setIsLoading(false);
          alert(err instanceof Error ? err.message : 'Failed to check status');
        }
      };

      // 开始轮询
      pollStatus();
    } catch (error) {
      console.error('Generation error:', error);
      setIsLoading(false);
      alert(error instanceof Error ? error.message : 'Failed to generate image');
    }
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
      </div>

      {/* 宽高比选择 */}
      <FormSelect
        id="aspectRatio"
        label="宽高比"
        value={aspectRatio}
        onChange={setAspectRatio}
        options={aspectRatios.map((ratio) => ({ value: ratio.value, label: ratio.label }))}
        placeholder="选择宽高比"
      />

      {/* 分辨率选择 */}
      <FormSelect
        id="resolution"
        label="分辨率"
        value={resolution}
        onChange={(value) => setResolution(value as Resolution)}
        options={[
          { value: '1k', label: '1K' },
          { value: '2k', label: '2K' },
          { value: '4k', label: '4K' },
        ]}
        placeholder="选择分辨率"
      />

      {/* 高级选项 */}
      <AdvancedSettings>
        <SeedInput value={seed} onChange={setSeed} />
      </AdvancedSettings>
    </div>
  );

  // 生成按钮
  const generateButton = (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full rounded-xl px-6 py-3 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base gradient-bg"
      >
        {isLoading ? `生成中... ${progress}%` : `生成图像 (消耗 ${requiredCredits} 配额)`}
      </button>
      <CreditsCard />
    </div>
  );

  // 预览内容
  const previewContent = (
    <>
      {generatedImages.length > 0 && taskInfo ? (
        <MediaGallery
          items={generatedImages}
          taskInfo={taskInfo}
        />
      ) : (
        <ExamplePreview
          examples={examples}
          onSelectExample={handleSelectExample}
          title="快速开始"
          description="点击下方示例快速开始创作，或填写左侧表单自定义生成"
          autoPlayInterval={0}
        />
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
