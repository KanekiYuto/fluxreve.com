/**
 * Cloudflare R2 存储客户端
 * 使用 S3 兼容 API
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

// ==================== 配置 ====================

const STORAGE_CONFIG = {
  region: process.env.STORAGE_REGION || 'auto',
  endpoint: process.env.STORAGE_ENDPOINT,
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  bucketName: process.env.STORAGE_BUCKET_NAME,
  publicUrl: process.env.STORAGE_PUBLIC_URL,
} as const;

// ==================== 类型定义 ====================

/**
 * 上传文件选项
 */
export interface UploadOptions {
  /** 文件 Buffer */
  file: Buffer;
  /** 文件名 */
  fileName: string;
  /** 文件 MIME 类型 */
  contentType: string;
  /** 可选的文件路径前缀 */
  prefix?: string;
}

/**
 * 上传结果
 */
export interface UploadResult {
  /** 文件的唯一 key */
  key: string;
  /** 文件的公开访问 URL */
  url: string;
  /** 文件大小(字节) */
  size: number;
}

// ==================== R2 客户端 ====================

/**
 * 创建 R2 客户端实例
 */
function createR2Client(): S3Client {
  const { region, endpoint, accessKeyId, secretAccessKey } = STORAGE_CONFIG;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('Storage credentials not configured');
  }

  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

// ==================== 工具函数 ====================

/**
 * 生成唯一的文件 key
 * @param fileName 原始文件名
 * @param prefix 可选的路径前缀
 * @returns 文件 key
 */
export function generateFileKey(fileName: string, prefix?: string): string {
  const uuid = randomUUID();
  const ext = fileName.split('.').pop() || '';
  const timestamp = Date.now();

  const baseKey = ext ? `${uuid}-${timestamp}.${ext}` : `${uuid}-${timestamp}`;

  return prefix ? `${prefix}/${baseKey}` : baseKey;
}

/**
 * 获取文件的公开访问 URL
 * @param key 文件 key
 * @returns 公开访问 URL
 */
export function getFileUrl(key: string): string {
  const { publicUrl } = STORAGE_CONFIG;

  if (!publicUrl) {
    throw new Error('STORAGE_PUBLIC_URL not configured. Please configure a public URL for storage bucket.');
  }

  // 确保 URL 以 / 结尾
  const baseUrl = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`;

  return `${baseUrl}${key}`;
}

// ==================== 主要功能 ====================

/**
 * 上传文件到 R2
 * @param options 上传选项
 * @returns 上传结果
 */
export async function uploadToR2(options: UploadOptions): Promise<UploadResult> {
  const { file, fileName, contentType, prefix } = options;
  const { bucketName, endpoint, accessKeyId } = STORAGE_CONFIG;

  if (!bucketName) {
    throw new Error('STORAGE_BUCKET_NAME not configured');
  }

  // 生成唯一的文件 key
  const key = generateFileKey(fileName, prefix);

  // 创建 R2 客户端
  const client = createR2Client();

  // 上传文件
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  try {
    console.log('Uploading to R2:', {
      endpoint,
      bucket: bucketName,
      key,
      accessKeyId: accessKeyId?.substring(0, 10) + '...',
    });

    await client.send(command);

    console.log('Upload successful:', key);

    // 返回上传结果
    return {
      key,
      url: getFileUrl(key),
      size: file.length,
    };
  } catch (error) {
    console.error('R2 upload error:', {
      error,
      endpoint,
      bucket: bucketName,
      key,
    });
    throw error;
  }
}

/**
 * 从 R2 删除文件
 * @param key 文件 key
 */
export async function deleteFromR2(key: string): Promise<void> {
  const { bucketName } = STORAGE_CONFIG;

  if (!bucketName) {
    throw new Error('STORAGE_BUCKET_NAME not configured');
  }

  const client = createR2Client();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await client.send(command);
}
