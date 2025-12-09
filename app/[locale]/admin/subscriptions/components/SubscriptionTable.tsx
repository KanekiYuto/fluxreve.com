import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronDown, Check, X } from 'lucide-react';

type StatusFilter = 'active' | 'canceled' | 'expired';

interface SubscriptionData {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
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

interface SubscriptionTableProps {
  subscriptions: SubscriptionData[];
  isLoading: boolean;
  onRefresh: () => void;
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'active', label: '活跃' },
  { value: 'canceled', label: '已取消' },
  { value: 'expired', label: '已过期' },
];

export default function SubscriptionTable({
  subscriptions,
  isLoading,
  onRefresh,
}: SubscriptionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 切换状态选择
  const toggleStatus = (status: StatusFilter) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  // 过滤订阅
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.paymentSubscriptionId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(sub.status as StatusFilter);

    return matchesSearch && matchesStatus;
  });

  // 状态徽章样式
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string; icon: string }> = {
      active: {
        text: '活跃',
        className: 'bg-green-500/15 text-green-400 border-green-500/30 shadow-sm shadow-green-500/10',
        icon: '●'
      },
      canceled: {
        text: '已取消',
        className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 shadow-sm shadow-yellow-500/10',
        icon: '◐'
      },
      expired: {
        text: '已过期',
        className: 'bg-gray-500/15 text-gray-400 border-gray-500/30 shadow-sm shadow-gray-500/10',
        icon: '○'
      },
    };

    const statusInfo = statusMap[status] || {
      text: status,
      className: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
      icon: '○'
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${statusInfo.className}`}>
        <span className="text-[10px]">{statusInfo.icon}</span>
        {statusInfo.text}
      </span>
    );
  };

  // 计划类型文本
  const getPlanTypeText = (planType: string) => {
    const planMap: Record<string, string> = {
      monthly_basic: '基础版 - 月付',
      yearly_basic: '基础版 - 年付',
      monthly_pro: '专业版 - 月付',
      yearly_pro: '专业版 - 年付',
    };

    return planMap[planType] || planType;
  };

  if (isLoading) {
    return (
      <div className="bg-bg-elevated/50 border border-border/50 rounded-xl overflow-hidden shadow-sm animate-pulse">
        {/* 工具栏骨架屏 */}
        <div className="p-6 border-b border-border/50">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="h-10 bg-white/5 rounded-lg" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-[140px] bg-white/5 rounded-lg" />
              <div className="h-10 w-[100px] bg-white/5 rounded-lg" />
            </div>
          </div>
        </div>

        {/* 表格骨架屏 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 w-16 bg-white/5 rounded" />
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 w-16 bg-white/5 rounded" />
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 w-16 bg-white/5 rounded" />
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 w-16 bg-white/5 rounded" />
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 w-20 bg-white/5 rounded" />
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 w-20 bg-white/5 rounded" />
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 w-16 bg-white/5 rounded" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-white/5 rounded" />
                      <div className="h-3 w-32 bg-white/5 rounded" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 bg-white/5 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-20 bg-white/5 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-white/5 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-white/5 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-white/5 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 bg-white/5 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 底部骨架屏 */}
        <div className="px-6 py-4 border-t border-border/50">
          <div className="h-4 w-40 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-bg-elevated to-bg-subtle border border-border/50 rounded-xl overflow-hidden shadow-sm">
      {/* 工具栏 */}
      <div className="p-6 border-b border-border/50 bg-bg-elevated/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="搜索用户邮箱、用户名或订阅 ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-base/50 border border-border/50 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary focus:bg-bg-base transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* 状态筛选下拉菜单 - 多选 */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between gap-2 min-w-[140px] px-4 py-2.5 text-sm rounded-lg bg-bg-base/50 border border-border/50 hover:border-border hover:bg-bg-base active:border-primary/50 transition-all cursor-pointer"
              >
                <span className={statusFilter.length === 0 ? 'text-text-muted' : 'text-white'}>
                  {statusFilter.length === 0
                    ? '全部状态'
                    : statusFilter.length === 1
                    ? statusOptions.find((opt) => opt.value === statusFilter[0])?.label
                    : `已选 ${statusFilter.length} 项`}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {statusFilter.length > 0 && (
                    <span
                      role="button"
                      tabIndex={0}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setStatusFilter([]);
                      }}
                      className="p-1 hover:bg-bg-hover active:bg-bg-hover rounded-md -mr-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-text-muted" />
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* 下拉选项 - 多选模式 */}
              {isDropdownOpen && (
                <div className="absolute z-50 top-full right-0 mt-2 py-1.5 bg-bg-elevated border border-border/50 rounded-xl shadow-xl shadow-black/20 min-w-full backdrop-blur-sm">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleStatus(option.value)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left hover:bg-bg-hover active:bg-bg-hover transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        statusFilter.includes(option.value)
                          ? 'bg-primary border-primary'
                          : 'border-border'
                      }`}>
                        {statusFilter.includes(option.value) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`${statusFilter.includes(option.value) ? 'text-white font-medium' : 'text-text-muted'}`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onRefresh}
              className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md hover:shadow-primary/20 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              刷新
            </button>
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-subtle/30 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                用户
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                计划
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                金额
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                开始时间
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                下次计费
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-12 h-12 text-text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-text-muted">
                      {searchTerm || statusFilter.length > 0 ? '没有找到匹配的订阅' : '暂无订阅数据'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="group hover:bg-bg-subtle/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                        {subscription.userName || '未设置'}
                      </span>
                      <span className="text-xs text-text-muted">{subscription.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium">{getPlanTypeText(subscription.planType)}</span>
                      {subscription.nextPlanType && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          {getPlanTypeText(subscription.nextPlanType)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(subscription.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-white">
                      {subscription.currency} {subscription.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-text-muted font-mono">
                      {format(new Date(subscription.startedAt), 'yyyy-MM-dd')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-text-muted font-mono">
                      {subscription.nextBillingAt
                        ? format(new Date(subscription.nextBillingAt), 'yyyy-MM-dd')
                        : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-sm text-primary hover:text-primary-hover transition-all cursor-pointer font-medium hover:underline underline-offset-2"
                      onClick={() => {
                        // TODO: 实现查看详情功能
                        alert(`查看订阅详情: ${subscription.id}`);
                      }}
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {filteredSubscriptions.length > 0 && (
        <div className="px-6 py-4 border-t border-border/50 bg-bg-elevated/50 backdrop-blur-sm flex items-center justify-between">
          <p className="text-sm text-text-muted font-medium">
            显示 <span className="text-white font-semibold">{filteredSubscriptions.length}</span> 条，共 <span className="text-white font-semibold">{subscriptions.length}</span> 条订阅
          </p>
        </div>
      )}
    </div>
  );
}
