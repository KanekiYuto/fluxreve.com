'use client';

import SubscriptionCard from './SubscriptionCard';

interface SubscriptionRecord {
  id: string;
  paymentPlatform: string;
  paymentSubscriptionId: string;
  paymentCustomerId: string | null;
  planType: string;
  nextPlanType: string | null;
  status: string;
  amount: number;
  currency: string;
  startedAt: Date;
  expiresAt: Date | null;
  nextBillingAt: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
}

interface SubscriptionListProps {
  subscriptions: SubscriptionRecord[];
}

/**
 * 订阅列表组件
 */
export default function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  return (
    <div className="grid gap-4">
      {subscriptions.map((subscription) => (
        <SubscriptionCard key={subscription.id} subscription={subscription} />
      ))}
    </div>
  );
}
