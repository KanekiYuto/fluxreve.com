import sharp from 'sharp';
import { siteConfig } from '@/config/site';

/**
 * 为图片添加水印
 * 在图片右上角添加 "FluxReve" 和域名水印
 */
export async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  try {
    // 获取图片尺寸信息
    const metadata = await sharp(imageBuffer).metadata();
    if (!metadata.width || !metadata.height) {
      return imageBuffer;
    }

    const width = metadata.width;
    const height = metadata.height;

    // 计算水印尺寸（根据图片大小自适应）
    const watermarkFontSize = Math.max(width, height) > 2000 ? 100 : 70;
    const domainFontSize = Math.max(width, height) > 2000 ? 60 : 45;
    const watermarkPadding = Math.max(width, height) > 2000 ? 30 : 20;

    // 从配置中提取站点名称和域名
    const siteName = siteConfig.name || 'FluxReve';
    const siteUrl = siteConfig.url || 'fluxreve.com';
    const domain = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // 创建水印 SVG（带有半透明背景）
    const watermarkSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <text
          x="${width - watermarkPadding}"
          y="${watermarkPadding}"
          font-size="${watermarkFontSize}"
          fill="rgba(255, 255, 255, 0.6)"
          font-family="Arial, sans-serif"
          font-weight="bold"
          text-anchor="end"
          dominant-baseline="text-top"
          filter="url(#shadow)"
        >
          ${siteName}
        </text>
        <text
          x="${width - watermarkPadding}"
          y="${watermarkPadding + watermarkFontSize + 5}"
          font-size="${domainFontSize}"
          fill="rgba(255, 255, 255, 0.5)"
          font-family="Arial, sans-serif"
          font-weight="normal"
          text-anchor="end"
          dominant-baseline="text-top"
          filter="url(#shadow)"
        >
          ${domain}
        </text>
      </svg>
    `;

    // 将 SVG 转换为 Buffer
    const watermarkBuffer = Buffer.from(watermarkSvg);

    // 合成水印和原始图片
    const watermarkedImage = await sharp(imageBuffer)
      .composite([
        {
          input: watermarkBuffer,
          top: 0,
          left: 0,
        },
      ])
      .toBuffer();

    return watermarkedImage;
  } catch (error) {
    console.error('Failed to add watermark:', error);
    // 如果水印处理失败，返回原始图片
    return imageBuffer;
  }
}
