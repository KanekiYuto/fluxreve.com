/**
 * LoRA 数据库操作函数
 */

import { db } from '@/lib/db';
import { lora } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { CreateLoraInput, UpdateLoraInput, LoraQueryParams, Lora } from './types';

/**
 * 创建新的 LoRA
 */
export async function createLora(input: CreateLoraInput): Promise<Lora> {
  const [newLora] = await db
    .insert(lora)
    .values({
      url: input.url,
      triggerWord: input.triggerWord || null,
      prompt: input.prompt,
      title: input.title,
      description: input.description || null,
      userId: input.userId,
      compatibleModels: input.compatibleModels,
      assetUrls: input.assetUrls || [],
    })
    .returning();

  return newLora as Lora;
}

/**
 * 根据 ID 获取 LoRA
 */
export async function getLoraById(id: string): Promise<Lora | null> {
  const [result] = await db.select().from(lora).where(eq(lora.id, id)).limit(1);
  return result ? (result as Lora) : null;
}

/**
 * 查询 LoRA 列表
 */
export async function queryLoras(params: LoraQueryParams = {}): Promise<Lora[]> {
  const { userId, model, limit = 50, offset = 0 } = params;

  let query = db.select().from(lora);

  // 构建查询条件
  const conditions = [];
  if (userId) {
    conditions.push(eq(lora.userId, userId));
  }
  if (model) {
    // 使用 JSONB 操作符查询数组中是否包含指定模型
    conditions.push(sql`${lora.compatibleModels} @> ${JSON.stringify([model])}`);
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  // 添加排序和分页
  const results = await query
    .orderBy(lora.createdAt)
    .limit(limit)
    .offset(offset);

  return results as Lora[];
}

/**
 * 更新 LoRA 信息
 */
export async function updateLora(id: string, input: UpdateLoraInput): Promise<Lora | null> {
  const updateData: Partial<typeof lora.$inferInsert> = {};

  if (input.url !== undefined) updateData.url = input.url;
  if (input.triggerWord !== undefined) updateData.triggerWord = input.triggerWord;
  if (input.prompt !== undefined) updateData.prompt = input.prompt;
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.compatibleModels !== undefined) updateData.compatibleModels = input.compatibleModels;
  if (input.assetUrls !== undefined) updateData.assetUrls = input.assetUrls;

  // 更新 updatedAt
  updateData.updatedAt = new Date();

  const [updated] = await db
    .update(lora)
    .set(updateData)
    .where(eq(lora.id, id))
    .returning();

  return updated ? (updated as Lora) : null;
}

/**
 * 删除 LoRA
 */
export async function deleteLora(id: string): Promise<boolean> {
  const result = await db.delete(lora).where(eq(lora.id, id)).returning();
  return result.length > 0;
}

/**
 * 检查用户是否拥有指定的 LoRA
 */
export async function isLoraOwner(loraId: string, userId: string): Promise<boolean> {
  const [result] = await db
    .select()
    .from(lora)
    .where(and(eq(lora.id, loraId), eq(lora.userId, userId)))
    .limit(1);

  return !!result;
}
