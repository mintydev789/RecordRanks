-- Custom SQL migration file, put your code below! --
ALTER TABLE "record_ranks"."contests" ADD COLUMN "admin_notes" text;--> statement-breakpoint
ALTER TYPE "record_ranks"."contest_type" ADD VALUE 'online';--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ALTER COLUMN "competitor_limit" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" DROP CONSTRAINT "contests_meetup_check", ADD CONSTRAINT "contests_meetup_check" CHECK (("type" <> 'meetup'
          AND "start_time" IS NULL
          AND "timezone" IS NULL
          AND "schedule" IS NOT NULL)
        OR ("type" = 'meetup'
          AND "start_time" IS NOT NULL
          AND "timezone" IS NOT NULL
          AND "schedule" IS NULL));--> statement-breakpoint
INSERT INTO "record_ranks"."regions" ("name", "code", "super_region_code") VALUES
  ('Multiple Countries (Asia)', 'XA', 'ASIA'),
  ('Multiple Countries (Europe)', 'XE', 'EUROPE'),
  ('Multiple Countries (Africa)', 'XF', 'AFRICA'),
  ('Multiple Countries (Americas)', 'XM', NULL),
  ('Multiple Countries (North America)', 'XN', 'NORTH_AMERICA'),
  ('Multiple Countries (Oceania)', 'XO', 'OCEANIA'),
  ('Multiple Countries (South America)', 'XS', 'SOUTH_AMERICA'),
  ('Multiple Countries (World)', 'XW', NULL);