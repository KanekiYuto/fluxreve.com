import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotFoundView() {
  const t = useTranslations('task.notFound');

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center max-w-lg">
        {/* 404 图标 */}
        <div className="mb-8 flex justify-center">
          <svg className="w-24 h-24 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* 标题和描述 */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          {t('title')}
        </h1>
        <p className="text-text-muted text-lg mb-10 max-w-md mx-auto leading-relaxed">
          {t('description')}
        </p>

        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('backToHome')}
        </Link>
      </div>
    </div>
  );
}
