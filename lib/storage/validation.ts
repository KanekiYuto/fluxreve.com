/**
 * 文件上传验证工具
 * 负责文件类型、大小等验证
 */

// ==================== 配置常量 ====================

/**
 * 支持的文件类型及其大小限制 (字节)
 */
export const FILE_LIMITS = {
  image: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  },
} as const;

/**
 * 文件类型
 */
export type FileType = keyof typeof FILE_LIMITS;

// ==================== 类型定义 ====================

/**
 * 文件验证结果
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileType?: FileType;
}

/**
 * 文件信息
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

// ==================== 验证函数 ====================

/**
 * 根据 MIME 类型判断文件类型
 * @param mimeType MIME 类型
 * @returns 文件类型
 */
export function getFileType(mimeType: string): FileType | null {
  for (const [type, config] of Object.entries(FILE_LIMITS)) {
    if ((config.mimeTypes as readonly string[]).includes(mimeType)) {
      return type as FileType;
    }
  }
  return null;
}

/**
 * 根据文件扩展名判断文件类型
 * @param fileName 文件名
 * @returns 文件类型
 */
export function getFileTypeByExtension(fileName: string): FileType | null {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));

  for (const [type, config] of Object.entries(FILE_LIMITS)) {
    if ((config.extensions as readonly string[]).includes(ext)) {
      return type as FileType;
    }
  }
  return null;
}

/**
 * 验证文件
 * @param fileInfo 文件信息
 * @param allowedTypes 允许的文件类型(可选,默认允许所有类型)
 * @returns 验证结果
 */
export function validateFile(
  fileInfo: FileInfo,
  allowedTypes?: FileType[]
): FileValidationResult {
  const { name, size, type: mimeType } = fileInfo;

  // 1. 根据 MIME 类型判断文件类型
  let fileType = getFileType(mimeType);

  // 2. 如果 MIME 类型无法判断，尝试从文件扩展名判断
  if (!fileType) {
    fileType = getFileTypeByExtension(name);
  }

  // 3. 如果仍然无法判断文件类型
  if (!fileType) {
    return {
      valid: false,
      error: `Unsupported file type: ${mimeType}`,
    };
  }

  // 4. 检查是否在允许的类型列表中
  if (allowedTypes && !allowedTypes.includes(fileType)) {
    return {
      valid: false,
      error: `File type '${fileType}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // 5. 检查文件大小
  const limit = FILE_LIMITS[fileType];
  if (size > limit.maxSize) {
    const maxSizeMB = (limit.maxSize / 1024 / 1024).toFixed(1);
    const fileSizeMB = (size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `File too large. Maximum size for ${fileType} is ${maxSizeMB}MB, current size: ${fileSizeMB}MB`,
    };
  }

  // 6. 检查文件名
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: 'File name cannot be empty',
    };
  }

  // 7. 检查文件是否为空
  if (size === 0) {
    return {
      valid: false,
      error: 'File cannot be empty',
    };
  }

  // 验证通过
  return {
    valid: true,
    fileType,
  };
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

/**
 * 获取允许的文件类型描述
 * @param allowedTypes 允许的文件类型
 * @returns 描述字符串
 */
export function getAllowedTypesDescription(allowedTypes?: FileType[]): string {
  if (!allowedTypes || allowedTypes.length === 0) {
    return 'All supported file types';
  }

  return allowedTypes
    .map((type) => {
      const config = FILE_LIMITS[type];
      const extensions = config.extensions.join(', ');
      const maxSize = formatFileSize(config.maxSize);
      return `${type} (${extensions}, max ${maxSize})`;
    })
    .join('; ');
}
