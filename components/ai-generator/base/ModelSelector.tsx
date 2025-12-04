'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * 标签配置接口
 * @property text - 标签文本
 * @property variant - 标签样式变体（默认：普通样式，强调：突出显示）
 */
export interface Tag {
  text: string;
  variant?: 'default' | 'highlight';
}

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

/**
 * 模型标签组件 - 自定义样式的标签显示
 */
function ModelTag({ text, variant = 'default' }: Tag) {
  const variantStyles = {
    default: 'bg-white/8 text-white/70 hover:bg-white/12 hover:text-white/80',
    highlight: 'bg-gradient-to-r from-primary/25 to-primary/15 text-primary hover:from-primary/35 hover:to-primary/25',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all duration-200 ${variantStyles[variant]}`}
    >
      {text}
    </span>
  );
}

/**
 * 模型选项接口
 * @example
 * // 基础用法（向后兼容）
 * {
 *   value: 'model-1',
 *   label: 'Model Name',
 *   description: 'Model description',
 *   badge: 'NEW'
 * }
 *
 * @example
 * // 使用多个标签
 * {
 *   value: 'model-2',
 *   label: 'Advanced Model',
 *   description: 'Description here',
 *   tags: [
 *     { text: 'Pro', variant: 'default' },
 *     { text: 'Fast', variant: 'secondary' },
 *     { text: 'Beta', variant: 'outline' }
 *   ]
 * }
 */
export interface ModelOption {
  value: string;
  label: string;
  description: string;
  badge?: string; // 保留向后兼容
  tags?: Tag[]; // 新增：支持多个标签
}

export interface ModelSelectorProps {
  options: ModelOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function ModelSelector({ options, value, onChange }: ModelSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = options.find((opt) => opt.value === value);

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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white/90">
                {currentOption?.label || 'Select Model'}
              </span>
              {currentOption?.badge && (
                <ModelBadge text={currentOption.badge} />
              )}
            </div>
            <span className="text-xs text-white/50 truncate max-w-full">
              {currentOption?.description || 'Choose a model to continue'}
            </span>
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
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-start gap-3 transition-all duration-150 text-left cursor-pointer ${
                    isSelected
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex-1 flex flex-col items-start min-w-0 gap-1">
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-sm font-medium text-white/90">{option.label}</span>
                      {/* Badge 显示在名称右边 */}
                      {option.badge && (
                        <ModelBadge text={option.badge} />
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
                    {option.description && (
                      <span className="text-xs text-white/50 line-clamp-2">{option.description}</span>
                    )}
                    {/* Tags 标签放在描述下方 */}
                    {option.tags && option.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {option.tags.map((tag, index) => (
                          <ModelTag key={index} text={tag.text} variant={tag.variant} />
                        ))}
                      </div>
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
