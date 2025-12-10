import { Webhook } from '@creem_io/nextjs';
import { handleCheckoutCompleted } from '@/lib/creem/handle-checkout-completed';
import { handleSubscriptionActive } from '@/lib/creem/handle-subscription-active';
import { handleSubscriptionPaid } from '@/lib/creem/handle-subscription-paid';
import { handleSubscriptionCanceled } from '@/lib/creem/handle-subscription-canceled';
import { handleSubscriptionExpired } from '@/lib/creem/handle-subscription-expired';
import { handleSubscriptionPaused } from '@/lib/creem/handle-subscription-paused';
import { handleGrantAccess } from '@/lib/creem/handle-grant-access';
import { handleRevokeAccess } from '@/lib/creem/handle-revoke-access';

/**
 * Creem 支付 Webhook 处理器
 *
 * 用于接收和处理 Creem 支付平台的 webhook 事件
 * Webhook URL: /api/creem/webhook
 *
 * 注意事项:
 * 1. 所有回调函数应该是幂等的(可以安全地多次调用)
 * 2. Webhook 可能会重试,因此相同事件可能被触发多次
 * 3. 使用 referenceId 关联用户ID,在 CreemCheckout 组件中传递
 */
export const POST = Webhook({
  // Webhook 密钥,用于验证请求签名
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  /**
   * 支付完成事件
   * 当用户完成一次性支付时触发
   * 将一次性支付作为一个月的订阅来处理
   */
  onCheckoutCompleted: handleCheckoutCompleted,

  /**
   * 订阅激活事件
   * 当订阅首次激活时触发,仅创建订阅记录（积分由 onSubscriptionPaid 发放）
   */
  onSubscriptionActive: handleSubscriptionActive,

  /**
   * 订阅取消事件
   * 当订阅被取消时触发
   */
  onSubscriptionCanceled: handleSubscriptionCanceled,

  /**
   * 订阅过期事件
   * 当订阅过期时触发
   */
  onSubscriptionExpired: handleSubscriptionExpired,

  /**
   * 订阅支付成功事件
   * 当订阅支付成功时触发（首次支付、续费或升级）
   * 根据实际支付金额发放积分
   */
  onSubscriptionPaid: handleSubscriptionPaid,

  /**
   * 订阅暂停事件
   * 当订阅被暂停时触发
   */
  onSubscriptionPaused: handleSubscriptionPaused,

  /**
   * 授予访问权限事件
   * 在以下情况触发:
   * - 订阅激活 (subscription.active)
   * - 订阅试用 (subscription.trialing)
   * - 订阅续费成功 (subscription.paid)
   *
   * 更新用户的订阅状态,授予相应权限
   */
  onGrantAccess: handleGrantAccess,

  /**
   * 撤销访问权限事件
   * 在以下情况触发:
   * - 订阅暂停 (subscription.paused)
   * - 订阅过期 (subscription.expired)
   *
   * 撤销用户权限,将用户降级为免费用户
   */
  onRevokeAccess: handleRevokeAccess,
});
