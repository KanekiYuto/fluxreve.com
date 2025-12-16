/**
 * 邮件模板定义
 */

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'promotion' | 'announcement' | 'welcome' | 'feature' | 'event';
  subject: string;
  text: string;
  html: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'marketing_potential_customers',
    name: 'Marketing Email for Potential Customers',
    description: 'Promotional email introducing FluxReve to potential customers',
    category: 'promotion',
    subject: '🎨 FluxReve - AI Image Generation, 30 Images Per Day',
    text: `Hello,

FluxReve is an intelligent AI image generation platform. You can quickly create professional-grade images.

Core Features:
• Generate up to 30 high-quality images daily
• Multiple AI models available, with some supporting NSFW content
• Lightning-fast generation in seconds

Get Started Now:
https://fluxreve.com?utm_source=email&utm_medium=marketing&utm_campaign=potential_customers&utm_content=signup

Need help? support@fluxreve.com

FluxReve Team`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f0ff; }
    .wrapper { background-color: #f3f0ff; padding: 24px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 28px 20px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 32px; }
    .intro { font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px; text-align: center; }
    .intro strong { color: #333; font-weight: 600; }
    .features-list { margin: 28px 0; }
    .feature-item { margin: 0 0 24px 0; padding: 16px; background: #f8f9fa; border-left: 3px solid #667eea; border-radius: 6px; }
    .feature-item:last-child { margin-bottom: 0; }
    .feature-item h3 { margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #333; }
    .feature-item p { margin: 0; font-size: 13px; color: #666; line-height: 1.5; }
    .cta-button { display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 0; text-align: center; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 32px 0; }
    .cta-button:hover { opacity: 0.9; }
    .footer { background: #f9f9f9; border-top: 1px solid #e5e5e5; padding: 20px 32px; text-align: center; }
    .footer-text { margin: 6px 0; color: #999; font-size: 12px; line-height: 1.4; }
    .footer-text a { color: #667eea; text-decoration: none; }
    .social-links { margin: 12px 0; }
    .social-links a { color: #667eea; text-decoration: none; font-size: 13px; margin: 0 10px; }
    @media (max-width: 600px) {
      .content { padding: 24px 20px; }
      .header { padding: 32px 16px; }
      .footer { padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- 头部 -->
      <div class="header">
        <h1>FluxReve</h1>
      </div>

      <!-- Main Content -->
      <div class="content">
        <!-- Introduction -->
        <div class="intro">
          Generate<strong> high-quality images</strong> with<strong> AI algorithms</strong>.<br>No professional skills required, create in one click.
        </div>

        <!-- Features List -->
        <div class="features-list">
          <div class="feature-item">
            <h3>30 Images Daily</h3>
            <p>Generous quota for unlimited creativity</p>
          </div>

          <div class="feature-item">
            <h3>Rich Model Library</h3>
            <p>Multiple styles available, some support NSFW content</p>
          </div>

          <div class="feature-item">
            <h3>Lightning Fast</h3>
            <p>Seconds to generate, boost productivity</p>
          </div>
        </div>

        <!-- CTA Button -->
        <a href="https://fluxreve.com?utm_source=email&utm_medium=marketing&utm_campaign=potential_customers&utm_content=cta" class="cta-button" style="color: #ffffff !important;">Start for Free</a>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">© 2025 FluxReve. All rights reserved.</p>
        <p class="footer-text">
          <a href="https://fluxreve.com/terms">Terms of Service</a> |
          <a href="https://fluxreve.com/privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
];

/**
 * 根据 ID 获取模板
 */
export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find(t => t.id === id);
}

/**
 * 获取所有可用模板
 */
export function getAvailableTemplates(): EmailTemplate[] {
  return emailTemplates;
}

/**
 * 按分类获取模板
 */
export function getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
  return emailTemplates.filter(t => t.category === category);
}
