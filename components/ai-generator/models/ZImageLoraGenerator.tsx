'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import GeneratorLayoutWrapper from '../base/GeneratorLayoutWrapper';
import { ExampleItem } from '../base/ExampleGallery';
import AdvancedSettings from '../base/AdvancedSettings';
import FormSelect from '../form/FormSelect';
import SeedInput from '../form/SeedInput';
import LoraSelector, { LoraConfig } from '../base/LoraSelector';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWebHookGenerator } from '@/hooks/useWebHookGenerator';

// ==================== 类型定义 ====================

interface ZImageLoraGeneratorProps {
  modelSelector: React.ReactNode;
  defaultParameters?: any;
}

// ==================== 常量配置 ====================

const SIZE_OPTIONS = [
  { value: '1024*1024', label: '1024×1024 (1:1)' },
  { value: '1024*768', label: '1024×768 (4:3)' },
  { value: '768*1024', label: '768×1024 (3:4)' },
  { value: '1344*768', label: '1344×768 (16:9)' },
  { value: '768*1344', label: '768×1344 (9:16)' },
  { value: '1024*1536', label: '1024×1536 (2:3)' },
  { value: '1536*1024', label: '1536×1024 (3:2)' },
];

const EXAMPLES: ExampleItem[] = [
  {
    id: '1',
    thumbnail: '/material/models/z-image-lora/5bea9816-d8ec-4952-88e9-7e6f33f4402a.jpeg',
    prompt: 'A high-resolution portrait photograph of a young East Asian woman with short, dark, layered hair and soft, expressive eyes, captured in a moody, intimate setting. She wears a black sleeveless top with delicate lace detailing and a thin gold necklace, her gaze fixed directly at the camera with a subtle, contemplative expression. The shallow depth of field blurs the background, which hints at festive or party lighting with warm glows and indistinct shapes, emphasizing her as the sole focus. The lighting is soft and directional, highlighting her facial features with a cinematic, naturalistic quality. A close-up, medium shot with a slightly low angle, evoking a moody, stylish, and emotionally resonant atmosphere.',
    tags: [],
  },
];

// ==================== 主组件 ====================

