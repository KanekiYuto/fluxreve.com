'use client';

import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface ModelOption {
  value: string;
  label: string;
  description: string;
  badge?: string;
}

interface ModelSelectorProps {
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
        className="w-full rounded-lg px-4 py-3 transition-colors group gradient-border"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col items-start min-w-0 flex-1 gap-1">
            <div className="flex items-center gap-2 w-full">
              <span className="text-sm font-medium text-foreground">
                {currentOption?.label || 'Select Model'}
              </span>
              {currentOption?.badge && (
                <Badge className="text-xs">
                  {currentOption.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-full">
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
            className={`text-muted-foreground flex-shrink-0 transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* 下拉菜单 */}
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-2 bg-background/80 backdrop-blur-md rounded-lg border border-border shadow-lg overflow-hidden">
          <div className="py-1 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
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
                  className={`w-full px-4 py-2.5 flex items-start gap-3 hover:bg-white/10 transition-colors text-left ${
                    isSelected ? 'bg-white/15' : ''
                  }`}
                >
                  <div className="flex-1 flex flex-col items-start min-w-0">
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-sm font-medium text-foreground">{option.label}</span>
                      {option.badge && (
                        <Badge className="text-xs">
                          {option.badge}
                        </Badge>
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
                          className="text-foreground ml-auto flex-shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    {option.description && (
                      <span className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{option.description}</span>
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
