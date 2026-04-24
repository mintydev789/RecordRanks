-- Custom SQL migration file, put your code below! --
ALTER TABLE "record_ranks"."contests" ADD COLUMN "admin_notes" text;--> statement-breakpoint
ALTER TYPE "record_ranks"."contest_type" ADD VALUE 'online';--> statement-breakpoint
COMMIT TRANSACTION;--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ALTER COLUMN "region_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ALTER COLUMN "venue" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ALTER COLUMN "address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ALTER COLUMN "latitude_microdegrees" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ALTER COLUMN "longitude_microdegrees" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ADD CONSTRAINT "contests_comp_check" CHECK (("type" <> 'comp' AND "type" <> 'wca-comp')
        OR ("region_code" IS NOT NULL
          AND "city" IS NOT NULL
          AND "venue" IS NOT NULL
          AND "address" IS NOT NULL
          AND "latitude_microdegrees" IS NOT NULL
          AND "longitude_microdegrees" IS NOT NULL
          AND "start_time" IS NULL
          AND "timezone" IS NULL
          AND "competitor_limit" IS NOT NULL
          AND "schedule" IS NOT NULL));--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ADD CONSTRAINT "contests_online_check" CHECK ("type" <> 'online'
        OR ("region_code" IS NULL
          AND "city" IS NULL
          AND "venue" IS NULL
          AND "address" IS NULL
          AND "latitude_microdegrees" IS NULL
          AND "longitude_microdegrees" IS NULL
          AND "start_time" IS NULL));--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" DROP CONSTRAINT "contests_meetup_check", ADD CONSTRAINT "contests_meetup_check" CHECK ("type" <> 'meetup'
        OR ("region_code" IS NOT NULL
          AND "city" IS NOT NULL
          AND "venue" IS NOT NULL
          AND "address" IS NOT NULL
          AND "latitude_microdegrees" IS NOT NULL
          AND "longitude_microdegrees" IS NOT NULL
          AND "start_time" IS NOT NULL
          AND "timezone" IS NOT NULL
          AND "schedule" IS NULL));