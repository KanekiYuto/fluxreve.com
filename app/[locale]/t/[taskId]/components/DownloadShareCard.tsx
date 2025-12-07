'use client';

import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { siteConfig } from '@/config/site';

interface DownloadShareCardProps {
  imageUrl: string;
  prompt: string;
  model: string;
  shareUrl: string;
}

/**
 * 下载分享卡片组件
 * 生成一个包含图片、提示词、站点信息和二维码的精美分享卡片
 */
export default function DownloadShareCard({ imageUrl, prompt, model, shareUrl }: DownloadShareCardProps) {
  const t = useTranslations('share.actions');
  const tDetails = useTranslations('share.details');
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // 生成二维码
  useEffect(() => {
    QRCode.toDataURL(shareUrl, {
      width: 120,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then(setQrCodeUrl)
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [shareUrl]);

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        preferredFontFormat: 'woff2',
        filter: (node) => {
          // 过滤掉可能导致 CORS 问题的元素
          return true;
        },
      });

      const link = document.createElement('a');
      link.download = `${siteConfig.name}-share-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download share card:', err);
    }
  };

  return (
    <div>
      {/* 下载按钮 */}
      <button
        onClick={handleDownloadCard}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-700/50 transition-colors text-white text-sm cursor-pointer w-full"
      >
        <Download className="w-4 h-4" />
        {t('downloadCard') || '下载分享卡片'}
      </button>

      {/* 隐藏的卡片内容（用于生成图片） */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}>
        <div
          ref={cardRef}
          style={{
            width: '600px',
            background: 'linear-gradient(to bottom right, #fdf2f8, #faf5ff)',
            padding: '24px',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* 顶部日期和装饰点 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#9ca3af' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6b7280' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4b5563' }}></div>
            </div>
          </div>

          {/* 分隔线 */}
          <div style={{ borderTop: '1px solid #9ca3af', marginBottom: '16px' }}></div>

          {/* 图片区域 */}
          <div style={{ marginBottom: '16px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.5)', padding: '8px' }}>
            <img
              src={imageUrl}
              alt={prompt}
              style={{ width: '100%', height: 'auto', borderRadius: '12px', display: 'block' }}
              crossOrigin="anonymous"
            />
          </div>

          {/* 提示词内容 */}
          <div style={{ marginBottom: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
            <p style={{
              color: '#1f2937',
              fontSize: '16px',
              lineHeight: '1.625',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {prompt}
            </p>
          </div>

          {/* 分隔线 */}
          <div style={{ borderTop: '1px solid #9ca3af', marginBottom: '16px' }}></div>

          {/* 底部信息区域 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
            <div style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>
              {tDetails('aiModel')}: {model}
            </div>
            <div style={{ fontSize: '14px', color: '#4b5563' }}>
              {siteConfig.name}
            </div>
          </div>

          {/* 黑色底部栏：站点信息和二维码 */}
          <div style={{ background: '#000000', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '20px', marginBottom: '4px' }}>
                {siteConfig.name}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                {siteConfig.url?.replace(/^https?:\/\//, '')}
              </div>
            </div>

            {/* 二维码 */}
            {qrCodeUrl && (
              <div style={{ background: '#ffffff', padding: '8px', borderRadius: '12px' }}>
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  style={{ width: '80px', height: '80px', display: 'block' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
