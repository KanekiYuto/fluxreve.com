/**
 * 图片资源处理工具
 * 根据用户类型决定返回原始或带水印的图片URL
 */

export type UserType = 'free' | 'basic' | 'pro';

export interface ImageResult {
  url: string;
  watermarkUrl?: string;
  type: string;
  [key: string]: any;
}

/**
 * 根据用户类型处理图片结果
 * Free 用户返回水印版本，其他用户返回原始版本
 * 未登录用户也返回水印版本
 *
 * @param results - 图片结果数组
 * @param userType - 用户类型，undefined 表示未登录
 * @returns 处理后的结果
 */
export function processImageResults(
  results: unknown,
  userType?: UserType
): unknown {
  if (!Array.isArray(results)) {
    return results;
  }

  // Free 用户或未登录用户返回水印版本
  const isFreeUser = !userType || userType === 'free';

  if (!isFreeUser) {
    return results;
  }

  return results.map((result: any) => {
    if (result.watermarkUrl) {
      return {
        ...result,
        url: result.watermarkUrl,
      };
    }
    return result;
  });
}
