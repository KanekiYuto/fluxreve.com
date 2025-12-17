/**
 * 检查缺失的翻译键并生成报告
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const locales = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ar', 'fr', 'de', 'it', 'es', 'sv', 'no', 'da', 'fi'];
const baseLocale = 'en';

// 递归获取对象的所有键路径
function getKeyPaths(obj: any, prefix = ''): string[] {
  const paths: string[] = [];
  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      paths.push(...getKeyPaths(obj[key], fullPath));
    } else {
      paths.push(fullPath);
    }
  }
  return paths;
}

// 根据键路径获取值
function getValueByPath(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

function checkMissingTranslations() {
  console.log('开始检查缺失的翻译...\n');

  const messagesDir = join(process.cwd(), 'messages');
  const files = readdirSync(join(messagesDir, baseLocale)).filter(f => f.endsWith('.json'));

  const report: Record<string, Record<string, string[]>> = {};
  let totalMissing = 0;

  files.forEach(file => {
    const fileName = file.replace('.json', '');

    // 读取英语版本作为基准
    const baseFilePath = join(messagesDir, baseLocale, file);
    const baseContent = JSON.parse(readFileSync(baseFilePath, 'utf-8'));
    const baseKeys = getKeyPaths(baseContent);

    // 检查其他语言
    locales.forEach(locale => {
      if (locale === baseLocale) return;

      const localeFilePath = join(messagesDir, locale, file);
      let localeContent: any;

      try {
        localeContent = JSON.parse(readFileSync(localeFilePath, 'utf-8'));
      } catch (error) {
        return;
      }

      const localeKeys = getKeyPaths(localeContent);
      const missingKeys = baseKeys.filter(key => !localeKeys.includes(key));

      if (missingKeys.length > 0) {
        if (!report[locale]) report[locale] = {};
        report[locale][fileName] = missingKeys;
        totalMissing += missingKeys.length;
      }
    });
  });

  // 打印报告
  console.log('缺失翻译报告：\n');
  for (const locale in report) {
    console.log(`\n【${locale}】`);
    for (const file in report[locale]) {
      console.log(`  ${file}.json: 缺少 ${report[locale][file].length} 个键`);
      report[locale][file].forEach(key => {
        console.log(`    - ${key}`);
      });
    }
  }

  console.log(`\n\n总计缺失: ${totalMissing} 个翻译键`);

  // 保存报告
  const reportPath = join(process.cwd(), 'missing-translations-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n报告已保存到: ${reportPath}`);
}

checkMissingTranslations();
