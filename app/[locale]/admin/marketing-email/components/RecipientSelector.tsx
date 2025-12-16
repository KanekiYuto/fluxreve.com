'use client';

import { ChangeEvent, useEffect, useState } from 'react';

interface RecipientSelectorProps {
  formData: {
    recipientType: 'database' | 'custom';
    recipients: string[];
  };
  onChange: (key: string, value: any) => void;
  onRecipientCountChange: (count: number) => void;
}

export default function RecipientSelector({
  formData,
  onChange,
  onRecipientCountChange,
}: RecipientSelectorProps) {
  const [recipientInput, setRecipientInput] = useState('');
  const [estimatedCount, setEstimatedCount] = useState(0);
  const [databaseCount, setDatabaseCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // 获取数据库中的收件人总数
  useEffect(() => {
    const fetchDatabaseCount = async () => {
      try {
        setIsLoadingCount(true);
        const response = await fetch('/api/admin/marketing-email/recipients-count');
        if (response.ok) {
          const data = await response.json();
          console.log('Recipient count response:', data);
          setDatabaseCount(data.count || 0);
        } else {
          console.error('Failed to fetch recipient count. Status:', response.status);
          const errorData = await response.json();
          console.error('Error data:', errorData);
          setDatabaseCount(0);
        }
      } catch (error) {
        console.error('Failed to fetch recipient count:', error);
        setDatabaseCount(0);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchDatabaseCount();
  }, []);

  // 更新预计发送数量
  useEffect(() => {
    if (formData.recipientType === 'database') {
      setEstimatedCount(databaseCount);
    } else if (formData.recipientType === 'custom') {
      setEstimatedCount(formData.recipients.length);
    }
    onRecipientCountChange(estimatedCount);
  }, [formData.recipientType, formData.recipients, estimatedCount, databaseCount, onRecipientCountChange]);

  const handleRecipientTypeChange = (type: 'database' | 'custom') => {
    onChange('recipientType', type);
    if (type === 'database') {
      // 切换到数据库模式时，清空自定义收件人
      onChange('recipients', []);
    }
  };

  const handleAddRecipient = () => {
    if (recipientInput.includes('@') && !formData.recipients.includes(recipientInput.toLowerCase())) {
      onChange('recipients', [...formData.recipients, recipientInput.toLowerCase()]);
      setRecipientInput('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    onChange(
      'recipients',
      formData.recipients.filter((r) => r !== email)
    );
  };

  return (
    <div className="space-y-6">
      {/* 收件人类型选择 */}
      <div>
        <label className="block text-sm font-semibold text-white mb-4">
          收件人来源
          <span className="text-red-400 ml-1">*</span>
        </label>

        <div className="space-y-3">
          {/* 数据库收件人 */}
          <label className="flex items-center p-4 bg-bg-elevated border border-border rounded-lg cursor-pointer hover:bg-bg-elevated/80 transition-colors">
            <input
              type="radio"
              name="recipientType"
              value="database"
              checked={formData.recipientType === 'database'}
              onChange={() => handleRecipientTypeChange('database')}
              className="w-4 h-4 text-primary border-border"
            />
            <div className="ml-4">
              <p className="font-medium text-white">数据库邮箱</p>
              <p className="text-xs text-text-muted mt-1">
                从 email_recipient 表发送 {isLoadingCount ? '(加载中...)' : `(${databaseCount} 个邮箱)`}
              </p>
            </div>
          </label>

          {/* 自定义邮箱 */}
          <label className="flex items-center p-4 bg-bg-elevated border border-border rounded-lg cursor-pointer hover:bg-bg-elevated/80 transition-colors">
            <input
              type="radio"
              name="recipientType"
              value="custom"
              checked={formData.recipientType === 'custom'}
              onChange={() => handleRecipientTypeChange('custom')}
              className="w-4 h-4 text-primary border-border"
            />
            <div className="ml-4">
              <p className="font-medium text-white">自定义邮箱</p>
              <p className="text-xs text-text-muted mt-1">
                手动输入邮箱地址 ({formData.recipients.length} 个)
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* 自定义邮箱输入区 */}
      {formData.recipientType === 'custom' && (
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            添加收件人邮箱
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
              placeholder="Enter email address"
              className="flex-1 px-4 py-3 bg-bg-elevated border border-border rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              onClick={handleAddRecipient}
              className="px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-all font-medium active:scale-95"
            >
              添加
            </button>
          </div>

          {/* 已添加的收件人列表 */}
          {formData.recipients.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-text-muted font-semibold">已添加 {formData.recipients.length} 个收件人</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {formData.recipients.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-bg-base px-3 py-2 rounded border border-border/50"
                  >
                    <span className="text-sm text-text-secondary">{email}</span>
                    <button
                      onClick={() => handleRemoveRecipient(email)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}


      {/* 发件人信息提示 */}
      <div className="bg-bg-elevated/50 border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">发件人信息</h3>
        <div className="space-y-2 text-sm text-text-muted">
          <p>
            <span className="text-white font-medium">发件人:</span> noreply@fluxreve.com
          </p>
          <p>
            <span className="text-white font-medium">公司:</span> FluxReve
          </p>
          <p className="text-xs mt-3">
            所有邮件将包含取消订阅链接以符合电子邮件营销法规
          </p>
        </div>
      </div>
    </div>
  );
}
