CREATE TABLE "media_generation_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"task_type" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"parameters" jsonb NOT NULL,
	"results" jsonb,
	"consume_transaction_id" uuid NOT NULL,
	"refund_transaction_id" uuid,
	"error_message" jsonb,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "quota_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"quota_id" uuid NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"balance_before" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_generation_task" ADD CONSTRAINT "media_generation_task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_generation_task" ADD CONSTRAINT "media_generation_task_consume_transaction_id_quota_transaction_id_fk" FOREIGN KEY ("consume_transaction_id") REFERENCES "public"."quota_transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_generation_task" ADD CONSTRAINT "media_generation_task_refund_transaction_id_quota_transaction_id_fk" FOREIGN KEY ("refund_transaction_id") REFERENCES "public"."quota_transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_transaction" ADD CONSTRAINT "quota_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_transaction" ADD CONSTRAINT "quota_transaction_quota_id_quota_id_fk" FOREIGN KEY ("quota_id") REFERENCES "public"."quota"("id") ON DELETE cascade ON UPDATE no action;