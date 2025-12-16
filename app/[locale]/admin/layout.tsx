import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { verifyAdmin } from '@/lib/admin/verify-admin';
import UnauthorizedPage from './unauthorized';

interface AdminLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;

  // 获取当前用户会话（传递 headers）
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // 验证用户是否登录
  if (!session?.user?.id) {
    redirect(`/${locale}/`);
  }

  // 验证用户是否为管理员
  const isAdmin = await verifyAdmin(session.user.id);

  if (!isAdmin) {
    return <UnauthorizedPage locale={locale} />;
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* 管理后台导航栏 */}
      <nav className="bg-bg-elevated border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-white">管理后台</h1>
              <div className="hidden md:flex items-center gap-4">
                <a
                  href={`/${locale}/admin/subscriptions`}
                  className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-white transition-colors"
                >
                  订阅管理
                </a>
                <a
                  href={`/${locale}/admin/marketing-email`}
                  className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-white transition-colors"
                >
                  营销邮件
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-muted">
                {session.user.email}
              </span>
              <a
                href={`/${locale}/dashboard`}
                className="text-sm text-primary hover:text-primary-hover transition-colors"
              >
                返回前台
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main>{children}</main>
    </div>
  );
}
