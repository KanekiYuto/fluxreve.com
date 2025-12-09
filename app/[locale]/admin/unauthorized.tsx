import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface UnauthorizedPageProps {
  locale: string;
}

export default async function UnauthorizedPage({ locale }: UnauthorizedPageProps) {
  const t = await getTranslations({ locale, namespace: 'admin.unauthorized' });

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-bg-elevated to-bg-subtle border border-border/50 rounded-2xl p-8 shadow-2xl shadow-black/40">
          {/* 图标 */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-3xl font-bold text-white text-center mb-3">
            {t('title')}
          </h1>

          {/* 描述 */}
          <p className="text-text-muted text-center mb-8">
            {t('description')}
          </p>

          {/* 提示信息 */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
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
                <p className="font-semibold mb-1">{t('helpTitle')}</p>
                <p className="text-blue-300/70">
                  {t('helpDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* 返回按钮 */}
          <Link
            href={`/${locale}/dashboard`}
            className="block w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white text-center rounded-lg transition-all font-medium shadow-sm hover:shadow-md hover:shadow-primary/20"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
