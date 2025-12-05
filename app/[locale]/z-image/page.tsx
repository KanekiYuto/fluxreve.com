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
  const t = await getTranslations({ locale, namespace: 'zImage.seo' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: generateAlternates(locale, '/z-image'),
  };
}

export default function ZImagePage() {
  return (
    <div className="min-h-screen">
      {/* Hero 区域 - 吸引注意力 */}
      <LandingHero
        namespace="zImage"
        colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#6366f1']}
      />

      <Divider />

      {/* AI Generator - 功能演示 */}
      <section id="generator" className="py-8 sm:py-10 md:py-12 bg-bg-base">
        <div className="max-w-7xl mx-auto">
          <AIGenerator defaultTab="text-to-image" />
        </div>
      </section>

      <Divider />

      {/* What 区域 - 这是什么产品 */}
      <LandingWhat namespace="zImage" />

      <Divider />

      {/* Why 区域 - 为什么选择我们 */}
      <LandingWhy namespace="zImage" />

      <Divider />

      {/* How 区域 - 如何使用 */}
      <LandingHow namespace="zImage" />

      <Divider />

      {/* FAQ 区域 - 常见问题 */}
      <LandingFAQ namespace="zImage" />

      <Divider />

      {/* CTA 区域 - 行动号召 */}
      <LandingCTA
        namespace="zImage"
        scanColor="#3b82f6"
        linesColor="#3b5566"
      />
    </div>
  );
}
