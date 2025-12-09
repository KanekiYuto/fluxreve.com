'use client';

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { pricingTiers, type SubscriptionPlanType } from '@/config/pricing';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
}: AddSubscriptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 从配置中获取付费订阅方案（排除免费版）
  const availablePlans = useMemo(() => {
    return pricingTiers.filter(
      tier => tier.planType !== 'free' && tier.subscriptionPlanType
    );
  }, []);

  // 获取方案的显示名称
  const getPlanLabel = (tier: typeof availablePlans[0]) => {
    const planName = tier.planType === 'basic' ? '基础版' : '专业版';
    const cycle = tier.billingCycle === 'monthly' ? '月付' : '年付';
    return `${planName} - ${cycle} ($${tier.price})`;
  };

  // 表单状态
  const [formData, setFormData] = useState({
    userEmail: '',
    planType: availablePlans[0]?.subscriptionPlanType || 'monthly_basic',
    paymentPlatform: 'manual',
    amount: availablePlans[0]?.price.toString() || '',
    currency: 'USD',
    status: 'active',
  });

  // 禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 点击遮罩层关闭
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // 关闭并重置表单
  const handleClose = () => {
    setFormData({
      userEmail: '',
      planType: availablePlans[0]?.subscriptionPlanType || 'monthly_basic',
      paymentPlatform: 'manual',
      amount: availablePlans[0]?.price.toString() || '',
      currency: 'USD',
      status: 'active',
    });
    setError(null);
    onClose();
  };

  // 当选择的计划改变时，自动更新金额
  const handlePlanChange = (value: string) => {
    const selectedTier = availablePlans.find(tier => tier.subscriptionPlanType === value);
    setFormData({
      ...formData,
      planType: value as SubscriptionPlanType,
      amount: selectedTier?.price.toString() || formData.amount,
    });
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: formData.userEmail,
          planType: formData.planType,
          paymentPlatform: formData.paymentPlatform,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          status: formData.status,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create subscription');
      }

      // 成功后关闭并刷新列表
      handleClose();
      onSuccess();
    } catch (err) {
      console.error('Failed to create subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-bg-elevated to-bg-subtle border border-border/50 rounded-2xl shadow-2xl shadow-black/40 max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-bg-elevated/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-hover rounded-full" />
            <h2 className="text-2xl font-bold text-white">添加订阅</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isSubmitting}
            className="hover:bg-bg-hover"
          >
            <X className="w-5 h-5 text-text-muted" />
          </Button>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 错误提示 */}
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl p-4 shadow-sm shadow-red-500/10">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-red-400 text-sm font-semibold">错误</p>
                  <p className="text-red-300/80 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户邮箱 */}
            <div className="space-y-2">
              <Label htmlFor="userEmail" className="text-white font-semibold">
                用户邮箱 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="userEmail"
                type="email"
                required
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                placeholder="user@example.com"
                className="h-11 bg-bg-base/50 border-border/50 text-white placeholder-text-muted"
                disabled={isSubmitting}
              />
              <p className="text-xs text-text-muted">输入现有用户的邮箱地址</p>
            </div>

            {/* 订阅计划 */}
            <div className="space-y-2">
              <Label htmlFor="planType" className="text-white font-semibold">
                订阅计划 <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.planType}
                onValueChange={handlePlanChange}
                disabled={isSubmitting}
              >
                <SelectTrigger id="planType" className="w-full !h-11 bg-bg-base/50 border-border/50 text-white hover:bg-bg-base focus:border-primary">
                  <SelectValue placeholder="选择订阅计划" />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border/50">
                  {availablePlans.map((tier) => (
                    <SelectItem
                      key={tier.subscriptionPlanType}
                      value={tier.subscriptionPlanType!}
                      className="text-white hover:bg-bg-hover focus:bg-bg-hover cursor-pointer"
                    >
                      {getPlanLabel(tier)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-text-muted">订阅价格和时长由所选计划自动确定</p>
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-sm text-blue-300/90">
                  <p className="font-semibold mb-1">注意事项</p>
                  <ul className="space-y-1 text-blue-300/70">
                    <li>• 用户必须已在系统中注册</li>
                    <li>• 订阅价格和时长由所选计划自动确定</li>
                    <li>• 订阅状态默认为&ldquo;活跃&rdquo;，将立即生效</li>
                    <li>• 支付平台默认为&ldquo;手动创建&rdquo;，需人工管理</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50 bg-bg-elevated/50 backdrop-blur-sm">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="bg-bg-base/50 hover:bg-bg-base border-border/50 text-white"
          >
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-hover shadow-sm hover:shadow-md hover:shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                创建中...
              </>
            ) : (
              '创建订阅'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
