import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail/resend';
import { db } from '@/lib/db';
import { emailRecipient } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 发送单个营销邮件
 * POST /api/admin/marketing-email/send-one
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, text, html } = body;

    // 验证必填字段
    if (!to || !subject || !text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, text' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!to.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // 检查 SMTP 配置
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { success: false, error: 'SMTP service not configured' },
        { status: 500 }
      );
    }

    // 发送邮件
    await sendEmail({
      to,
      subject,
      text,
      html: html || text,
    });

    // 更新 email_recipient 表，标记为已发送
    await db
      .update(emailRecipient)
      .set({
        isSent: true,
        lastSentAt: new Date(),
      })
      .where(eq(emailRecipient.email, to.toLowerCase()))
      .catch(() => {
        // 如果邮箱不在 email_recipient 表中，忽略错误（可能是自定义邮箱）
        console.log(`Email ${to} not found in email_recipient table, skipping update`);
      });

    return NextResponse.json({
      success: true,
      data: {
        email: to,
        sent: true,
      },
      message: `Email sent successfully to ${to}`,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      },
      { status: 500 }
    );
  }
}
