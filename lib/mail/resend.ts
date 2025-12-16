import nodemailer from 'nodemailer';

// 创建 SMTP 传输
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpUseTLS = process.env.SMTP_USE_TLS !== 'false';

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment variables.');
  }

  // 根据端口判断是否使用 SSL/TLS
  // 465 端口使用 SSL (secure: true)
  // 587 端口使用 TLS (secure: false)
  const isSecure = smtpPort === 465;

  console.log(`SMTP Configuration: host=${smtpHost}, port=${smtpPort}, secure=${isSecure}, user=${smtpUser}`);

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: isSecure, // true for 465 (SSL), false for 587 (TLS)
    requireTLS: smtpUseTLS && smtpPort === 587,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 10000, // 10 秒超时
    socketTimeout: 10000, // 10 秒超时
  });
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

/**
 * 发送单个邮件
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailOptions) {
  try {
    const transporter = createTransporter();
    const smtpUser = process.env.SMTP_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'FluxReve';

    // 使用 SMTP 认证的邮箱作为发件人（某些服务器要求发件人必须是认证邮箱）
    const result = await transporter.sendMail({
      from: `${fromName} <${smtpUser}>`,
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      text,
      html: html || text,
    });

    console.log(`Email sent successfully: ${result.messageId}`);
    return { id: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * 批量发送邮件（使用 BCC 隐藏收件人列表）
 */
export async function sendBulkEmails({
  recipients,
  subject,
  text,
  html,
}: {
  recipients: string[];
  subject: string;
  text: string;
  html?: string;
}) {
  try {
    if (recipients.length === 0) {
      throw new Error('No recipients provided');
    }

    const transporter = createTransporter();
    const smtpUser = process.env.SMTP_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'FluxReve';

    // 为了隐私和防止泄露用户邮箱，使用 BCC
    // to 字段设置为第一个收件人，某些 SMTP 服务器要求至少有一个收件人
    // 使用 SMTP 认证的邮箱作为发件人（某些服务器要求发件人必须是认证邮箱）
    const result = await transporter.sendMail({
      from: `${fromName} <${smtpUser}>`,
      to: recipients[0], // 第一个收件人作为主收件人
      bcc: recipients.slice(1), // 其余收件人作为 BCC
      subject,
      text,
      html: html || text,
    });

    console.log(`Bulk email sent successfully to ${recipients.length} recipients: ${result.messageId}`);
    return { id: result.messageId };
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    throw error;
  }
}
