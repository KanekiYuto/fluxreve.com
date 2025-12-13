import { useState, useCallback, useEffect } from 'react';
import { ImageItem } from '@/components/ai-generator/form/ImageUpload';

/**
 * Hook for persisting form state across model switches using sessionStorage
 * 用于在模型切换时使用 sessionStorage 保存表单状态的 Hook
 */

const STORAGE_KEY_PREFIX = 'generator_form_state_';

interface FormStateData {
  prompt?: string;
  inputImages?: ImageItem[];
  aspectRatio?: string;
  seed?: string;
  resolution?: string;
  outputFormat?: string;
  isPrivate?: boolean;
  [key: string]: any;
}

/**
 * 创建特定模型的存储键
 * Create storage key for specific model
 */
const getStorageKey = (model: string): string => {
  return `${STORAGE_KEY_PREFIX}${model}`;
};

/**
 * 从 sessionStorage 读取表单状态
 * Load form state from sessionStorage
 */
const loadFormState = (model: string): FormStateData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const key = getStorageKey(model);
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('[FormPersistence] Failed to load form state:', error);
    return null;
  }
};

/**
 * 保存表单状态到 sessionStorage
 * Save form state to sessionStorage
 */
const saveFormState = (model: string, state: FormStateData): void => {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(model);
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('[FormPersistence] Failed to save form state:', error);
  }
};

/**
 * 清除特定模型的表单状态
 * Clear form state for specific model
 */
const clearFormState = (model: string): void => {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(model);
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('[FormPersistence] Failed to clear form state:', error);
  }
};

/**
 * Hook: 管理单个表单字段的持久化
 * Hook for managing persistence of a single form field
 *
 * @param model 当前模型名称 Current model name
 * @param fieldName 字段名称 Field name
 * @param defaultValue 默认值 Default value
 * @returns [currentValue, setValue, saveToStorage]
 */
export const usePersistentFormField = <T,>(
  model: string,
  fieldName: string,
  defaultValue: T
): [T, (value: T) => void, () => void] => {
  const [value, setValue] = useState<T>(() => {
    // 优先使用已保存的状态
    const savedState = loadFormState(model);
    return savedState?.[fieldName] ?? defaultValue;
  });

  const saveField = useCallback(() => {
    const currentState = loadFormState(model) || {};
    saveFormState(model, {
      ...currentState,
      [fieldName]: value,
    });
  }, [model, fieldName, value]);

  return [value, setValue, saveField];
};

/**
 * Hook: 管理整个表单状态的持久化
 * Hook for managing persistence of entire form state
 *
 * @param model 当前模型名称 Current model name
 * @param initialState 初始状态 Initial state
 * @returns { state, setState, saveFormState, loadFormState, clearFormState }
 */
export const usePersistentFormState = (
  model: string,
  initialState: FormStateData
) => {
  const [state, setState] = useState<FormStateData>(() => {
    // 如果已保存过该模型的状态，则加载；否则使用初始状态
    const savedState = loadFormState(model);
    return savedState ? { ...initialState, ...savedState } : initialState;
  });

  // 当模型变化时，加载对应模型的状态
  // 仅在 model 变化时执行，不依赖 initialState（它每次都是新对象）
  useEffect(() => {
    const savedState = loadFormState(model);
    if (savedState) {
      setState((prev) => ({ ...prev, ...savedState }));
    }
  }, [model]);

  const updateState = useCallback((updates: Partial<FormStateData>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const persistFormState = useCallback(() => {
    saveFormState(model, state);
  }, [model, state]);

  const clearState = useCallback(() => {
    clearFormState(model);
    setState(initialState);
  }, [model, initialState]);

  return {
    state,
    updateState,
    persistFormState,
    clearState,
    // 提供手动加载和清除所有模型状态的方法
    loadSavedState: () => loadFormState(model),
  };
};

/**
 * Hook: 自动保存表单状态（当表单变化时）
 * Hook for auto-saving form state when it changes
 *
 * @param model 当前模型名称 Current model name
 * @param formState 表单状态 Form state
 * @param debounceMs 防抖延迟时间 Debounce delay in ms
 */
export const useAutoSaveFormState = (
  model: string,
  formState: FormStateData,
  debounceMs: number = 500
) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      saveFormState(model, formState);
      console.log('[FormPersistence] Form state auto-saved for model:', model);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [model, formState, debounceMs]);
};

/**
 * 清除所有保存的表单状态（用于登出等场景）
 * Clear all saved form states (for logout scenarios)
 */
export const clearAllFormStates = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
    console.log('[FormPersistence] All form states cleared');
  } catch (error) {
    console.error('[FormPersistence] Failed to clear all form states:', error);
  }
};
