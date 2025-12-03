import { Portal } from '@creem_io/nextjs';

/**
 * Creem 客户门户路由
 * 用于用户管理订阅、查看发票、更新支付方式等
 */
export const GET = Portal({
  apiKey: process.env.CREEM_API_KEY!,
  testMode: process.env.NODE_ENV !== 'production',
});
