'use client';

import { useState, useCallback } from 'react';
import EmailTemplateSelector from './components/EmailTemplateSelector';
import RecipientSelector from './components/RecipientSelector';
import { getAvailableTemplates } from '@/lib/mail/templates';

interface EmailFormData {
  subject: string;
  content: string;
  htmlContent: string;
  recipientType: 'database' | 'custom';
  recipients: string[];
  templateId?: string;
}

export default function MarketingEmailPage() {
  const [formData, setFormData] = useState<EmailFormData>({
    subject: '',
    content: '',
    htmlContent: '',
    recipientType: 'database',
    recipients: [],
    templateId: undefined,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  const [sendProgress, setSendProgress] = useState<{ total: number; sent: number; jobId: string; isPaused: boolean } | null>(null);
  const templates = getAvailableTemplates();

  // 发送营销邮件 - 前端循环发送
  const handleSendEmail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      setSendProgress(null);

      // 验证必填字段
      if (!formData.templateId) {
        throw new Error('Please select a template');
      }
      if (formData.recipientType === 'custom' && formData.recipients.length === 0) {
        throw new Error('Please select at least one recipient');
      }

      // 第一步：获取收件人列表
      const prepareResponse = await fetch('/api/admin/marketing-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: formData.subject,
          content: formData.content,
          htmlContent: formData.htmlContent,
          recipientType: formData.recipientType,
          recipients: formData.recipientType === 'custom' ? formData.recipients : undefined,
        }),
      });

      if (!prepareResponse.ok) {
        const errorData = await prepareResponse.json();
        throw new Error(errorData.error || 'Failed to prepare email');
      }

      const prepareResult = await prepareResponse.json();
      if (!prepareResult.success) {
        throw new Error(prepareResult.error || 'Failed to prepare email');
      }

      const { jobId, recipients, subject, content, htmlContent } = prepareResult.data;

      // 初始化进度
      setSendProgress({
        total: recipients.length,
        sent: 0,
        jobId,
        isPaused: false,
      });
      setSuccess(true);

      // 第二步：逐个发送邮件，每隔 1 秒发送一个
      let sent = 0;
      for (const email of recipients) {
        // 检查是否暂停
        setSendProgress(prev => {
          if (prev?.isPaused) {
            // 如果暂停，停止循环
            throw new Error('Email sending paused');
          }
          return prev;
        });

        try {
          const sendResponse = await fetch('/api/admin/marketing-email/send-one', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: email,
              subject,
              text: content,
              html: htmlContent,
            }),
          });

          if (sendResponse.ok) {
            sent++;
            console.log(`Email sent to ${email} (${sent}/${recipients.length})`);
          } else {
            console.error(`Failed to send email to ${email}`);
          }
        } catch (err) {
          console.error(`Error sending email to ${email}:`, err);
        }

        // 更新进度
        setSendProgress(prev =>
          prev ? { ...prev, sent } : null
        );

        // 等待 1 秒（最后一个邮件除外）
        if (sent < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`Email sending completed: ${sent}/${recipients.length} emails sent`);
      // 发送完成后隐藏进度显示
      setSendProgress(null);
    } catch (error) {
      console.error('Failed to send email:', error);
      if (error instanceof Error && error.message !== 'Email sending paused') {
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary-hover rounded-full" />
          <h1 className="text-4xl font-bold text-white tracking-tight">营销邮件</h1>
        </div>
        <p className="text-text-muted text-base ml-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          发送营销邮件给用户
        </p>
      </div>

      {/* 成功提示 */}
      {success && (
        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-4 mb-6 shadow-sm shadow-green-500/10">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-green-400 text-sm font-semibold">Job Created</p>
              <p className="text-green-300/80 text-sm">Marketing email job has been created and is processing...</p>
            </div>
          </div>
        </div>
      )}

      {/* 发送进度显示 */}
      {sendProgress && (
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6 mb-6 shadow-sm shadow-blue-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-blue-400 text-sm font-semibold">正在发送邮件</p>
              <p className="text-blue-300/80 text-sm">
                任务ID: {sendProgress.jobId}
              </p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-blue-300">
                已处理: <span className="font-semibold">{sendProgress.sent} / {sendProgress.total}</span> 封邮件
              </span>
              <span className="text-xs text-blue-300">
                {sendProgress.total > 0 ? Math.round((sendProgress.sent / sendProgress.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-2 bg-blue-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                style={{
                  width: `${sendProgress.total > 0 ? (sendProgress.sent / sendProgress.total) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>

          <p className="text-xs text-blue-300/70 mt-3">
            邮件每隔1秒发送一个。您可以随时暂停发送。
          </p>

          {/* 暂停/继续按钮 */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() =>
                setSendProgress(prev =>
                  prev ? { ...prev, isPaused: !prev.isPaused } : null
                )
              }
              className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all text-sm font-medium"
            >
              {sendProgress?.isPaused ? '继续' : '暂停'}
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl p-4 mb-6 shadow-sm shadow-red-500/10">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-red-400 text-sm font-semibold">Error</p>
              <p className="text-red-300/80 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区域 - 左右或上下布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：模板选择 */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">1</span>
              选择邮件模板
            </h2>
            <p className="text-text-muted text-sm mt-2">选择一个预设模板，开始发送营销邮件</p>
          </div>
          <EmailTemplateSelector
            templates={templates}
            selectedTemplateId={formData.templateId}
            onSelectTemplate={(template) => {
              setFormData((prev) => ({
                ...prev,
                templateId: template.id,
                subject: template.subject,
                content: template.text,
                htmlContent: template.html,
              }));
            }}
          />
        </div>

        {/* 右侧：收件人选择 */}
        <div className="lg:col-span-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">2</span>
              选择收件人
            </h2>
            <p className="text-text-muted text-sm mt-2">选择发送目标用户</p>
          </div>

          {/* 如果没有选择模板，显示提示 */}
          {!formData.templateId ? (
            <div className="bg-bg-elevated border-2 border-dashed border-border rounded-xl p-6 text-center">
              <svg className="w-12 h-12 mx-auto text-text-muted/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-text-muted text-sm">请先选择一个模板</p>
            </div>
          ) : (
            <RecipientSelector
              formData={formData}
              onChange={(key, value) =>
                setFormData((prev) => ({ ...prev, [key]: value }))
              }
              onRecipientCountChange={setRecipientCount}
            />
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          className="px-5 py-2.5 border border-border text-text-secondary hover:text-white hover:border-border-hover rounded-lg transition-all"
          disabled={isLoading}
        >
          取消
        </button>
        <button
          onClick={handleSendEmail}
          disabled={isLoading || !formData.templateId || (formData.recipientType === 'custom' && formData.recipients.length === 0)}
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              发送中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              发送邮件
            </>
          )}
        </button>
      </div>
    </div>
  );
}
