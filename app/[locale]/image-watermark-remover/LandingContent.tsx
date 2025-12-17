'use client';

import { useCachedSession } from '@/hooks/useCachedSession';
import {
  LandingHero,
  LandingWhat,
  LandingWhy,
  LandingHow,
  LandingFAQ,
  LandingCTA
} from '@/components/landing-page';
import AIGenerator from '@/components/ai-generator/AIGenerator';
import Divider from '@/components/Divider';

export default function LandingContent() {
  const { data: session } = useCachedSession();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen">
      {/* Hero 区域 - 对所有用户隐藏，但 SEO 内容通过 metadata 保留 */}
      <div className="sr-only">
        <LandingHero
          namespace="image-watermark-remover"
          colors={['#ec4899', '#f472b6', '#f91e8c', '#fb7185']}
          stats={['efficiency', 'quality', 'users']}
        />
        <Divider />
      </div>

      {/* AI Generator - 功能演示 */}
      <section id="generator" className="py-8 sm:py-10 md:py-12 bg-bg-base">
        <div className="max-w-7xl mx-auto">
          <AIGenerator defaultTab="more" defaultModel="image-watermark-remover" />
        </div>
      </section>

      {/* 以下内容对已登录用户使用 sr-only 隐藏，但保留在 DOM 中供 SEO 抓取 */}
      <div className={isLoggedIn ? 'sr-only' : ''}>
        <Divider />

        {/* What 区域 - 这是什么产品 */}
        <LandingWhat namespace="image-watermark-remover" />

        <Divider />

        {/* Why 区域 - 为什么选择我们 */}
        <LandingWhy namespace="image-watermark-remover" />

        <Divider />

        {/* How 区域 - 如何使用 */}
        <LandingHow namespace="image-watermark-remover" />

        <Divider />

        {/* FAQ 区域 - 常见问题 */}
        <LandingFAQ namespace="image-watermark-remover" />

        <Divider />

        {/* CTA 区域 - 行动号召 */}
        <LandingCTA
          namespace="image-watermark-remover"
          scanColor="#f472b6"
          linesColor="#be185d"
        />
      </div>
    </div>
  );
}
