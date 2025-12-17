'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Filter } from 'lucide-react';
import { getModelDisplayName } from '@/config/model-names';

export type StatusFilter = 'completed' | 'processing' | 'pending' | 'failed';
export type TaskTypeFilter = 'text-to-image' | 'image-to-image';
export type ModelFilter = 'nano-banana-pro' | 'nano-banana' | 'z-image' | 'z-image-lora' | 'flux-2-pro' | 'flux-schnell' | 'seedream-v4.5' | 'gpt-image-1.5';
export type PrivacyFilter = 'private' | 'public';
export type NsfwFilter = 'nsfw' | 'safe';

interface TaskFiltersProps {
  selectedStatuses: StatusFilter[];
  selectedTaskTypes: TaskTypeFilter[];
  selectedModels: ModelFilter[];
  selectedPrivacy: PrivacyFilter[];
  selectedNsfw: NsfwFilter[];
  onStatusChange: (statuses: StatusFilter[]) => void;
  onTaskTypeChange: (taskTypes: TaskTypeFilter[]) => void;
  onModelChange: (models: ModelFilter[]) => void;
  onPrivacyChange: (privacy: PrivacyFilter[]) => void;
  onNsfwChange: (nsfw: NsfwFilter[]) => void;
}

const statusOptions: StatusFilter[] = ['completed', 'processing', 'pending', 'failed'];
const taskTypeOptions: TaskTypeFilter[] = ['text-to-image', 'image-to-image'];
const privacyOptions: PrivacyFilter[] = ['private', 'public'];
const nsfwOptions: NsfwFilter[] = ['safe', 'nsfw'];

// 模型与任务类型的关联配置
const MODEL_TASK_TYPE_MAP: Record<ModelFilter, TaskTypeFilter[]> = {
  'nano-banana-pro': ['text-to-image', 'image-to-image'],
  'nano-banana': ['text-to-image'],
  'z-image': ['text-to-image'],
  'z-image-lora': ['text-to-image'],
  'flux-2-pro': ['text-to-image', 'image-to-image'],
  'flux-schnell': ['text-to-image'],
  'seedream-v4.5': ['text-to-image', 'image-to-image'],
  'gpt-image-1.5': ['text-to-image', 'image-to-image'],
};

const allModels: ModelFilter[] = ['nano-banana-pro', 'nano-banana', 'z-image', 'z-image-lora', 'flux-2-pro', 'flux-schnell', 'seedream-v4.5', 'gpt-image-1.5'];

