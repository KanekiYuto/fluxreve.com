'use client';

import { useTranslations } from 'next-intl';
import { LogIn } from 'lucide-react';
import useModalStore from '@/store/useModalStore';

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
}

interface LoginRequiredProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  buttonText?: string;
  features?: FeatureCard[];
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function LoginRequired({
  title,
  description,
  icon,
  buttonText,
  features,
  maxWidth = 'xl',
}: LoginRequiredProps) {
  const t = useTranslations('common.loginRequired');
  const { openLoginModal } = useModalStore();

  // 使用国际化的默认值
  const finalTitle = title || t('title');
  const finalDescription = description || t('description');
  const finalButtonText = buttonText || t('buttonText');

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className={maxWidthClasses[maxWidth] + ' mx-auto text-center'}>
        {/* 主卡片 */}
        <div className="group relative rounded-2xl sm:rounded-3xl gradient-border-colorful bg-gradient-to-br from-primary/10 via-bg-elevated to-bg-elevated transition-all duration-500 mb-12">
          {/* 装饰性背景 */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

          {/* 内容 */}
          <div className="relative p-8 text-center">
            {/* 图标 */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              {icon || (
                <LogIn className="w-10 h-10 text-primary" />
              )}
            </div>

            {/* 标题 */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {finalTitle}
            </h2>

            {/* 描述 */}
            <p className="text-text-muted mb-8 leading-relaxed">
              {finalDescription}
            </p>

            {/* 登录按钮 */}
            <button
              onClick={openLoginModal}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-bg text-white font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50 cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              <span>{finalButtonText}</span>
            </button>
          </div>
        </div>

        {/* 功能卡片列表 */}
        {features && features.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl gradient-border">
                <div className={`w-12 h-12 rounded-lg ${feature.iconBgColor || 'bg-primary/10'} flex items-center justify-center mb-4 mx-auto`}>
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
