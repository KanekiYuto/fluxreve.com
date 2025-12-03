import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Better Auth API 路由处理器
// 处理所有认证相关的请求: /api/auth/*
export const { GET, POST } = toNextJsHandler(auth);
