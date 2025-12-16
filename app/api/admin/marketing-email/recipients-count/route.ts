import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailRecipient } from '@/lib/db/schema';
import { count } from 'drizzle-orm';

/**
 * 获取 email_recipient 表中的邮箱总数
 * GET /api/admin/marketing-email/recipients-count
 */
export async function GET(request: NextRequest) {
  try {
    // 使用 drizzle 的 count 函数获取总数
    const result = await db
      .select({ count: count() })
      .from(emailRecipient);

    const totalCount = result[0]?.count || 0;

    console.log('Recipients count:', totalCount);

    return NextResponse.json({
      success: true,
      count: totalCount,
    });
  } catch (error) {
    console.error('Failed to fetch recipient count:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
