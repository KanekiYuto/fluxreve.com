import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getClientIp, getCountryFromHeaders } from '@/lib/utils/user-tracking';

/**
 * 保存用户追踪信息
 * POST /api/user/tracking
 *
 * 请求体（UTM 参数）：
 * {
 *   utmSource?: string;     // 来自 URL 或 PostHog
 *   utmMedium?: string;     // 来自 URL 或 PostHog
 *   utmCampaign?: string;   // 来自 URL 或 PostHog
 *   utmContent?: string;    // 来自 URL 或 PostHog
 *   utmTerm?: string;       // 来自 URL 或 PostHog
 * }
 *
 * IP 和国家信息由服务器端从请求头自动获取
 */
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 检查用户是否已有追踪信息
    const existingUser = await db
      .select({
        registrationIp: user.registrationIp,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // 如果已有追踪信息，返回成功（避免重复更新）
    if (existingUser[0]?.registrationIp) {
      return NextResponse.json({
        success: true,
        message: 'Tracking data already exists',
      });
    }

    // 从请求头获取 IP 和国家信息
    const ip = getClientIp(request.headers);
    const country = getCountryFromHeaders(request.headers);

    // 从请求体获取 UTM 参数
    let utmData: {
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
      utmContent?: string;
      utmTerm?: string;
    } = {};

    try {
      const body = await request.json();
      utmData = {
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
        utmContent: body.utmContent,
        utmTerm: body.utmTerm,
      };
    } catch {
      // 请求体为空或解析失败，使用空对象
    }

    // 更新用户记录
    await db
      .update(user)
      .set({
        registrationIp: ip,
        registrationCountry: country,
        utmSource: utmData.utmSource,
        utmMedium: utmData.utmMedium,
        utmCampaign: utmData.utmCampaign,
        utmContent: utmData.utmContent,
        utmTerm: utmData.utmTerm,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    console.log('[User Tracking] Saved tracking data for user:', userId, {
      ip,
      country,
      utm: utmData,
    });

    return NextResponse.json({
      success: true,
      message: 'Tracking data saved successfully',
    });
  } catch (error) {
    console.error('[User Tracking] Failed to save tracking data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
