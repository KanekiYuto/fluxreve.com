ALTER TABLE "media_generation_task" ALTER COLUMN "task_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "media_generation_task" ALTER COLUMN "provider_request_id" DROP NOT NULL;