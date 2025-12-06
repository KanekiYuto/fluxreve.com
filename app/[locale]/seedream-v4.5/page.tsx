import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seedreamV45.seo' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: generateAlternates(locale, '/seedream-v4.5'),
  };
}

export default function SeedreamV45Page() {
  return (
    <div className="min-h-screen">
      {/* Hero 区域 - 吸引注意力 */}
      <LandingHero
        namespace="seedreamV45"
        colors={['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']}
        stats={['speed', 'quality', 'users']}
      />

      <Divider />

      {/* AI Generator - 功能演示 */}
      <section id="generator" className="py-8 sm:py-10 md:py-12 bg-bg-base">
        <div className="max-w-7xl mx-auto">
          <AIGenerator defaultTab="text-to-image" defaultModel="seedream-v4.5" />
        </div>
      </section>

      <Divider />

      {/* What 区域 - 这是什么产品 */}
      <LandingWhat namespace="seedreamV45" />

      <Divider />

      {/* Why 区域 - 为什么选择我们 */}
      <LandingWhy namespace="seedreamV45" />

      <Divider />

      {/* How 区域 - 如何使用 */}
      <LandingHow namespace="seedreamV45" />

      <Divider />

      {/* FAQ 区域 - 常见问题 */}
      <LandingFAQ namespace="seedreamV45" />

      <Divider />

      {/* CTA 区域 - 行动号召 */}
      <LandingCTA
        namespace="seedreamV45"
        scanColor="#a78bfa"
        linesColor="#6d28d9"
      />
    </div>
  );
}
