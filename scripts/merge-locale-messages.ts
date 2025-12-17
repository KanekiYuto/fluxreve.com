/**
 * 将每个语言目录下的所有 JSON 文件合并成一个单独的 JSON 文件
 * 这样可以简化动态导入，避免 Next.js 16 Turbopack 的问题
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const locales = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ar', 'fr', 'de', 'it', 'es', 'sv', 'no', 'da', 'fi'];

function mergeLocaleMessages(locale: string) {
  const localeDir = join(process.cwd(), 'messages', locale);
  const messages: Record<string, any> = {};

  try {
    // 读取该语言目录下的所有 JSON 文件
    const files = readdirSync(localeDir).filter(file => file.endsWith('.json'));

    files.forEach(file => {
      const filePath = join(localeDir, file);
      const fileName = file.replace('.json', '');

      // 读取 JSON 文件内容
      const content = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // 直接使用文件名作为键（保持原样，不转换驼峰）
      messages[fileName] = data;
    });

    // 写入合并后的文件
    const outputPath = join(process.cwd(), 'messages', `${locale}.json`);
    writeFileSync(outputPath, JSON.stringify(messages, null, 2), 'utf-8');
    console.log(`✓ 已合并 ${locale} 的翻译文件 (${files.length} 个文件)`);
  } catch (error) {
    console.error(`✗ 合并 ${locale} 翻译文件时出错:`, error);
  }
}

// 为每个语言合并文件
console.log('开始合并翻译文件...\n');
locales.forEach(locale => {
  mergeLocaleMessages(locale);
});
console.log('\n所有翻译文件合并完成！');
