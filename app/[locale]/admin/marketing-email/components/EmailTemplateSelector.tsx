'use client';

import { useState, useRef, useEffect } from 'react';
import { EmailTemplate } from '@/lib/mail/templates';

interface EmailTemplateSelectorProps {
  templates: EmailTemplate[];
  selectedTemplateId?: string;
  onSelectTemplate: (template: EmailTemplate) => void;
}

const categoryLabels: Record<EmailTemplate['category'], string> = {
  promotion: '邀请推广',
  announcement: '功能公告',
  welcome: '欢迎邮件',
  feature: '功能推介',
  event: '活动推广',
};

const categoryColors: Record<EmailTemplate['category'], { bg: string; border: string; text: string }> = {
  promotion: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
  announcement: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  welcome: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  feature: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  event: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
};

export default function EmailTemplateSelector({
  templates,
  selectedTemplateId,
  onSelectTemplate,
}: EmailTemplateSelectorProps) {
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [iframeHeight, setIframeHeight] = useState(500);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 处理 iframe 高度自适应
  useEffect(() => {
    if (!iframeRef.current) return;

    const handleLoad = () => {
      try {
        const iframeDoc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
        if (iframeDoc) {
          const height = iframeDoc.documentElement.scrollHeight;
          setIframeHeight(Math.max(height, 400));
        }
      } catch (error) {
        console.log('Cannot access iframe height:', error);
        setIframeHeight(500);
      }
    };

    const iframe = iframeRef.current;
    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [previewTemplateId]);

  // 按分类分组模板
  const groupedTemplates = templates.reduce(
    (acc, template) => {
      const category = template.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    },
    {} as Record<string, EmailTemplate[]>
  );

  const categoryOrder: EmailTemplate['category'][] = [
    'promotion',
    'announcement',
    'welcome',
    'feature',
    'event',
  ];

  // 分类图标
  const categoryIcons: Record<EmailTemplate['category'], string> = {
    promotion: '🎁',
    announcement: '📢',
    welcome: '👋',
    feature: '✨',
    event: '🚀',
  };

  // 获取预览模板
  const previewTemplate = previewTemplateId ? templates.find(t => t.id === previewTemplateId) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 左侧：模板列表 */}
      <div className="lg:col-span-1">
        <div className="space-y-6">
          <div className="bg-bg-elevated border border-border rounded-lg p-4">
            <p className="text-sm text-text-muted flex items-center gap-2">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              点击卡片预览邮件效果
            </p>
          </div>

      {categoryOrder.map((category) => {
        const categoryTemplates = groupedTemplates[category];
        if (!categoryTemplates || categoryTemplates.length === 0) return null;

        const colors = categoryColors[category];
        const icon = categoryIcons[category];

        return (
          <div key={category}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.bg} ${colors.text} flex items-center gap-1`}>
                <span>{icon}</span>
                {categoryLabels[category]}
              </div>
              <div className="h-px bg-border flex-1"></div>
            </div>

            <div className="space-y-4">
              {categoryTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setPreviewTemplateId(template.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    previewTemplateId === template.id
                      ? 'border-primary bg-primary/10'
                      : selectedTemplateId === template.id
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-border bg-bg-elevated hover:border-primary/50 hover:bg-bg-elevated/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white line-clamp-1">
                        {template.name}
                      </h4>
                      <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {selectedTemplateId === template.id && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {previewTemplateId === template.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 12c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
        </div>
      </div>

      {/* 右侧：预览区域 */}
      <div className="lg:col-span-2">
        {previewTemplate ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                邮件预览
              </h3>
            </div>

            {/* 邮件预览 - 显示 HTML 版本 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-border">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-2">FROM: FluxReve &lt;support@fluxreve.com&gt;</p>
                <p className="text-xs text-gray-600 font-semibold mb-2">TO: user@example.com (以及其他收件人)</p>
                <p className="text-sm font-semibold text-gray-900 break-words">
                  {previewTemplate.subject}
                </p>
              </div>

              <div className="p-0 bg-white rounded-lg overflow-y-auto" style={{ maxHeight: '600px' }}>
                <iframe
                  ref={iframeRef}
                  className="w-full border-0"
                  style={{
                    height: `${iframeHeight}px`,
                    display: 'block',
                  }}
                  srcDoc={previewTemplate.html}
                  title="Email HTML Preview"
                  sandbox="allow-same-origin"
                  scrolling="auto"
                />
              </div>
            </div>

            {/* 选择按钮 */}
            <button
              onClick={() => onSelectTemplate(previewTemplate)}
              disabled={selectedTemplateId === previewTemplate.id}
              className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                selectedTemplateId === previewTemplate.id
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow-md hover:shadow-primary/20'
              }`}
            >
              {selectedTemplateId === previewTemplate.id ? '✓ 已选择此模板' : '选择此模板'}
            </button>
          </div>
        ) : (
          <div className="bg-bg-elevated border-2 border-dashed border-border rounded-xl p-8 text-center h-full flex items-center justify-center">
            <div>
              <svg className="w-16 h-16 mx-auto text-text-muted/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="text-text-muted font-medium">选择一个模板预览效果</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
