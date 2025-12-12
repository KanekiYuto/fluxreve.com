import fs from 'fs';
import path from 'path';

/**
 * 自动更新版本信息脚本
 * 在构建时自动更新版本号和构建时间
 *
 * 使用方式: npx tsx scripts/update-version.ts
 */

interface VersionInfo {
  version: string;
  releaseDate: string;
  buildTime: string;
}

function getNextVersion(currentVersion: string): string {
  const parts = currentVersion.split('.');
  if (parts.length !== 3) {
    console.error('Invalid version format. Expected X.Y.Z');
    return currentVersion;
  }

  // 递增补丁版本 (patch version)
  const patch = parseInt(parts[2], 10);
  parts[2] = (patch + 1).toString();

  return parts.join('.');
}

function updateVersion(): void {
  try {
    const versionFilePath = path.join(process.cwd(), 'version.json');

    // 读取当前版本信息
    let versionInfo: VersionInfo = {
      version: '0.1.0',
      releaseDate: new Date().toISOString().split('T')[0],
      buildTime: new Date().toISOString(),
    };

    if (fs.existsSync(versionFilePath)) {
      const content = fs.readFileSync(versionFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      versionInfo = {
        ...parsed,
        buildTime: new Date().toISOString(),
      };

      // 如果是新的一天，递增版本号
      const today = new Date().toISOString().split('T')[0];
      if (versionInfo.releaseDate !== today) {
        versionInfo.version = getNextVersion(versionInfo.version);
        versionInfo.releaseDate = today;
      }
    }

    // 写入更新后的版本信息
    fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));

    console.log('[Version] Updated successfully');
    console.log(`  Version: ${versionInfo.version}`);
    console.log(`  Release Date: ${versionInfo.releaseDate}`);
    console.log(`  Build Time: ${versionInfo.buildTime}`);
  } catch (error) {
    console.error('[Version] Failed to update:', error);
    process.exit(1);
  }
}

updateVersion();
