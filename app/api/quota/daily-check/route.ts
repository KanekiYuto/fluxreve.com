import { NextRequest, NextResponse } from 'next/server';
import { checkAndIssueDailyQuota } from '@/lib/quota/daily-quota';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 从 session 中获取当前用户
    const session = await auth.api.getSession({
      headers: request.headers,
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
    const issued = await checkAndIssueDailyQuota(userId, userType, session?.user?.registrationCountry || undefined);

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
