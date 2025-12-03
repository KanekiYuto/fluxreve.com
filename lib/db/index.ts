import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// 创建 PostgreSQL 连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// 创建 Drizzle 数据库实例
export const db = drizzle(pool);
