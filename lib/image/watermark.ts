import sharp from 'sharp';

/**
 * 为图片添加水印
 * 在图片右上角添加 "FluxReve" 和域名水印
 */
export async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      // 如果无法获取图片尺寸，返回原图
      return imageBuffer;
    }

    const { width, height } = metadata;

    // 计算水印大小和位置
    const fontSize = Math.max(Math.floor(width / 25), 16);
    const padding = Math.floor(width / 50);

    // 创建包含水印文字的 SVG
    const watermarkText = 'FluxReve';
    const domainText = 'fluxreve.com';

    const svgWatermark = `
      <svg width="${width}" height="${height}">
        <style>
          .watermark {
            fill: rgba(255, 255, 255, 0.7);
            font-family: Arial, sans-serif;
            font-weight: bold;
          }
          .domain {
            fill: rgba(255, 255, 255, 0.6);
            font-family: Arial, sans-serif;
            font-size: ${Math.floor(fontSize * 0.7)}px;
          }
        </style>
        <text x="${width - padding}" y="${padding + fontSize}"
              text-anchor="end" class="watermark" font-size="${fontSize}px">
          ${watermarkText}
        </text>
        <text x="${width - padding}" y="${padding + fontSize + Math.floor(fontSize * 0.9)}"
              text-anchor="end" class="domain">
          ${domainText}
        </text>
      </svg>
    `;

    // 将水印合成到图片上
    const watermarkedImage = await image
      .composite([
        {
          input: Buffer.from(svgWatermark),
          top: 0,
          left: 0,
        },
      ])
      .toBuffer();

    return watermarkedImage;
  } catch (error) {
    console.error('Failed to add watermark:', error);
    // 如果添加水印失败，返回原图
    return imageBuffer;
  }
}
