CREATE TABLE "cubing_contests"."access_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cubing_contests"."access_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"token_hash" text NOT NULL,
	"competition_id" text NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cubing_contests"."collective_solutions" RENAME COLUMN "last_user_who_interacted" TO "last_user_who_interacted_id";--> statement-breakpoint
ALTER TABLE "cubing_contests"."events" ADD COLUMN "important_info" text;--> statement-breakpoint
ALTER TABLE "cubing_contests"."contests" DROP COLUMN "queue_position";--> statement-breakpoint
ALTER TABLE "cubing_contests"."access_tokens" ADD CONSTRAINT "access_tokens_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "cubing_contests"."users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cubing_contests"."results" DROP CONSTRAINT "results_check", ADD CONSTRAINT "results_check" CHECK (("competition_id" IS NOT NULL
          AND "record_category" <> 'video-based-results'
          AND "round_id" IS NOT NULL
          AND "ranking" IS NOT NULL)
        OR ("competition_id" IS NULL
          AND "record_category" = 'video-based-results'
          AND "round_id" IS NULL
          AND "ranking" IS NULL
          AND "proceeds" IS NULL));