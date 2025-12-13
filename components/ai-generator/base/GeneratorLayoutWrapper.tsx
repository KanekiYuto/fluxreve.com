'use client';

import GeneratorLayout from './GeneratorLayout';
import { ExampleItem } from './ExampleGallery';

interface GeneratorLayoutWrapperProps {
  modelSelector: React.ReactNode;
  formContent: React.ReactNode;
  onGenerate: () => void;
  examples?: ExampleItem[];
  onSelectExample?: (example: ExampleItem) => void;
  enableSelectExample?: boolean; // 是否启用"使用示例"功能，默认为 true
  generator: {
    requiredCredits: number;
    isLoading: boolean;
    progress: number;
    errorInfo: { title: string; message: string } | null;
    credits: number | null;
    creditsLoading: boolean;
    refreshCredits: () => void;
    generatedImages: string[];
    taskInfo: any;
  };
}

export default function GeneratorLayoutWrapper({
  modelSelector,
  formContent,
  onGenerate,
  examples,
  onSelectExample,
  enableSelectExample = true,
  generator,
}: GeneratorLayoutWrapperProps) {
  return (
    <GeneratorLayout
      headerContent={modelSelector}
      formContent={formContent}
      onGenerate={onGenerate}
      requiredCredits={generator.requiredCredits}
      isLoading={generator.isLoading}
      progress={generator.progress}
      error={
        generator.errorInfo
          ? {
              title: generator.errorInfo.title,
              message: generator.errorInfo.message,
            }
          : undefined
      }
      credits={generator.credits}
      isCreditsLoading={generator.creditsLoading}
      onCreditsRefresh={generator.refreshCredits}
      generatedItems={generator.generatedImages.map((url) => ({
        id: url,
        url,
        type: 'image' as const,
      }))}
      taskInfo={generator.taskInfo}
      examples={examples}
      onSelectExample={onSelectExample}
      enableSelectExample={enableSelectExample}
    />
  );
}
