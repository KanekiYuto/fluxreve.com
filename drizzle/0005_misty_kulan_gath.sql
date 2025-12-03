ALTER TABLE "quota" DROP CONSTRAINT "quota_subscription_id_subscription_id_fk";
--> statement-breakpoint
ALTER TABLE "quota" DROP COLUMN "subscription_id";