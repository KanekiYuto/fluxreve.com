import { useState, useEffect } from 'react';
import { ImageItem } from '@/components/ai-generator/form/ImageUpload';

// 将图片 URL 数组转换为 ImageItem 数组
const mapUrlsToImageItems = (urls: string[] | undefined): ImageItem[] => {
  if (!urls || !Array.isArray(urls)) return [];
  return urls.map((url: string, index: number) => ({
    id: `image-${index}`,
    url,
    file: null,
  }));
};

// 处理包含图片的 defaultParameters
export const useImageDefaultParameters = (defaultParameters: any) => {
  const [inputImages, setInputImages] = useState<ImageItem[]>(
    mapUrlsToImageItems(defaultParameters?.images)
  );

  useEffect(() => {
    if (defaultParameters?.images && Array.isArray(defaultParameters.images)) {
      setInputImages(mapUrlsToImageItems(defaultParameters.images));
    }
  }, [defaultParameters]);

  return { inputImages, setInputImages };
};

// 通用表单状态管理 Hook，支持多种参数
export const useGeneratorFormState = (defaultParameters: any, initialState: Record<string, any>) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (defaultParameters) {
      const updates: Record<string, any> = {};

      Object.keys(initialState).forEach((key) => {
        if (defaultParameters[key] !== undefined) {
          updates[key] = defaultParameters[key];
        }
      });

      if (Object.keys(updates).length > 0) {
        setState((prevState) => ({ ...prevState, ...updates }));
      }
    }
  }, [defaultParameters]);

  const updateState = (key: string, value: any) => {
    setState((prevState) => ({ ...prevState, [key]: value }));
  };

  return { state, updateState };
};
