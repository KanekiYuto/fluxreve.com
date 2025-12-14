import { useState, useEffect, useCallback } from 'react';
import { useAutoSaveFormState } from './useGeneratorFormPersistence';

interface UseGeneratorModelSelectorProps {
  defaultModel: string;
  supportedModels: string[];
}

/**
 * 生成器模型选择 Hook
 * 处理模型选择、表单状态保存等公共逻辑
 */
export function useGeneratorModelSelector({
  defaultModel,
  supportedModels,
}: UseGeneratorModelSelectorProps) {
  // 验证 defaultModel 是否在支持的模型列表中
  const validModel = supportedModels.includes(defaultModel)
    ? defaultModel
    : supportedModels[0];

  const [selectedModel, setSelectedModel] = useState(validModel);
  const [formStateData, setFormStateData] = useState<any>({});

  // 自动保存表单状态到 sessionStorage
  useAutoSaveFormState(selectedModel, formStateData, 500);

  // 当 defaultModel 变化时更新
  useEffect(() => {
    const newModel = supportedModels.includes(defaultModel)
      ? defaultModel
      : supportedModels[0];
    setSelectedModel(newModel);
  }, [defaultModel, supportedModels]);

  // 处理模型选择变化
  const handleModelChange = useCallback((newModel: string) => {
    setSelectedModel(newModel);
  }, []);

  return {
    selectedModel,
    setSelectedModel: handleModelChange,
    formStateData,
    setFormStateData,
  };
}
