import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// 创建 PostgreSQL 连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时时间（30秒）
  connectionTimeoutMillis: 10000, // 连接超时时间（10秒）
  allowExitOnIdle: true, // 允许在空闲时退出
});

// 处理连接错误
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// 创建 Drizzle 数据库实例
export const db = drizzle(pool);
