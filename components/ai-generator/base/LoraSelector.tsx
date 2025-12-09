'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Sparkles, Settings2 } from 'lucide-react';
import useLoraModalStore from '@/store/useLoraModalStore';
import useImagePreviewStore from '@/store/useImagePreviewStore';

/**
 * LoRA 选项接口
 */
export interface LoraOption {
  id: string;
  url: string;
  triggerWord: string | null;
  prompt: string;
  title: string;
  description: string | null;
  assetUrls: string[];
}

/**
 * LoRA 配置接口（用于生成）
 */
export interface LoraConfig {
  id: string;
  url: string;
  scale: number; // 0-4 之间的整数
  triggerWord?: string;
  prompt?: string;
  title?: string;
  assetUrls?: string[];
  description?: string | null;
}

export interface LoraSelectorProps {
  model: string; // 当前选择的模型
  selected: LoraConfig[];
  onChange: (loras: LoraConfig[]) => void;
}

export default function LoraSelector({ model, selected, onChange }: LoraSelectorProps) {
  const t = useTranslations('ai-generator.lora');
  const { open } = useLoraModalStore();
  const { open: openImagePreview } = useImagePreviewStore();

  // 打开 LoRA 选择 Modal
  const handleOpenModal = () => {
    open(model, selected, onChange);
  };

  // 打开图片预览
  const handlePreview = (assetUrls: string[], initialIndex: number = 0) => {
    openImagePreview(assetUrls, initialIndex);
  };

  return (
    <div className="space-y-3">
        {/* 已选择的 LoRA 卡片列表 */}
        {selected.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white/70" />
                <span className="text-sm font-medium text-white">
                  {t('selectedCount', { count: selected.length })}
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenModal}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {t('manage')}
              </button>
            </div>

            {/* LoRA 卡片列表 */}
            <div className="space-y-2">
              {selected.map((lora, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center gap-3"
                >
                  {/* 预览图 */}
                  {lora.assetUrls && lora.assetUrls.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handlePreview(lora.assetUrls!, 0)}
                      className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-white/5 border border-white/10 hover:border-white/30 transition-colors cursor-pointer group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={lora.assetUrls[0]}
                        alt={lora.title || 'LoRA preview'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </button>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white truncate">
                        {lora.title || lora.triggerWord || `LoRA ${index + 1}`}
                      </span>
                      {lora.triggerWord && lora.title && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-white/10 text-white/60 flex-shrink-0">
                          {lora.triggerWord}
                        </span>
                      )}
                    </div>
                    {lora.description && (
                      <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                        {lora.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <div className="text-right">
                      <div className="text-xs text-white/50 mb-0.5">Scale</div>
                      <div className="text-sm font-semibold text-white font-mono">
                        {lora.scale}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* 选择 LoRA 按钮 */}
      <Button
        type="button"
        onClick={handleOpenModal}
        variant="outline"
        className="w-full justify-center gap-2 border-white/20 text-white/70 hover:text-white hover:bg-white/5 hover:border-white/30 cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>{selected.length > 0 ? t('selectMore') : t('selectLora')}</span>
      </Button>
    </div>
  );
}
