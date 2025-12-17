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
          namespace="gpt-image-15"
          colors={['#00d4ff', '#00a8e8', '#007acc', '#0066b3']}
          stats={['speed', 'quality', 'versatility']}
        />
        <Divider />
      </div>

      {/* AI Generator - 功能演示 */}
      <section id="generator" className="py-8 sm:py-10 md:py-12 bg-bg-base">
        <div className="max-w-7xl mx-auto">
          <AIGenerator defaultTab="text-to-image" defaultModel="gpt-image-1.5" />
        </div>
      </section>

      {/* 以下内容对已登录用户使用 sr-only 隐藏，但保留在 DOM 中供 SEO 抓取 */}
      <div className={isLoggedIn ? 'sr-only' : ''}>
        <Divider />

        {/* What 区域 - 这是什么产品 */}
        <LandingWhat namespace="gpt-image-15" />

        <Divider />

        {/* Why 区域 - 为什么选择我们 */}
        <LandingWhy namespace="gpt-image-15" />

        <Divider />

        {/* How 区域 - 如何使用 */}
        <LandingHow namespace="gpt-image-15" />

        <Divider />

        {/* FAQ 区域 - 常见问题 */}
        <LandingFAQ namespace="gpt-image-15" />

        <Divider />

        {/* CTA 区域 - 行动号召 */}
        <LandingCTA
          namespace="gpt-image-15"
          scanColor="#00d4ff"
          linesColor="#003d5c"
        />
      </div>
    </div>
  );
}
