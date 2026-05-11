-- Custom SQL migration file, put your code below! --
ALTER TABLE "record_ranks"."regions" ALTER COLUMN "super_region_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."regions" ALTER COLUMN "super_region_record_type" DROP NOT NULL;--> statement-breakpoint
ALTER TYPE "record_ranks"."record_category" RENAME VALUE 'video-based-results' TO 'online';--> statement-breakpoint
ALTER TABLE "record_ranks"."results" DROP CONSTRAINT "results_check", ADD CONSTRAINT "results_check" CHECK (("competition_id" IS NOT NULL
          AND "round_id" IS NOT NULL
          AND "ranking" IS NOT NULL)
        OR ("competition_id" IS NULL
          AND "record_category" = 'online'
          AND "round_id" IS NULL
          AND "ranking" IS NULL
          AND "proceeds" IS NULL));
INSERT INTO "record_ranks"."regions" ("name", "code", "super_region_code") VALUES
  ('Multiple Countries (Asia)', 'XA', 'ASIA'),
  ('Multiple Countries (Europe)', 'XE', 'EUROPE'),
  ('Multiple Countries (Africa)', 'XF', 'AFRICA'),
  ('Multiple Countries (Americas)', 'XM', NULL),
  ('Multiple Countries (North America)', 'XN', 'NORTH_AMERICA'),
  ('Multiple Countries (Oceania)', 'XO', 'OCEANIA'),
  ('Multiple Countries (South America)', 'XS', 'SOUTH_AMERICA'),
  ('Multiple Countries (World)', 'XW', NULL);