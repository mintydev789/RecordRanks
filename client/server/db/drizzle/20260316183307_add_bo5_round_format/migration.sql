ALTER TYPE "record_ranks"."round_format" ADD VALUE '5' BEFORE 'm';--> statement-breakpoint
ALTER TABLE "record_ranks"."posts" ALTER COLUMN "date" SET DEFAULT now();