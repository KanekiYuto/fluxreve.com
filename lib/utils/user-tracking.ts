/**
 * 用户追踪工具函数
 * 用于获取用户的 IP 地址、国家和 UTM 参数
 */

/**
 * 从请求头中获取客户端真实 IP 地址
 * 优先级：x-real-ip > x-forwarded-for > 直连 IP
 */
export function getClientIp(headers: Headers): string | null {
  // 1. 检查 x-real-ip (Nginx/Cloudflare 常用)
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // 2. 检查 x-forwarded-for (代理链)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for 可能包含多个 IP，取第一个（真实客户端 IP）
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    if (ips[0]) {
      return ips[0];
    }
  }

  // 3. 检查 CF-Connecting-IP (Cloudflare 专用)
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  // 4. 检查其他常见代理头
  const trueClientIp = headers.get('true-client-ip');
  if (trueClientIp) {
    return trueClientIp;
  }

  // 无法获取 IP
  return null;
}

/**
 * 根据 IP 地址获取国家代码
 * 使用 Cloudflare 的地理位置信息（如果可用）
 * 否则返回 null，可以后续通过外部 API 查询
 */
export function getCountryFromHeaders(headers: Headers): string | null {
  // Cloudflare 会自动添加国家代码
  const cfCountry = headers.get('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX') {
    return cfCountry.toUpperCase();
  }

  // Vercel 也提供地理位置信息
  const vercelCountry = headers.get('x-vercel-ip-country');
  if (vercelCountry) {
    return vercelCountry.toUpperCase();
  }

  return null;
}

/**
 * 从 IP 地址获取国家代码（使用免费的 IP 地理位置 API）
 * 注意：此函数会发起网络请求，建议在后台任务中使用
 */
export async function getCountryFromIp(ip: string): Promise<string | null> {
  try {
    // 使用免费的 ip-api.com 服务
    // 限制：每分钟 45 次请求（免费版）
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      signal: AbortSignal.timeout(5000), // 5 秒超时
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.countryCode || null;
  } catch (error) {
    console.error('Failed to get country from IP:', error);
    return null;
  }
}

/**
 * UTM 参数接口
 */
export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

/**
 * 从 URL 搜索参数中提取 UTM 参数
 */
export function extractUtmParams(searchParams: URLSearchParams): UtmParams {
  return {
    utmSource: searchParams.get('utm_source') || undefined,
    utmMedium: searchParams.get('utm_medium') || undefined,
    utmCampaign: searchParams.get('utm_campaign') || undefined,
    utmContent: searchParams.get('utm_content') || undefined,
    utmTerm: searchParams.get('utm_term') || undefined,
  };
}

/**
 * 从请求 URL 中提取 UTM 参数
 */
export function extractUtmParamsFromUrl(url: string): UtmParams {
  try {
    const urlObj = new URL(url);
    return extractUtmParams(urlObj.searchParams);
  } catch (error) {
    console.error('Failed to parse URL for UTM params:', error);
    return {};
  }
}

/**
 * 用户追踪数据接口
 */
export interface UserTrackingData {
  ip: string | null;
  country: string | null;
  utmParams: UtmParams;
}

/**
 * 从请求中提取完整的用户追踪数据
 */
export function extractUserTrackingData(
  headers: Headers,
  url: string
): UserTrackingData {
  const ip = getClientIp(headers);
  const country = getCountryFromHeaders(headers);
  const utmParams = extractUtmParamsFromUrl(url);

  return {
    ip,
    country,
    utmParams,
  };
}

/**
 * Cookie 相关操作函数（仅客户端）
 */

/**
 * 将 UTM 参数保存到 Cookie
 * @param params - UTM 参数对象
 * @param expireDays - Cookie 有效期（天数，默认 7）
 */
export function saveUtmParamsToCookie(params: UtmParams, expireDays = 7): void {
  if (typeof document === 'undefined') return;

  const data = JSON.stringify(params);
  const expires = new Date();
  expires.setTime(expires.getTime() + expireDays * 24 * 60 * 60 * 1000);

  document.cookie = `utm_params=${encodeURIComponent(data)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * 从 Cookie 中读取 UTM 参数
 */
export function getUtmParamsFromCookie(): UtmParams | null {
  if (typeof document === 'undefined') return null;

  const matches = document.cookie.match(/(?:^|; )utm_params=([^;]*)/);
  if (!matches) return null;

  try {
    return JSON.parse(decodeURIComponent(matches[1]));
  } catch {
    return null;
  }
}

/**
 * 清除 Cookie 中的 UTM 参数
 */
export function clearUtmParamsCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'utm_params=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
}
