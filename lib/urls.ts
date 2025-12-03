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
