CREATE TABLE "loras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"trigger_word" text,
	"title" text NOT NULL,
	"description" text,
	"user_id" text NOT NULL,
	"compatible_models" jsonb NOT NULL,
	"asset_urls" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_generation_task" ADD COLUMN "is_private" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "media_generation_task" ADD COLUMN "is_nsfw" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "media_generation_task" ADD COLUMN "nsfw_details" jsonb;--> statement-breakpoint
ALTER TABLE "loras" ADD CONSTRAINT "loras_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;