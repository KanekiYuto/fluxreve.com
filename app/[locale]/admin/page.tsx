import { redirect } from 'next/navigation';

interface AdminPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  // 重定向到订阅管理页面
  redirect(`/${locale}/admin/subscriptions`);
}
