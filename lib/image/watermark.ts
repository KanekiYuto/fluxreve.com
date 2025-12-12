/**
 * 为图片添加水印
 * 在图片右上角添加 "FluxReve" 和域名水印
 */
export async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  // 暂时禁用水印功能，直接返回原图
  return imageBuffer;
}
