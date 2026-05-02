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