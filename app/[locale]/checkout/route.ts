import { Checkout } from '@creem_io/nextjs';

export const GET = Checkout({
  apiKey: process.env.CREEM_API_KEY!,
  testMode: process.env.NODE_ENV !== 'production', // 开发环境使用测试模式,生产环境使用正式模式
  defaultSuccessUrl: '/subscription/success', // 默认成功跳转页面
});
