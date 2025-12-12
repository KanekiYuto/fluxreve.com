import fs from 'fs';
import path from 'path';

/**
 * 版本信息接口
 */
export interface VersionInfo {
  version: string;
  releaseDate: string;
  buildTime: string;
}

/**
 * 获取版本信息
 * 从 version.json 文件中读取版本号和发布日期
 */
export function getVersionInfo(): VersionInfo {
  try {
    const versionFilePath = path.join(process.cwd(), 'version.json');

    if (!fs.existsSync(versionFilePath)) {
      console.warn('[Version] version.json not found, using default values');
      return {
        version: '0.1.0',
        releaseDate: new Date().toISOString().split('T')[0],
        buildTime: new Date().toISOString(),
      };
    }

    const content = fs.readFileSync(versionFilePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('[Version] Failed to read version info:', error);
    return {
      version: '0.1.0',
      releaseDate: new Date().toISOString().split('T')[0],
      buildTime: new Date().toISOString(),
    };
  }
}

/**
 * 获取版本号
 */
export function getVersion(): string {
  return getVersionInfo().version;
}

/**
 * 获取发布日期
 */
export function getReleaseDate(): string {
  return getVersionInfo().releaseDate;
}
