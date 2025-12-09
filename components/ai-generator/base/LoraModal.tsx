'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, Trash2, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import useLoraModalStore from '@/store/useLoraModalStore';
import { LoraConfig, LoraOption } from './LoraSelector';

export default function LoraModal() {
  const t = useTranslations('ai-generator.lora');
  const { isOpen, currentModel, tempSelectedLoras, setTempLoras, confirm, cancel } = useLoraModalStore();

  const [availableLoras, setAvailableLoras] = useState<LoraOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 加载可用的 LoRA 列表
  useEffect(() => {
    if (!isOpen || !currentModel) return;

    async function fetchLoras() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/lora?model=${currentModel}&limit=100`);
        const data = await response.json();
        if (data.success) {
          setAvailableLoras(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch LoRAs:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLoras();
  }, [isOpen, currentModel]);

  // 键盘事件处理
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        cancel();
      }
    },
    [isOpen, cancel]
  );

  // 注册键盘事件
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 点击遮罩层关闭
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      cancel();
    }
  };

  // 切换 LoRA 选择状态
  const toggleLora = (lora: LoraOption) => {
    const existingIndex = tempSelectedLoras.findIndex((l) => l.id === lora.id);

    if (existingIndex !== -1) {
      // 如果已选择，则移除
      setTempLoras(tempSelectedLoras.filter((_, i) => i !== existingIndex));
    } else {
      // 如果未选择，则添加
      const newConfig: LoraConfig = {
        id: lora.id,
        url: lora.url,
        scale: 1, // 默认缩放值
        triggerWord: lora.triggerWord || undefined,
        prompt: lora.prompt,
        title: lora.title,
        assetUrls: lora.assetUrls,
        description: lora.description,
      };
      setTempLoras([...tempSelectedLoras, newConfig]);
    }
  };

  // 删除 LoRA
  const handleRemoveLora = (index: number) => {
    setTempLoras(tempSelectedLoras.filter((_, i) => i !== index));
  };

  // 更新 LoRA 缩放值
  const handleUpdateScale = (index: number, scale: number) => {
    const newSelected = [...tempSelectedLoras];
    newSelected[index] = {
      ...newSelected[index],
      scale: Math.max(0, Math.min(4, Math.round(scale))), // 限制在 0-4 之间的整数
    };
    setTempLoras(newSelected);
  };

  // 获取 LoRA 详情
  const getLoraDetails = (config: LoraConfig): LoraOption | undefined => {
    return availableLoras.find((l) => l.id === config.id);
  };

  // 检查是否已选择
  const isLoraSelected = (loraId: string): boolean => {
    return tempSelectedLoras.some((l) => l.id === loraId);
  };

  // 过滤 LoRA 列表
  const filteredLoras = availableLoras.filter((lora) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lora.title.toLowerCase().includes(query) ||
      lora.description?.toLowerCase().includes(query) ||
      lora.triggerWord?.toLowerCase().includes(query)
    );
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 animate-in fade-in duration-150 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-150 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {t('modalTitle')}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              {t('modalSubtitle')}
            </p>
          </div>
          <button
            onClick={cancel}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* 左侧：LoRA 库 */}
          <div className="flex-1 flex flex-col md:border-r border-white/10">
            {/* 搜索框 */}
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 placeholder:text-white/40"
              />
            </div>

            {/* LoRA 列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                      <svg className="w-8 h-8 text-white animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-white/60">{t('loading')}</p>
                  </div>
                </div>
              ) : filteredLoras.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Info className="w-12 h-12 text-white/30 mb-3" />
                  <p className="text-sm text-white/50">
                    {searchQuery ? t('noSearchResults') : t('noLoraAvailable')}
                  </p>
                  {!searchQuery && (
                    <p className="mt-1 text-xs text-white/30">{t('noLoraHint')}</p>
                  )}
                </div>
              ) : (
                filteredLoras.map((lora) => {
                  const selected = isLoraSelected(lora.id);
                  return (
                    <button
                      key={lora.id}
                      onClick={() => toggleLora(lora)}
                      className={`w-full p-3.5 rounded-lg border transition-colors text-left cursor-pointer ${
                        selected
                          ? 'bg-white/10 border-white/30'
                          : 'bg-transparent border-white/10 hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* 预览图 */}
                        {lora.assetUrls.length > 0 && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={lora.assetUrls[0]}
                              alt={lora.title}
                              className="w-full h-full object-cover"
                            />
                            {/* 选中标记 */}
                            {selected && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                                  <Check className="w-5 h-5 text-black" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-medium text-white truncate flex-1">
                              {lora.title}
                            </span>
                            {lora.triggerWord && (
                              <span className="px-2 py-0.5 text-xs rounded bg-white/10 text-white/70 flex-shrink-0">
                                {lora.triggerWord}
                              </span>
                            )}
                          </div>
                          {lora.description && (
                            <p className="text-xs text-white/50 line-clamp-3 leading-relaxed">
                              {lora.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 右侧：已选择的 LoRA */}
          <div className="w-full md:w-96 flex flex-col bg-black/20 border-t md:border-t-0 border-white/10 max-h-[40vh] md:max-h-none">
            <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
              <h3 className="text-sm font-medium text-white">
                {t('selectedLoras')} ({tempSelectedLoras.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
              {tempSelectedLoras.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Info className="w-10 h-10 text-white/30 mb-2" />
                  <p className="text-sm text-white/50">{t('noSelectedLoras')}</p>
                  <p className="mt-1 text-xs text-white/30">{t('clickToSelect')}</p>
                </div>
              ) : (
                tempSelectedLoras.map((config, index) => {
                  const details = getLoraDetails(config);
                  return (
                    <div
                      key={index}
                      className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-3"
                    >
                      {/* LoRA 头部信息 */}
                      <div className="flex items-start gap-3">
                        {/* 预览图 */}
                        {details?.assetUrls && details.assetUrls.length > 0 && (
                          <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={details.assetUrls[0]}
                              alt={details.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-white truncate flex-1">
                              {details?.title || config.url}
                            </h4>
                            {config.triggerWord && (
                              <span className="px-1.5 py-0.5 text-xs rounded bg-white/10 text-white/60 flex-shrink-0">
                                {config.triggerWord}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveLora(index)}
                          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors flex-shrink-0 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* 缩放值调整 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`scale-${index}`} className="text-sm font-medium text-white">
                            {t('scale')}
                          </Label>
                          <span className="text-sm font-medium text-white tabular-nums">
                            {config.scale}
                          </span>
                        </div>
                        <Slider
                          id={`scale-${index}`}
                          min={0}
                          max={4}
                          step={1}
                          value={[config.scale]}
                          onValueChange={(values) => handleUpdateScale(index, values[0])}
                          className="w-full cursor-pointer"
                        />
                        <div className="flex justify-between text-sm font-medium text-white/60">
                          <span>0</span>
                          <span>~</span>
                          <span>4</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 flex-shrink-0 bg-black/20">
          <Button
            type="button"
            onClick={cancel}
            variant="outline"
            className="min-w-24 border-white/20 text-white/70 hover:text-white hover:bg-white/5 hover:border-white/30 cursor-pointer"
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={confirm}
            className="min-w-24 bg-white text-black hover:bg-white/90 cursor-pointer"
          >
            {t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
