CREATE TABLE "email_recipient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_recipient_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "email_recipient_email_idx" ON "email_recipient" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_recipient_created_at_idx" ON "email_recipient" USING btree ("created_at");