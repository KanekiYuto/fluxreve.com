import { customAlphabet } from 'nanoid';

/**
 * 生成分享ID
 * 使用 NanoID 生成 URL 安全的唯一标识符
 * 格式: {taskType}-{model}-{randomId}
 * 字符集: 小写字母 + 数字 (a-z, 0-9)
 * 随机ID长度: 10 个字符
 * 示例: text-to-image-nano-banana-pro-a1b2c3d4e5
 *
 * @param taskType 任务类型（如: text-to-image）
 * @param model 模型名称（如: nano-banana-pro）
 * @returns 分享ID
 */
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

export function generateShareId(taskType: string, model: string): string {
  const randomId = nanoid();
  return `${taskType}-${model}-${randomId}`;
}