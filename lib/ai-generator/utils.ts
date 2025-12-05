import { NextResponse } from 'next/server';

/**
 * 验证图片 URL 数组
 * @param images - 图片 URL 数组
 * @param allowedExtensions - 允许的图片扩展名,默认 ['.jpg', '.jpeg', '.png', '.webp']
 * @returns 验证通过返回 null,验证失败返回 NextResponse 错误响应
 */
export function validateImageUrls(
  images: string[],
  allowedExtensions: string[] = ['.jpg', '.jpeg', '.png', '.webp']
): NextResponse | null {
  // 过滤出有效的图片 URL
  const validImages = images.filter(img => img && img.trim());

  // 验证至少有一张图片
  if (validImages.length === 0) {
    return NextResponse.json(
      { success: false, error: 'At least one image is required' },
      { status: 400 }
    );
  }

  // 验证每个 URL 是否为图片格式
  for (const imageUrl of validImages) {
    try {
      const url = new URL(imageUrl);
      const pathname = url.pathname.toLowerCase();
      const hasImageExtension = allowedExtensions.some(ext => pathname.endsWith(ext));

      if (!hasImageExtension) {
        const extensionsText = allowedExtensions.map(ext => ext.replace('.', '')).join(', ');
        return NextResponse.json(
          { success: false, error: `Invalid image URL: ${imageUrl}. Must be a valid image file (${extensionsText})` },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: `Invalid URL format: ${imageUrl}` },
        { status: 400 }
      );
    }
  }

  // 验证通过
  return null;
}

/**
 * 过滤出有效的图片 URL(非空且已修剪)
 * @param images - 图片 URL 数组
 * @returns 有效的图片 URL 数组
 */
export function filterValidImages(images: string[]): string[] {
  return images.filter(img => img && img.trim());
}
