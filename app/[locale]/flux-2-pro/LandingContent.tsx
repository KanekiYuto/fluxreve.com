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
          namespace="flux2Pro"
          colors={['#f59e0b', '#eab308', '#facc15', '#fbbf24']}
          stats={['quality', 'features', 'professional']}
        />
        <Divider />
      </div>

      {/* AI Generator - 功能演示 */}
      <section id="generator" className="py-8 sm:py-10 md:py-12 bg-bg-base">
        <div className="max-w-7xl mx-auto">
          <AIGenerator defaultTab="text-to-image" defaultModel="flux-2-pro" />
        </div>
      </section>

      {/* 以下内容对已登录用户使用 sr-only 隐藏，但保留在 DOM 中供 SEO 抓取 */}
      <div className={isLoggedIn ? 'sr-only' : ''}>
        <Divider />

        {/* What 区域 - 这是什么产品 */}
        <LandingWhat namespace="flux2Pro" />

        <Divider />

        {/* Why 区域 - 为什么选择我们 */}
        <LandingWhy namespace="flux2Pro" />

        <Divider />

        {/* How 区域 - 如何使用 */}
        <LandingHow namespace="flux2Pro" />

        <Divider />

        {/* FAQ 区域 - 常见问题 */}
        <LandingFAQ namespace="flux2Pro" />

        <Divider />

        {/* CTA 区域 - 行动号召 */}
        <LandingCTA
          namespace="flux2Pro"
          scanColor="#facc15"
          linesColor="#b3a200"
        />
      </div>
    </div>
  );
}
