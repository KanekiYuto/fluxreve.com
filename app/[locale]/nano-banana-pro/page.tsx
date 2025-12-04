import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';
import Hero from './components/Hero';
import AIGenerator from '@/components/ai-generator/AIGenerator';
import What from './components/What';
import Why from './components/Why';
import How from './components/How';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
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
      <Hero />

      <Divider />

      {/* AI Generator - 功能演示 */}
      <section id="generator" className="py-8 sm:py-10 md:py-12 bg-bg-base">
        <div className="max-w-7xl mx-auto">
          <AIGenerator defaultTab="text-to-image" />
        </div>
      </section>

      <Divider />

      {/* What 区域 - 这是什么产品 */}
      <What />

      <Divider />

      {/* Why 区域 - 为什么选择我们 */}
      <Why />

      <Divider />

      {/* How 区域 - 如何使用 */}
      <How />

      <Divider />

      {/* FAQ 区域 - 常见问题 */}
      <FAQ />

      <Divider />

      {/* CTA 区域 - 行动号召 */}
      <CTA />
    </div>
  );
}
