/**
 * 检查用户追踪数据
 * 运行: npx tsx scripts/check-user-tracking.ts
 */

import { db } from '../lib/db';
import { user } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkUserTracking() {
  try {
    // 获取最近 10 个用户的追踪信息
    const users = await db
      .select({
        id: user.id,
        email: user.email,
        registrationIp: user.registrationIp,
        registrationCountry: user.registrationCountry,
        utmSource: user.utmSource,
        utmMedium: user.utmMedium,
        utmCampaign: user.utmCampaign,
        utmContent: user.utmContent,
        utmTerm: user.utmTerm,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(user.createdAt)
      .limit(10);

    console.log('\n=== 用户追踪数据 ===\n');

    if (users.length === 0) {
      console.log('❌ 没有找到任何用户');
      return;
    }

    users.forEach((u, index) => {
      console.log(`${index + 1}. ${u.email}`);
      console.log(`   ID: ${u.id}`);
      console.log(`   IP: ${u.registrationIp || '(未记录)'}`);
      console.log(`   国家: ${u.registrationCountry || '(未记录)'}`);
      console.log(`   UTM Source: ${u.utmSource || '(未记录)'}`);
      console.log(`   UTM Medium: ${u.utmMedium || '(未记录)'}`);
      console.log(`   UTM Campaign: ${u.utmCampaign || '(未记录)'}`);
      console.log(`   注册时间: ${u.createdAt}`);
      console.log('');
    });

    // 统计
    const hasIp = users.filter(u => u.registrationIp).length;
    const hasCountry = users.filter(u => u.registrationCountry).length;
    const hasUtm = users.filter(u => u.utmSource || u.utmMedium || u.utmCampaign).length;

    console.log('=== 统计 ===');
    console.log(`总用户数: ${users.length}`);
    console.log(`有 IP 记录: ${hasIp} (${Math.round(hasIp / users.length * 100)}%)`);
    console.log(`有国家记录: ${hasCountry} (${Math.round(hasCountry / users.length * 100)}%)`);
    console.log(`有 UTM 记录: ${hasUtm} (${Math.round(hasUtm / users.length * 100)}%)`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  }
}

checkUserTracking();
