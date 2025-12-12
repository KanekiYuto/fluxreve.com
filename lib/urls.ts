/**
 * 获取站点 URL（用于公开访问）
 * 在服务器端和客户端都可以使用
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || '';
}

/**
 * 获取 Webhook URL（用于接收回调）
 * 通常在服务器端使用
 */
export function getWebhookUrl(): string {
  return process.env.NEXT_PUBLIC_WEBHOOK_URL || '';
}

/**
 * 生成带 UTM 参数的分享链接
 * 用于追踪分享来源和效果
 *
 * @param baseUrl 基础 URL
 * @param source 分享来源（如：'link'、'twitter'、'download-card' 等）
 * @param model 可选的 AI 模型名称
 * @returns 带 UTM 参数的完整 URL
 */
export function generateShareUrlWithUtm(
  baseUrl: string,
  source: string = 'share-link',
  model?: string
): string {
  const url = new URL(baseUrl);

  // 添加 UTM 参数
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', 'share');
  url.searchParams.set('utm_campaign', 'share-link');

  if (model) {
    url.searchParams.set('utm_content', model);
  }

  return url.toString();
}
