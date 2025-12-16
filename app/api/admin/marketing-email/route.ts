import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, emailRecipient } from '@/lib/db/schema';
import { eq, ne } from 'drizzle-orm';
import { sendEmail } from '@/lib/mail/resend';

/**
 * 管理后台 - 准备发送营销邮件（获取收件人列表）
 * POST /api/admin/marketing-email
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

    // 验证用户是否为管理员
    const currentUser = await db
      .select({ isAdmin: user.isAdmin })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser[0]?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const {
      subject,
      content,
      htmlContent,
      recipientType, // 'database' 或 'custom'
      recipients, // 自定义收件人列表
    } = body;

    // 验证必填字段
    if (!subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: subject, content' },
        { status: 400 }
      );
    }

    if (!['database', 'custom'].includes(recipientType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid recipientType' },
        { status: 400 }
      );
    }

    // 获取收件人列表
    let targetEmails: string[] = [];

    if (recipientType === 'database') {
      // 从 email_recipient 表获取所有邮箱
      const dbRecipients = await db
        .select({ email: emailRecipient.email })
        .from(emailRecipient);
      targetEmails = dbRecipients.map(r => r.email || '').filter(Boolean);
    } else if (recipientType === 'custom' && Array.isArray(recipients)) {
      // 使用自定义邮箱列表
      targetEmails = recipients.filter(email => typeof email === 'string' && email.includes('@'));
    }

    if (targetEmails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recipients found' },
        { status: 400 }
      );
    }

    // 检查 SMTP 配置是否完整
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { success: false, error: 'SMTP service not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

    // 返回收件人列表和邮件内容，前端将逐个发送
    const jobId = `marketing_${Date.now()}`;

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        subject,
        content,
        htmlContent,
        recipients: targetEmails,
        recipientCount: targetEmails.length,
        status: 'ready',
        createdAt: new Date(),
      },
      message: `Ready to send emails to ${targetEmails.length} recipients. Emails will be sent one per second.`,
    });
  } catch (error) {
    console.error('Failed to prepare marketing email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * 管理后台 - 获取邮件发送历史
 * GET /api/admin/marketing-email
 */
export async function GET(request: NextRequest) {
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

    // 验证用户是否为管理员
    const currentUser = await db
      .select({ isAdmin: user.isAdmin })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser[0]?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 暂时返回空列表，实际应从数据库查询
    const emailHistory: Array<any> = [];

    return NextResponse.json({
      success: true,
      data: emailHistory,
    });
  } catch (error) {
    console.error('Failed to fetch marketing email history:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