// 多选下拉组件
function MultiSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
  getLabel,
  placeholder,
  selectedCountText,
}: {
  label: string;
  options: T[];
  selected: T[];
  onChange: (values: T[]) => void;
  getLabel: (value: T) => string;
  placeholder: string;
  selectedCountText: (count: number) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: T) => {
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs text-text-muted mb-1.5 font-medium">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 w-full sm:w-auto sm:min-w-[180px] px-3 py-2.5 text-sm rounded-lg bg-surface-secondary border border-border/50 hover:border-border active:border-primary/50 transition-colors cursor-pointer"
      >
        <span className={`truncate ${selected.length === 0 ? 'text-text-muted' : 'text-white'}`}>
          {selected.length === 0
            ? placeholder
            : selected.length === 1
            ? getLabel(selected[0])
            : selectedCountText(selected.length)}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {selected.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange([]);
              }}
              className="p-1 hover:bg-bg-hover active:bg-bg-hover rounded-md -mr-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-text-muted" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 py-1 bg-bg-elevated border border-border rounded-lg shadow-xl max-h-[240px] overflow-y-auto w-full sm:w-auto sm:min-w-full">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-bg-hover active:bg-bg-hover transition-colors cursor-pointer"
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                selected.includes(option)
                  ? 'bg-primary border-primary'
                  : 'border-border'
              }`}>
                {selected.includes(option) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className={`${selected.includes(option) ? 'text-white font-medium' : 'text-text-muted'}`}>
                {getLabel(option)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TaskFilters({
  selectedStatuses,
  selectedTaskTypes,
  selectedModels,
  selectedPrivacy,
  selectedNsfw,
  onStatusChange,
  onTaskTypeChange,
  onModelChange,
  onPrivacyChange,
  onNsfwChange,
}: TaskFiltersProps) {
  const t = useTranslations('tasks');

  // 根据选择的任务类型动态计算可用的模型选项
  const availableModels = useMemo(() => {
    if (selectedTaskTypes.length === 0) {
      return allModels;
    }
    return allModels.filter((model) =>
      selectedTaskTypes.every((taskType) => MODEL_TASK_TYPE_MAP[model].includes(taskType))
    );
  }, [selectedTaskTypes]);

  // 当任务类型变化时，清除不兼容的模型选择
  const handleTaskTypeChange = (taskTypes: TaskTypeFilter[]) => {
    onTaskTypeChange(taskTypes);

    if (selectedModels.length > 0 && taskTypes.length > 0) {
      const validModels = selectedModels.filter((model) =>
        taskTypes.every((taskType) => MODEL_TASK_TYPE_MAP[model].includes(taskType))
      );
      if (validModels.length !== selectedModels.length) {
        onModelChange(validModels);
      }
    }
  };

  const totalFilters = selectedStatuses.length + selectedTaskTypes.length + selectedModels.length + selectedPrivacy.length + selectedNsfw.length;
  const hasFilters = totalFilters > 0;

  const clearAllFilters = () => {
    onStatusChange([]);
    onTaskTypeChange([]);
    onModelChange([]);
    onPrivacyChange([]);
    onNsfwChange([]);
  };

  const selectedCountText = (count: number) => t('filter.selectedCount', { count });

  return (
    <div className="space-y-3">
      {/* 筛选器标题栏 - 移动端显示 */}
      <div className="flex items-center justify-between sm:hidden">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Filter className="w-4 h-4" />
          <span>{t('filter.title')}</span>
          {hasFilters && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
              {totalFilters}
            </span>
          )}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-text-muted hover:text-white transition-colors cursor-pointer"
          >
            {t('filter.clearAll')}
          </button>
        )}
      </div>

      {/* 筛选器 - 移动端网格，PC端flex自动宽度 */}
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
        {/* 状态筛选 */}
        <div className="sm:w-auto">
          <MultiSelect
            label={t('filter.statusLabel')}
            options={statusOptions}
            selected={selectedStatuses}
            onChange={onStatusChange}
            getLabel={(status) => t(`filter.${status}`)}
            placeholder={t('filter.selectPlaceholder')}
            selectedCountText={selectedCountText}
          />
        </div>

        {/* 任务类型筛选 */}
        <div className="sm:w-auto">
          <MultiSelect
            label={t('filter.taskTypeLabel')}
            options={taskTypeOptions}
            selected={selectedTaskTypes}
            onChange={handleTaskTypeChange}
            getLabel={(type) => t(`filter.taskType.${type}`)}
            placeholder={t('filter.selectPlaceholder')}
            selectedCountText={selectedCountText}
          />
        </div>

        {/* 模型筛选 */}
        <div className="col-span-2 sm:col-span-1 sm:w-auto">
          <MultiSelect
            label={t('filter.modelLabel')}
            options={availableModels}
            selected={selectedModels}
            onChange={onModelChange}
            getLabel={(model) => getModelDisplayName(model)}
            placeholder={t('filter.selectPlaceholder')}
            selectedCountText={selectedCountText}
          />
        </div>

        {/* 隐私筛选 */}
        <div className="sm:w-auto">
          <MultiSelect
            label={t('filter.privacyLabel')}
            options={privacyOptions}
            selected={selectedPrivacy}
            onChange={onPrivacyChange}
            getLabel={(privacy) => t(`filter.privacy.${privacy}`)}
            placeholder={t('filter.selectPlaceholder')}
            selectedCountText={selectedCountText}
          />
        </div>

        {/* NSFW 筛选 */}
        <div className="sm:w-auto">
          <MultiSelect
            label={t('filter.nsfwLabel')}
            options={nsfwOptions}
            selected={selectedNsfw}
            onChange={onNsfwChange}
            getLabel={(nsfw) => t(`filter.nsfw.${nsfw}`)}
            placeholder={t('filter.selectPlaceholder')}
            selectedCountText={selectedCountText}
          />
        </div>

        {/* 清空按钮 - 桌面端显示 */}
        {hasFilters && (
          <div className="hidden sm:flex items-end">
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-3 py-2.5 text-sm text-text-muted hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              {t('filter.clearAll')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
