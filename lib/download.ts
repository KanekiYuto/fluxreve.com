/**
 * 下载文件工具函数
 */

/**
 * 从 URL 中提取文件名（包含扩展名）
 * @param url 文件 URL
 * @returns 完整文件名（包含扩展名）
 */
function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // 从路径中提取最后一段作为文件名（包含扩展名）
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

    // 如果提取到的文件名为空或者不包含扩展名，使用时间戳作为备用
    if (!filename || !filename.includes('.')) {
      return `file-${Date.now()}`;
    }

    // URL 解码，处理可能的编码字符
    return decodeURIComponent(filename);
  } catch {
    return `file-${Date.now()}`;
  }
}

/**
 * 下载图片文件
 * @param imageUrl 图片 URL
 * @returns Promise<void>
 */
export async function downloadImage(imageUrl: string): Promise<void> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = getFilenameFromUrl(imageUrl);
    link.setAttribute('data-download-link', 'true');
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download image:', err);
    throw err;
  }
}

/**
 * 批量下载图片
 * @param imageUrls 图片 URL 数组
 * @param delay 下载间隔（毫秒），默认 300ms
 * @returns Promise<void>
 */
export async function downloadImages(
  imageUrls: string[],
  delay: number = 300
): Promise<void> {
  for (let i = 0; i < imageUrls.length; i++) {
    // 使用原始文件名
    await downloadImage(imageUrls[i]);
    // 添加延迟避免浏览器阻止多个下载
    if (i < imageUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * 下载任意文件
 * @param fileUrl 文件 URL
 * @returns Promise<void>
 */
export async function downloadFile(fileUrl: string): Promise<void> {
  const response = await fetch(fileUrl);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = getFilenameFromUrl(fileUrl);
  // 添加标记，让 NavigationProgress 忽略此链接
  link.setAttribute('data-download-link', 'true');

  link.click();

  window.URL.revokeObjectURL(url);
}
