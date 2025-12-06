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
  const t = await getTranslations({ locale, namespace: 'flux2Pro.seo' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: generateAlternates(locale, '/flux-2-pro'),
  };
}

export default function Flux2ProPage() {
  return (
    <div className="min-h-screen">
      {/* Hero 区域 - 吸引注意力 */}
      <LandingHero
        namespace="flux2Pro"
        colors={['#f59e0b', '#eab308', '#facc15', '#fbbf24']}
        stats={['quality', 'features', 'professional']}
      />

      <Divider />

      {/* AI Generator - 功能演示 */}
      <section id="generator" className="py-8 sm:py-10 md:py-12 bg-bg-base">
        <div className="max-w-7xl mx-auto">
          <AIGenerator defaultTab="text-to-image" defaultModel="flux-2-pro" />
        </div>
      </section>

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
  );
}
