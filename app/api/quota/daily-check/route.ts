import { NextResponse } from 'next/server';
import { checkAndIssueDailyQuota } from '@/lib/quota/daily-quota';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST() {
  try {
    // 从 session 中获取当前用户
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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
      message: issued ? 'Daily quota issued' : 'Daily quota already issued',
    });
  } catch (error) {
    console.error('Daily quota check failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
