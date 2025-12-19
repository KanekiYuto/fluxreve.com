'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayout from '../base/GeneratorLayout';
import { ExampleItem } from '../base/ExampleGallery';
import ImageUpload, { ImageItem } from '../form/ImageUpload';
import FormSelect from '../form/FormSelect';
import { Label } from '@/components/ui/label';
import { useDirectGenerator } from '@/hooks/useDirectGenerator';

// ==================== 类型定义 ====================

interface ImageWatermarkRemoverGeneratorProps {
  modelSelector: React.ReactNode;
}

// ==================== 常量配置 ====================

const OUTPUT_FORMAT_OPTIONS = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
];

const EXAMPLES: ExampleItem[] = [
  {
    id: '1',
    thumbnail: '/material/models/image-watermark-remover/b8beccb7-a6c3-4d67-b6a2-ec2d8e619fb3.jpeg',
    original: '/material/models/image-watermark-remover/cd2adb6a-c657-461d-91e8-95cd9bf0bbd0.jpeg',
    prompt: '',
    tags: ['removal', 'clean', 'watermark'],
  },
];

// ==================== 主组件 ====================

export default function ImageWatermarkRemoverGenerator({
  modelSelector,
}: ImageWatermarkRemoverGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  const [uploadedImage, setUploadedImage] = useState<ImageItem | null>(null);
  const [outputFormat, setOutputFormat] = useState('jpeg');

  // 使用 Direct 生成器 Hook
  const generator = useDirectGenerator({
    apiEndpoint: '/api/ai-generator/provider/wavespeed/image-watermark-remover',
    serviceType: 'image-watermark-remover',
    serviceSubType: 'wavespeed-image-watermark-remover',
    buildRequestBody: (params) => ({
      image: params.image,
      output_format: params.output_format,
      enable_base64_output: false,
    }),
    processResponse: (results) => (results || []).map((item: any) =>
      typeof item === 'string' ? item : item.url
    ),
    extractCreditsParams: () => ({}),
    currentParams: {
      image: uploadedImage?.url,
      output_format: outputFormat,
    },
  });

  // ==================== 事件处理函数 ====================

  const handleGenerate = useCallback(() => {
    generator.handleGenerate(
      {
        image: uploadedImage?.url,
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
  }, [generator, uploadedImage, outputFormat, tError, tForm]);

  // ==================== 渲染函数 ====================

  const formContent = (
    <div className="space-y-6">
      {/* 图片上传 */}
      <ImageUpload
        value={uploadedImage ? [uploadedImage] : []}
        onChange={(images) => {
          setUploadedImage(images.length > 0 ? images[0] : null);
        }}
        maxCount={1}
        label={tForm('uploadImage')}
        required
        modelName="image-watermark-remover"
        generatorType="more"
      />

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
  );

  // ==================== 主渲染 ====================

  return (
    <GeneratorLayout
      headerContent={modelSelector}
      formContent={formContent}
      onGenerate={handleGenerate}
      requiredCredits={generator.requiredCredits}
      isLoading={generator.isLoading}
      progress={generator.progress}
      error={generator.error}
      results={generator.results}
      examples={EXAMPLES}
      onSelectExample={() => { }}
      enableSelectExample={false}
    />
  );
}
