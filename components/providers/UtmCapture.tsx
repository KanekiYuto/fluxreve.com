'use client';

import { useEffect } from 'react';
import { captureUtmParams } from '@/lib/utils/utm-storage';

/**
 * UTM 参数捕获组件
 * 自动从 URL 中捕获 UTM 参数并存储到 localStorage
 */
export default function UtmCapture() {
  useEffect(() => {
    // 捕获 UTM 参数
    captureUtmParams();
  }, []);

  return null; // 不渲染任何内容
}
