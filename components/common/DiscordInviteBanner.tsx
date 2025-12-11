'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface DiscordInviteBannerProps {
  className?: string;
  dismissible?: boolean;
}

export default function DiscordInviteBanner({
  className = '',
  dismissible = true,
}: DiscordInviteBannerProps) {
  const t = useTranslations('common.discordBanner');
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`w-full bg-gradient-to-r from-[#5865F2]/15 via-[#5865F2]/10 to-transparent border-b border-[#5865F2]/20 ${className}`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* 左侧：Discord 图标和文字 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Discord 图标 */}
          <svg
            className="w-5 h-5 text-[#5865F2] flex-shrink-0"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.975 14.975 0 0 0 1.293-2.1a.07.07 0 0 0-.038-.098a13.11 13.11 0 0 1-1.872-.892a.072.072 0 0 1-.009-.119c.125-.093.25-.19.371-.287a.075.075 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.075.075 0 0 1 .079.009c.12.098.246.195.371.288a.072.072 0 0 1-.006.119a12.997 12.997 0 0 1-1.873.892a.07.07 0 0 0-.037.099a14.968 14.968 0 0 0 1.293 2.1a.078.078 0 0 0 .084.028a19.963 19.963 0 0 0 6.002-3.03a.079.079 0 0 0 .033-.057c.5-4.761-.838-8.895-3.646-12.66a.08.08 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.964-2.157 2.157-2.157c1.193 0 2.156.964 2.157 2.157c0 1.19-.964 2.156-2.157 2.156zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.964-2.157 2.157-2.157c1.192 0 2.156.964 2.157 2.157c0 1.19-.965 2.156-2.157 2.156z" />
          </svg>

          {/* 文字内容 */}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/90 truncate">
              <span className="font-semibold">{t('title')}</span>
              <span className="text-text-muted"> — {t('description')}</span>
            </p>
          </div>
        </div>

        {/* 右侧：按钮 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://discord.gg/6QynZPsU"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-md bg-[#5865F2] text-white text-sm font-medium transition-all hover:bg-[#4752C4] hover:shadow-md hover:shadow-[#5865F2]/30 whitespace-nowrap"
          >
            {t('joinButton')}
          </a>

          {/* 关闭按钮 */}
          {dismissible && (
            <button
              onClick={() => setIsVisible(false)}
              className="inline-flex items-center justify-center w-8 h-8 text-text-muted hover:text-white hover:bg-white/10 rounded-md transition-all"
              aria-label={t('closeLabel')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
