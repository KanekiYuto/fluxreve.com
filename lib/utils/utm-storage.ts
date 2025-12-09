/**
 * 客户端 UTM 参数存储工具
 * 在用户访问时捕获 UTM 参数并存储到 localStorage
 */

const UTM_STORAGE_KEY = 'fluxreve_utm_params';
const UTM_EXPIRY_DAYS = 30; // UTM 参数有效期 30 天

export interface StoredUtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  timestamp: number;
}

/**
 * 从 URL 中捕获并存储 UTM 参数
 * 在 layout 或页面组件中调用
 */
export function captureUtmParams(): void {
  if (typeof window === 'undefined') return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams: Partial<StoredUtmParams> = {};

    // 提取所有 UTM 参数
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmContent = urlParams.get('utm_content');
    const utmTerm = urlParams.get('utm_term');

    // 如果有任何 UTM 参数，则存储
    if (utmSource || utmMedium || utmCampaign || utmContent || utmTerm) {
      if (utmSource) utmParams.utmSource = utmSource;
      if (utmMedium) utmParams.utmMedium = utmMedium;
      if (utmCampaign) utmParams.utmCampaign = utmCampaign;
      if (utmContent) utmParams.utmContent = utmContent;
      if (utmTerm) utmParams.utmTerm = utmTerm;

      const storedData: StoredUtmParams = {
        ...utmParams,
        timestamp: Date.now(),
      };

      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(storedData));
      console.log('[UTM Storage] Captured UTM params:', utmParams);
    }
  } catch (error) {
    console.error('[UTM Storage] Failed to capture UTM params:', error);
  }
}

/**
 * 获取存储的 UTM 参数
 * 如果超过有效期则返回 null
 */
export function getStoredUtmParams(): Partial<StoredUtmParams> | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return null;

    const data: StoredUtmParams = JSON.parse(stored);
    const expiryTime = UTM_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - data.timestamp > expiryTime;

    if (isExpired) {
      localStorage.removeItem(UTM_STORAGE_KEY);
      return null;
    }

    // 返回参数（不包含 timestamp）
    const { timestamp, ...params } = data;
    return params;
  } catch (error) {
    console.error('[UTM Storage] Failed to get stored UTM params:', error);
    return null;
  }
}

/**
 * 清除存储的 UTM 参数
 */
export function clearStoredUtmParams(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(UTM_STORAGE_KEY);
    console.log('[UTM Storage] Cleared UTM params');
  } catch (error) {
    console.error('[UTM Storage] Failed to clear UTM params:', error);
  }
}

/**
 * 将 UTM 参数附加到 URL
 * 用于在注册/登录请求中传递 UTM 参数
 */
export function appendUtmToUrl(url: string): string {
  const params = getStoredUtmParams();
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  try {
    const urlObj = new URL(url, window.location.origin);

    if (params.utmSource) urlObj.searchParams.set('utm_source', params.utmSource);
    if (params.utmMedium) urlObj.searchParams.set('utm_medium', params.utmMedium);
    if (params.utmCampaign) urlObj.searchParams.set('utm_campaign', params.utmCampaign);
    if (params.utmContent) urlObj.searchParams.set('utm_content', params.utmContent);
    if (params.utmTerm) urlObj.searchParams.set('utm_term', params.utmTerm);

    return urlObj.toString();
  } catch (error) {
    console.error('[UTM Storage] Failed to append UTM to URL:', error);
    return url;
  }
}
