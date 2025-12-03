import { NextRequest, NextResponse } from 'next/server';
import { checkAndIssueDailyQuota } from '@/lib/quota/daily-quota';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 从 session 中获取当前用户
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userType = (session.user as any).userType || 'free';

    // 检查并下发每日配额
    const issued = await checkAndIssueDailyQuota(userId, userType);

    return NextResponse.json({
      success: true,
      issued,
      message: issued ? '每日配额已下发' : '今日配额已下发过',
    });
  } catch (error) {
    console.error('每日配额检查失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
