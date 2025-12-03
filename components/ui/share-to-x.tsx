'use client';

import { useTranslations } from 'next-intl';

type ShareToXProps = {
  text?: string;
  url?: string;
  className?: string;
};

export default function ShareToX({
  text = '推荐一篇好文章',
  url = typeof window !== 'undefined' ? window.location.href : '',
  className = '',
}: ShareToXProps) {
  const t = useTranslations('share.actions');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
  };

  return (
    <button
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      title={t('shareToX')}
      aria-label={t('shareToX')}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      <span className="cursor-pointer">{t('shareToX')}</span>
    </button>
  );
}
