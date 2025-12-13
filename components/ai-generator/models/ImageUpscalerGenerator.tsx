'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayoutWrapper from '../base/GeneratorLayoutWrapper';
import { ExampleItem } from '../base/ExampleGallery';
import AdvancedSettings from '../base/AdvancedSettings';
import FormSelect from '../form/FormSelect';
import ImageUpload, { ImageItem } from '../form/ImageUpload';
import { useDirectGenerator } from '@/hooks/useDirectGenerator';

// ==================== 类型定义 ====================

interface ImageUpscalerGeneratorProps {
  modelSelector: React.ReactNode;
  defaultParameters?: any;
}

// ==================== 常量配置 ====================

const RESOLUTION_OPTIONS = [
  { value: '1k', label: '1K' },
  { value: '2k', label: '2K' },
  { value: '4k', label: '4K' },
];

const OUTPUT_FORMAT_OPTIONS = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
];

const EXAMPLES: ExampleItem[] = [
  {
    id: '1',
    thumbnail: '/material/models/image-upscaler/723518b0-61c5-44d3-8284-fa281ce550d9.webp',
    prompt: '',
    tags: ['photorealistic', 'professional'],
  },
];

// ==================== 主组件 ====================

export default function ImageUpscalerGenerator({
  modelSelector,
  defaultParameters,
}: ImageUpscalerGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  // 表单状态
  const [inputImages, setInputImages] = useState<ImageItem[]>(
    defaultParameters?.images
      ? defaultParameters.images.map((url: string, index: number) => ({
        id: `image-${index}`,
        url,
        file: null,
      }))
      : []
  );
  const [targetResolution, setTargetResolution] = useState(
    defaultParameters?.targetResolution || '1k'
  );
  const [outputFormat, setOutputFormat] = useState(defaultParameters?.outputFormat || 'jpeg');
  const [isPrivate, setIsPrivate] = useState(false);

  // 使用 Direct 生成器 Hook
  const generator = useDirectGenerator({
    apiEndpoint: '/api/ai-generator/provider/wavespeed/image-upscaler',
    serviceType: 'image-upscaler',
    serviceSubType: 'wavespeed-image-upscaler',
    buildRequestBody: (params) => ({
      image: params.image,
      target_resolution: params.target_resolution,
      output_format: params.output_format,
      enable_base64_output: false,
    }),
    processResponse: (results) => (results || []).map((item: any) =>
      typeof item === 'string' ? item : item.url
    ),
    extractCreditsParams: (requestBody) => ({
      target_resolution: requestBody.target_resolution,
    }),
    currentParams: {
      image: inputImages[0]?.url,
      target_resolution: targetResolution,
      output_format: outputFormat,
    },
  });

  // 当 defaultParameters 变化时更新表单状态
  useEffect(() => {
    if (defaultParameters) {
      if (defaultParameters.targetResolution) setTargetResolution(defaultParameters.targetResolution);
      if (defaultParameters.outputFormat) setOutputFormat(defaultParameters.outputFormat);

      // 处理输入图片
      if (defaultParameters.images && Array.isArray(defaultParameters.images)) {
        const images = defaultParameters.images.map((url: string, index: number) => ({
          id: `image-${index}`,
          url,
          file: null,
        }));
        setInputImages(images);
      }
    }
  }, [defaultParameters]);


  // ==================== 事件处理函数 ====================

  // 生成（放大）图像
  const handleGenerate = useCallback(() => {
    generator.handleGenerate(
      {
        image: inputImages[0]?.url,
        target_resolution: targetResolution,
        output_format: outputFormat,
      },
      {
        validateCredits: true,
        customValidation: (params: any) => {
          if (!params.image) {
            return {
              type: 'validation_error',
              title: tError('parameterError'),
              message: tForm('uploadImageRequired'),
            };
          }
          return null;
        },
      }
    );
  }, [generator, inputImages, targetResolution, outputFormat, tError, tForm]);

  // ==================== 渲染函数 ====================

  const formContent = (
    <div className="space-y-6">
      {/* 上传图片 */}
      <ImageUpload
        value={inputImages}
        onChange={setInputImages}
        label={tForm('uploadImage')}
        maxCount={1}
        required
        id="inputImages"
        modelName="image-upscaler"
        generatorType="image-upscaler"
      />

      {/* 目标分辨率选择 */}
      <FormSelect
        id="targetResolution"
        label={tForm('targetResolution')}
        value={targetResolution}
        onChange={setTargetResolution}
        options={RESOLUTION_OPTIONS}
        placeholder={tForm('targetResolutionPlaceholder')}
      />

      {/* 高级选项 */}
      <AdvancedSettings isPrivate={isPrivate} onPrivateChange={setIsPrivate}>
        <div className="space-y-3">
          {/* 输出格式选择 */}
          <FormSelect
            id="outputFormat"
            label={tForm('outputFormat')}
            value={outputFormat}
            onChange={setOutputFormat}
            options={OUTPUT_FORMAT_OPTIONS}
            placeholder={tForm('outputFormatPlaceholder')}
          />
        </div>
      </AdvancedSettings>
    </div>
  );

  // ==================== 主渲染 ====================

  return (
    <GeneratorLayoutWrapper
      modelSelector={modelSelector}
      formContent={formContent}
      onGenerate={handleGenerate}
      examples={EXAMPLES}
      onSelectExample={() => {}}
      enableSelectExample={false}
      generator={generator}
    />
  );
}