export default function ZImageLoraGenerator({ modelSelector, defaultParameters }: ZImageLoraGeneratorProps) {
  const tForm = useTranslations('ai-generator.form');
  const tError = useTranslations('ai-generator.error');

  // ==================== 状态管理 ====================

  // 表单状态
  const [prompt, setPrompt] = useState(defaultParameters?.prompt || '');
  const [size, setSize] = useState(defaultParameters?.size || '1024*1536');
  const [seed, setSeed] = useState(defaultParameters?.seed || '');
  const [loras, setLoras] = useState<LoraConfig[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

  // 使用 WebHook 生成器 Hook
  const generator = useWebHookGenerator({
    apiEndpoint: '/api/ai-generator/provider/wavespeed/z-image-lora/text-to-image',
    serviceType: 'text-to-image',
    serviceSubType: 'z-image-lora',
    statusEndpoint: '/api/ai-generator/status',
    pollingConfig: {
      interval: 500,
      timeout: 300000,
    },
    buildRequestBody: (params) => ({
      prompt: params.prompt,
      size: params.size,
      seed: params.seed ? parseInt(params.seed, 10) : -1,
      loras: params.loras,
      enable_base64_output: false,
      enable_sync_mode: false,
      is_private: params.isPrivate,
    }),
    processResponse: (results) => (results || []).map((item: any) =>
      typeof item === 'string' ? item : item.url
    ),
    extractCreditsParams: (requestBody) => ({
      size: requestBody.size,
      seed: requestBody.seed,
    }),
    currentParams: {
      prompt,
      size,
      seed,
      loras,
      isPrivate,
    },
  });

  // 当 defaultParameters 变化时更新表单状态
  useEffect(() => {
    if (defaultParameters) {
      if (defaultParameters.prompt) setPrompt(defaultParameters.prompt);
      if (defaultParameters.size) setSize(defaultParameters.size);
      if (defaultParameters.seed) setSeed(defaultParameters.seed);

      // 处理 loras - 如果只有 id 和 scale，需要获取完整信息
      if (defaultParameters.loras && Array.isArray(defaultParameters.loras) && defaultParameters.loras.length > 0) {
        const lorasFromDb = defaultParameters.loras;

        // 检查是否需要补充 LoRA 信息
        const needsFetch = lorasFromDb.some((lora: any) => !lora.url);

        if (needsFetch) {
          // 如果 LoRA 信息不完整，需要从 API 获取
          const fetchLoraDetails = async () => {
            try {
              const loraIds = lorasFromDb.map((lora: any) => lora.id);
              const response = await fetch(`/api/lora?ids=${loraIds.join(',')}`);
              if (response.ok) {
                const { data: loraDetails } = await response.json();

                // 合并数据库中的 scale 信息和 API 返回的详细信息
                const enrichedLoras = lorasFromDb.map((dbLora: any) => {
                  const detail = loraDetails.find((d: any) => d.id === dbLora.id);
                  return {
                    ...detail,
                    scale: dbLora.scale,
                  };
                });

                setLoras(enrichedLoras);
              } else {
                // 如果 API 失败，显示错误但不设置不完整的数据
                console.error('Failed to fetch LoRA details: API returned error');
              }
            } catch (error) {
              console.error('Failed to fetch LoRA details:', error);
              // 如果出错，不设置任何数据，保持加载状态
            }
          };

          fetchLoraDetails();
        } else {
          // 如果信息完整，直接使用
          setLoras(lorasFromDb);
        }
      }
    }
  }, [defaultParameters]);

  // ==================== LoRA 管理函数 ====================

  // 更新 LoRA 配置
  const handleLoraChange = useCallback((newLoras: LoraConfig[]) => {
    setLoras(newLoras);
  }, []);

  // ==================== 事件处理函数 ====================

  // 选择示例
  const handleSelectExample = useCallback((example: ExampleItem) => {
    setPrompt(example.prompt);
  }, []);

  // 生成图像
  const handleGenerate = useCallback(() => {
    // 转换 LoRA 配置格式，只传递 ID 和 scale，其他信息由后端查询
    const lorasForApi = loras.map(lora => ({
      id: lora.id,
      scale: lora.scale,
    }));

    generator.handleGenerate(
      {
        prompt,
        size,
        seed,
        loras: lorasForApi,
        isPrivate,
      },
      {
        validateCredits: true,
        customValidation: (params: any) => {
          if (!params.prompt.trim()) {
            return {
              type: 'validation_error',
              title: tError('parameterError'),
              message: tError('promptRequired'),
            };
          }

          return null;
        },
      }
    );
  }, [generator, prompt, size, seed, loras, isPrivate, tError]);

  // ==================== 渲染函数 ====================

  const formContent = (
    <div className="space-y-6">
      {/* 提示词输入 */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium">
          {tForm('prompt')} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={tForm('promptPlaceholder')}
          className="h-32 resize-none"
        />
      </div>

      {/* 尺寸选择 */}
      <FormSelect
        id="size"
        label={tForm('size')}
        value={size}
        onChange={setSize}
        options={SIZE_OPTIONS}
        placeholder={tForm('sizePlaceholder')}
      />

      {/* LoRA 配置 */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          LoRA {tForm('configuration')}
        </Label>
        <LoraSelector
          model="z-image-lora"
          selected={loras}
          onChange={handleLoraChange}
        />
      </div>

      {/* 高级选项 */}
      <AdvancedSettings isPrivate={isPrivate} onPrivateChange={setIsPrivate}>
        <SeedInput value={seed} onChange={setSeed} />
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
      onSelectExample={handleSelectExample}
      generator={generator}
    />
  );
}

