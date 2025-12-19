'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

/**
 * 模型徽章组件 - 用于显示 NEW、PRO 等重要标识
 */
function ModelBadge({ text }: { text: string }) {
  return (
    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-gradient-to-r from-red-500/90 to-rose-500/90 text-white uppercase tracking-wide flex-shrink-0 shadow-lg shadow-red-500/20">
      {text}
    </span>
  );
}

export interface Model {
  id: string;
  name: string;
  description?: string;
  badge?: string;
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export default function ModelSelector({ models, selectedModel, onModelChange }: ModelSelectorProps) {
  const t = useTranslations('case-generator');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = models.find((model) => model.id === selectedModel);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full rounded-xl px-4 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col items-start min-w-0 flex-1 gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-white/90">
                {currentModel?.name || t('selectModel')}
              </span>
              {currentModel?.badge && (
                <ModelBadge text={currentModel.badge} />
              )}
            </div>
            {currentModel?.description && (
              <span className="text-xs text-white/50 truncate max-w-full">
                {currentModel.description}
              </span>
            )}
          </div>

          {/* 下拉箭头 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-white/50 flex-shrink-0 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* 下拉菜单 */}
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="py-1 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
            {models.map((model) => {
              const isSelected = model.id === selectedModel;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onModelChange(model.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-start gap-3 transition-all duration-150 text-left cursor-pointer ${
                    isSelected
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex-1 flex flex-col items-start min-w-0 gap-1.5">
                    <div className="flex items-center gap-2 w-full flex-wrap">
                      <span className="text-sm font-medium text-white/90">{model.name}</span>
                      {model.badge && (
                        <ModelBadge text={model.badge} />
                      )}
                      {isSelected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white/70 ml-auto flex-shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    {model.description && (
                      <span className="text-xs text-white/50 line-clamp-2">{model.description}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
