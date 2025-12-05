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
  const t = await getTranslations({ locale, namespace: 'nanoBananaPro.seo' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: generateAlternates(locale, '/nano-banana-pro'),
  };
}

export default function NanoBananaProPage() {
  return (
    <div className="min-h-screen">
      {/* Hero 区域 - 吸引注意力 */}
      <LandingHero
        namespace="nanoBananaPro"
        colors={['#ff6b9d', '#ffb3d9', '#ff85b3', '#ffc9e0']}
        stats={['speed', 'quality', 'users']}
      />

      <Divider />

      {/* AI Generator - 功能演示 */}
      <section id="generator" className="py-8 sm:py-10 md:py-12 bg-bg-base">
        <div className="max-w-7xl mx-auto">
          <AIGenerator defaultTab="text-to-image" defaultModel="nano-banana-pro" />
        </div>
      </section>

      <Divider />

      {/* What 区域 - 这是什么产品 */}
      <LandingWhat namespace="nanoBananaPro" />

      <Divider />

      {/* Why 区域 - 为什么选择我们 */}
      <LandingWhy namespace="nanoBananaPro" />

      <Divider />

      {/* How 区域 - 如何使用 */}
      <LandingHow namespace="nanoBananaPro" />

      <Divider />

      {/* FAQ 区域 - 常见问题 */}
      <LandingFAQ namespace="nanoBananaPro" />

      <Divider />

      {/* CTA 区域 - 行动号召 */}
      <LandingCTA
        namespace="nanoBananaPro"
        scanColor="#ffb3d9"
        linesColor="#6b5566"
      />
    </div>
  );
}
