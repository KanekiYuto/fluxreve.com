import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';

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
      // 注意：字段名必须与 Drizzle schema 中的属性名匹配（驼峰命名）
      userType: {
        type: 'string',
        defaultValue: 'free',
        input: false, // 不允许用户直接输入
      },
      currentSubscriptionId: {
        type: 'string',
        required: false,
        input: false,
      },
      isAdmin: {
        type: 'boolean',
        defaultValue: false,
        input: false, // 不允许用户直接输入
      },
      registrationIp: {
        type: 'string',
        required: false,
        input: false,
      },
      registrationCountry: {
        type: 'string',
        required: false,
        input: false,
      },
      utmSource: {
        type: 'string',
        required: false,
        input: false,
      },
      utmMedium: {
        type: 'string',
        required: false,
        input: false,
      },
      utmCampaign: {
        type: 'string',
        required: false,
        input: false,
      },
      utmContent: {
        type: 'string',
        required: false,
        input: false,
      },
      utmTerm: {
        type: 'string',
        required: false,
        input: false,
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

});
