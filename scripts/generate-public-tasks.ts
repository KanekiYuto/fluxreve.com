import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { join } from 'path';

// 加载环境变量
config();

/**
 * 从数据库获取所有公开分享的任务链接
 * 在 sitemap 生成之前运行此脚本
 */
async function generatePublicTasks() {
  const outputPath = join(process.cwd(), '.next-sitemap-tasks.json');

  // 检查是否有数据库连接
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    console.log('⚠️  未配置数据库连接，跳过获取公开任务');
    console.log('💡 在生产环境构建时将自动从数据库获取');
    console.log('💡 本地测试请确保 .env 文件中配置了 DATABASE_URL');
    writeFileSync(outputPath, JSON.stringify([], null, 2));
    process.exit(0);
  }

  try {
    console.log('🔍 正在从数据库获取公开分享的任务...');

    // 动态导入以避免在没有数据库时报错
    const { db } = await import('@/lib/db');
    const { mediaGenerationTask } = await import('@/lib/db/schema');
    const { eq, and, isNull } = await import('drizzle-orm');

    // 查询所有公开且已完成的任务
    const tasks = await db
      .select({
        shareId: mediaGenerationTask.shareId,
      })
      .from(mediaGenerationTask)
      .where(
        and(
          eq(mediaGenerationTask.isPrivate, false),
          eq(mediaGenerationTask.isNsfw, false),
          eq(mediaGenerationTask.status, 'completed'),
          isNull(mediaGenerationTask.deletedAt)
        )
      )
      .limit(100); // 限制数量,避免 sitemap 过大

    const publicTasks = tasks.map(task => `/t/${task.shareId}`);

    // 保存到临时 JSON 文件
    writeFileSync(outputPath, JSON.stringify(publicTasks, null, 2));

    console.log(`✅ 成功获取 ${publicTasks.length} 个公开任务链接`);
    console.log(`📝 已保存到: ${outputPath}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 获取公开任务失败:', error);
    console.log('⚠️  将使用空的任务列表继续构建');
    // 即使失败也创建空文件，避免 sitemap 生成失败
    writeFileSync(outputPath, JSON.stringify([], null, 2));
    process.exit(0); // 不阻止构建流程
  }
}

generatePublicTasks();

