'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import useUserStore from '@/store/useUserStore';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Copy, TrendingUp } from 'lucide-react';
import LoginRequired from '@/components/common/LoginRequired';

interface VersionInfo {
  version: string;
  releaseDate: string;
}

export default function SettingsPage() {
  const { user } = useUserStore();
  const t = useTranslations('settings');
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: '0.1.0',
    releaseDate: '2025-12-12',
  });

  // 从服务器读取版本信息
  useEffect(() => {
    fetch('/api/version')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVersionInfo({
            version: data.data.version,
            releaseDate: data.data.releaseDate,
          });
        }
      })
      .catch((error) => {
        console.error('[Version] Failed to fetch version info:', error);
      });
  }, []);

  // 未登录状态
  if (!user) {
    return (
      <div className="min-h-screen">
        {/* 页面头部 */}
        <div className="bg-bg-elevated border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              {t('title')}
            </h1>
            <p className="text-sm sm:text-base text-text-muted mt-2">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* 登录提示 */}
        <LoginRequired
          title={t('loginRequired.title')}
          description={t('loginRequired.description')}
          buttonText={t('loginRequired.cta')}
        />
      </div>
    );
  }

  // 已登录状态
  return (
    <div className="min-h-screen bg-bg">
      {/* 页面头部 */}
      <div className="bg-bg-elevated border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base text-text-muted mt-2">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* 设置内容 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl">
        {/* 个人信息设置 */}
        <div className="mb-6 rounded-2xl gradient-border p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">{t('sections.profile.title')}</h2>
          <div className="space-y-4">
            {/* 用户名 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-border gap-3 sm:gap-0">
              <div className="flex-1 min-w-0">
                <Label className="text-white">{t('sections.profile.name')}</Label>
                <p className="text-sm text-text-muted mt-1 truncate">{user.name || t('sections.profile.notSet')}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigator.clipboard.writeText(user.name || '')}
                title={t('actions.copy')}
                className="hover:bg-primary/10 flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {/* 邮箱 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-border gap-3 sm:gap-2">
              <div className="flex-1 min-w-0">
                <Label className="text-white">{t('sections.profile.email')}</Label>
                <p className="text-sm text-text-muted mt-1 truncate">{user.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20 whitespace-nowrap">
                  {t('sections.profile.verified')}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(user.email)}
                  title={t('actions.copy')}
                  className="hover:bg-primary/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 用户类型 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-3 sm:gap-0">
              <div className="flex-1 min-w-0">
                <Label className="text-white">{t('sections.profile.plan')}</Label>
                <p className="text-sm text-text-muted mt-1 capitalize">{user.userType}</p>
              </div>
              <Button asChild className="gradient-bg border-0 hover:brightness-110 w-full sm:w-auto">
                <Link href="/pricing" className="inline-flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t('actions.upgrade')}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 偏好设置 */}
        <div className="mb-6 rounded-2xl gradient-border p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">{t('sections.preferences.title')}</h2>
          <div>
            {/* 通知设置 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-3 sm:gap-0">
              <div className="flex-1 min-w-0">
                <Label className="text-white">{t('sections.preferences.notifications')}</Label>
                <p className="text-sm text-text-muted mt-1">{t('sections.preferences.notificationsDesc')}</p>
              </div>
              <div className="flex-shrink-0">
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </div>

        {/* 第三方账号连接 */}
        <div className="mb-6 rounded-2xl gradient-border p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">{t('sections.connections.title')}</h2>
          <div className="space-y-4">
            {/* Google 账号 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-border gap-3 sm:gap-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Google Icon */}
                <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white fill-current">
                    <title>Google</title>
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="text-white">Google</Label>
                  <p className="text-sm text-text-muted mt-1">
                    {user.email
                      ? t('sections.connections.googleConnected')
                      : t('sections.connections.googleNotConnected')}
                  </p>
                </div>
              </div>
              {user.email && (
                <span className="px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20 whitespace-nowrap flex-shrink-0">
                  {t('sections.connections.connected')}
                </span>
              )}
            </div>

            {/* GitHub 账号 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-3 sm:gap-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* GitHub Icon */}
                <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white fill-current">
                    <title>GitHub</title>
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="text-white">GitHub</Label>
                  <p className="text-sm text-text-muted mt-1">
                    {t('sections.connections.githubNotConnected')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 关于卡片 */}
        <div className="mb-6 rounded-2xl gradient-border p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">{t('about.title')}</h2>
          <div className="space-y-4">
            {/* 版本号 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-border gap-3 sm:gap-0">
              <div className="flex-1">
                <Label className="text-white">{t('about.version')}</Label>
                <p className="text-sm text-text-muted mt-1">v{versionInfo.version}</p>
              </div>
            </div>

            {/* 发布日期 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-3 sm:gap-0">
              <div className="flex-1">
                <Label className="text-white">{t('about.releaseDate')}</Label>
                <p className="text-sm text-text-muted mt-1">{versionInfo.releaseDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
