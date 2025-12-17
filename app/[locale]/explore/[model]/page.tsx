import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';
import ExploreGallery from '../components/ExploreGallery';
import { notFound } from 'next/navigation';

// 定义支持的模型列表
const SUPPORTED_MODELS = [
  'nano-banana-pro',
  'nano-banana',
  'z-image',
  'z-image-lora',
  'flux-2-pro',
  'flux-schnell',
  'seedream-v4.5',
  'gpt-image-1.5',
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; model: string }>;
}): Promise<Metadata> {
  const { locale, model } = await params;

  // 验证模型是否支持
  if (!SUPPORTED_MODELS.includes(model)) {
    return {
      title: 'Not Found',
      description: 'Model not found',
    };
  }

  const t = await getTranslations({ locale, namespace: 'explore.seo' });

  return {
    title: `${model} - ${t('title')}`,
    description: t('description'),
    alternates: generateAlternates(locale, `/explore/${model}`),
  };
}

export default async function ExploreModelPage({
  params,
}: {
  params: Promise<{ locale: string; model: string }>;
}) {
  const { model } = await params;

  // 验证模型是否支持
  if (!SUPPORTED_MODELS.includes(model)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-bg">
      <ExploreGallery model={model} />
    </div>
  );
}
