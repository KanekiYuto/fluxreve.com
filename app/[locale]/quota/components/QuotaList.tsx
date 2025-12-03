'use client';

import QuotaCard from './QuotaCard';
import QuotaEmptyState from './QuotaEmptyState';

interface QuotaItem {
  id: string;
  type: string;
  amount: number;
  consumed: number;
  available: number;
  issuedAt: Date;
  expiresAt: Date | null;
}

interface QuotaListProps {
  quotas: QuotaItem[];
  type: 'active' | 'expired';
}

export default function QuotaList({ quotas, type }: QuotaListProps) {
  if (quotas.length === 0) {
    return <QuotaEmptyState type={type} />;
  }

  return (
    <div className="grid gap-4">
      {quotas.map((quota) => (
        <QuotaCard key={quota.id} quota={quota} />
      ))}
    </div>
  );
}
