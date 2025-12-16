ALTER TABLE "email_recipient" ADD COLUMN "is_sent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_recipient" ADD COLUMN "last_sent_at" timestamp;--> statement-breakpoint
CREATE INDEX "email_recipient_is_sent_idx" ON "email_recipient" USING btree ("is_sent");--> statement-breakpoint
CREATE INDEX "email_recipient_last_sent_at_idx" ON "email_recipient" USING btree ("last_sent_at");