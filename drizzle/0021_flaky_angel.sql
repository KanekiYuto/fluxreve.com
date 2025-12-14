CREATE TABLE "task_view_record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"ip_address" text NOT NULL,
	"user_id" text,
	"user_agent" text,
	"country" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_generation_task" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "task_view_record" ADD CONSTRAINT "task_view_record_task_id_media_generation_task_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."media_generation_task"("task_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_view_record" ADD CONSTRAINT "task_view_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_view_record_task_id_idx" ON "task_view_record" USING btree ("task_id");--> statement-breakpoint
CREATE UNIQUE INDEX "task_view_record_task_id_ip_unique_idx" ON "task_view_record" USING btree ("task_id","ip_address");--> statement-breakpoint
CREATE INDEX "task_view_record_user_id_idx" ON "task_view_record" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_view_record_created_at_idx" ON "task_view_record" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "media_generation_task_view_count_idx" ON "media_generation_task" USING btree ("view_count");