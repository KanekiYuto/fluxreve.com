-- 第一步：添加可空的 share_id 字段
ALTER TABLE "media_generation_task" ADD COLUMN "share_id" text;--> statement-breakpoint

-- 第二步：为现有记录生成 share_id（使用 task_id 的前8位作为临时值）
UPDATE "media_generation_task"
SET "share_id" = substring(replace(cast("task_id" as text), '-', ''), 1, 8)
WHERE "share_id" IS NULL;--> statement-breakpoint

-- 第三步：将字段设置为 NOT NULL
ALTER TABLE "media_generation_task" ALTER COLUMN "share_id" SET NOT NULL;--> statement-breakpoint

-- 第四步：添加唯一约束
ALTER TABLE "media_generation_task" ADD CONSTRAINT "media_generation_task_share_id_unique" UNIQUE("share_id");