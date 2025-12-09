import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';
import { getClientIp, getCountryFromHeaders, extractUtmParamsFromUrl } from './utils/user-tracking';
import { eq } from 'drizzle-orm';

// 导入 fetch 配置以解决 Google OAuth 超时问题
import './fetch-config';

// Better Auth 服务端配置
export const auth = betterAuth({
  // 数据库配置 - 使用 Drizzle ORM
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),

  // 用户配置 - 添加自定义字段
  user: {
    additionalFields: {
      userType: {
        type: 'string',
        defaultValue: 'free',
        input: false, // 不允许用户直接输入
        fieldName: 'user_type', // 数据库字段名
      },
      isAdmin: {
        type: 'boolean',
        defaultValue: false,
        input: false, // 不允许用户直接输入
        fieldName: 'is_admin', // 数据库字段名
      },
      registrationIp: {
        type: 'string',
        required: false,
        input: false,
        fieldName: 'registration_ip',
      },
      registrationCountry: {
        type: 'string',
        required: false,
        input: false,
        fieldName: 'registration_country',
      },
      utmSource: {
        type: 'string',
        required: false,
        input: false,
        fieldName: 'utm_source',
      },
      utmMedium: {
        type: 'string',
        required: false,
        input: false,
        fieldName: 'utm_medium',
      },
      utmCampaign: {
        type: 'string',
        required: false,
        input: false,
        fieldName: 'utm_campaign',
      },
      utmContent: {
        type: 'string',
        required: false,
        input: false,
        fieldName: 'utm_content',
      },
      utmTerm: {
        type: 'string',
        required: false,
        input: false,
        fieldName: 'utm_term',
      },
    },
  },

  // 邮箱密码登录配置
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // 可选:是否需要邮箱验证
  },

  // 社交登录配置
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // Google OAuth 回调地址会自动设置为 /api/auth/callback/google
    },
  },

  // 会话配置
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 天
    updateAge: 60 * 60 * 24, // 每天更新一次会话
    // 添加会话更新失败时的宽限期,避免连接超时导致会话立即失效
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 分钟缓存
    },
  },

  // 使用 Next.js Cookie 适配器
  plugins: [nextCookies()],

  // 其他配置
  advanced: {
    // 生产环境使用更安全的配置
    useSecureCookies: process.env.NODE_ENV === 'production',
  },

  // 钩子：在用户注册后捕获追踪信息
  hooks: {
    after: async (context: any) => {
      try {
        // 只处理注册和社交登录相关的请求
        const path = context.path;
        if (!path || (!path.includes('/sign-up') && !path.includes('/callback/'))) {
          return;
        }

        // 获取用户 ID
        const userId = context.context?.user?.id || context.user?.id;
        if (!userId) {
          console.log('[User Tracking] No user ID found in context');
          return;
        }

        // 检查用户是否已有追踪信息（避免重复更新）
        const existingUser = await db
          .select({
            registrationIp: schema.user.registrationIp,
          })
          .from(schema.user)
          .where(eq(schema.user.id, userId))
          .limit(1);

        // 如果已有 IP 记录，说明不是首次注册，跳过
        if (existingUser[0]?.registrationIp) {
          console.log('[User Tracking] User already has tracking data, skipping');
          return;
        }

        // 从请求中提取追踪信息
        const request = context.request;
        if (!request?.headers) {
          console.log('[User Tracking] No request headers available');
          return;
        }

        const ip = getClientIp(request.headers);
        const country = getCountryFromHeaders(request.headers);
        const utmParams = extractUtmParamsFromUrl(request.url || '');

        console.log('[User Tracking] Captured data:', {
          userId,
          ip,
          country,
          utmParams,
        });

        // 更新用户记录
        await db
          .update(schema.user)
          .set({
            registrationIp: ip,
            registrationCountry: country,
            utmSource: utmParams.utmSource,
            utmMedium: utmParams.utmMedium,
            utmCampaign: utmParams.utmCampaign,
            utmContent: utmParams.utmContent,
            utmTerm: utmParams.utmTerm,
            updatedAt: new Date(),
          })
          .where(eq(schema.user.id, userId));

        console.log('[User Tracking] Successfully saved tracking data for user:', userId);
      } catch (error) {
        // 不抛出错误，避免影响注册流程
        console.error('[User Tracking] Failed to save tracking data:', error);
      }
    },
  },
});
