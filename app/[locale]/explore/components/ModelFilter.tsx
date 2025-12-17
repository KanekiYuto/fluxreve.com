'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

// 支持的模型列表
const MODELS = [
  { id: 'all', name: 'All Models' },
  { id: 'nano-banana-pro', name: 'Nano Banana Pro' },
  { id: 'nano-banana', name: 'Nano Banana' },
  { id: 'z-image', name: 'Z-Image' },
  { id: 'z-image-lora', name: 'Z-Image Turbo LoRA' },
  { id: 'flux-2-pro', name: 'Flux 2 Pro' },
  { id: 'flux-schnell', name: 'Flux Schnell' },
  { id: 'seedream-v4.5', name: 'Seedream 4.5' },
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5' },
];

interface ModelFilterProps {
  currentModel?: string;
}

export default function ModelFilter({ currentModel }: ModelFilterProps) {
  const t = useTranslations('explore');
  const router = useRouter();
  const pathname = usePathname();

  const handleModelChange = (modelId: string) => {
    if (modelId === 'all') {
      // 跳转到 /explore
      router.push('/explore');
    } else {
      // 跳转到 /explore/[model]
      router.push(`/explore/${modelId}`);
    }
  };

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {MODELS.map((model) => {
        const isActive = model.id === 'all'
          ? !currentModel
          : currentModel === model.id;

        return (
          <button
            key={model.id}
            onClick={() => handleModelChange(model.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
              ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-bg-elevated text-text-muted hover:text-text hover:bg-bg-hover border border-border'
              }
            `}
          >
            {model.name}
          </button>
        );
      })}
    </div>
  );
}
