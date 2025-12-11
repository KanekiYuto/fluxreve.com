'use client';

import { useEffect } from 'react';
import {
  extractUtmParams,
  saveUtmParamsToCookie,
  getUtmParamsFromCookie,
  clearUtmParamsCookie,
  type UtmParams,
} from '@/lib/utils/user-tracking';

interface UseMarketingTrackingOptions {
  // 是否保存到 Cookie（默认 true）
  saveToCookie?: boolean;
  // Cookie 有效期（天数，默认 7）
  cookieExpireDays?: number;
  // 调试模式
  debug?: boolean;
}

/**
 * 捕获和管理 UTM 参数的 Hook
 * - 在页面加载时自动捕获 URL 中的 UTM 参数
 * - 支持 Cookie 存储（用于未登录用户）
 * - 提供参数获取和清除函数
 *
 * 使用示例：
 * ```typescript
 * const { getUtmParams, clearParams } = useMarketingTracking({
 *   saveToCookie: true,
 *   debug: true,
 * });
 *
 * const params = getUtmParams();
 * console.log(params); // { utmSource: 'google', utmMedium: 'cpc', ... }
 * ```
 */
export function useMarketingTracking(options: UseMarketingTrackingOptions = {}) {
  const {
    saveToCookie = true,
    cookieExpireDays = 7,
    debug = false,
  } = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 从 URL 提取 UTM 参数
    const searchParams = new URLSearchParams(window.location.search);
    const params = extractUtmParams(searchParams);

    // 检查是否有 UTM 参数
    const hasUtmParams = Object.values(params).some(v => v !== undefined);

    if (debug) {
      console.log('[Marketing Tracking] URL params:', params);
      console.log('[Marketing Tracking] Has UTM params:', hasUtmParams);
    }

    // 如果有 UTM 参数且启用了 Cookie 存储
    if (saveToCookie && hasUtmParams) {
      saveUtmParamsToCookie(params, cookieExpireDays);
      if (debug) {
        console.log('[Marketing Tracking] Saved to cookie:', params);
      }
    }
  }, [saveToCookie, cookieExpireDays, debug]);

  /**
   * 获取 UTM 参数（优先从 URL，其次从 Cookie）
   */
  const getUtmParams = (): UtmParams | null => {
    if (typeof window === 'undefined') return null;

    const searchParams = new URLSearchParams(window.location.search);
    const urlParams = extractUtmParams(searchParams);

    // 如果 URL 中有参数，优先使用 URL 中的
    const hasUrlParams = Object.values(urlParams).some(v => v !== undefined);
    if (hasUrlParams) {
      return urlParams;
    }

    // 否则从 Cookie 读取
    return getUtmParamsFromCookie();
  };

  /**
   * 清除存储的 UTM 参数
   */
  const clearParams = (): void => {
    clearUtmParamsCookie();
    if (debug) {
      console.log('[Marketing Tracking] Cleared params');
    }
  };

  return {
    getUtmParams,
    clearParams,
  };
}
