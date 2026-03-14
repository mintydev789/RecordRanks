CREATE TABLE "record_ranks"."posts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "record_ranks"."posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"post_id" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"date" timestamp DEFAULT '2026-03-14 13:22:55.966' NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "record_ranks"."settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"key" text NOT NULL UNIQUE,
	"group" text,
	"value" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "record_ranks"."collective_solutions" ALTER COLUMN "event_id" SET DATA TYPE text USING "event_id"::text;--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."access_tokens" ADD CONSTRAINT "access_tokens_competition_id_contests_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "record_ranks"."contests"("competition_id");--> statement-breakpoint
ALTER TABLE "record_ranks"."collective_solutions" ADD CONSTRAINT "collective_solutions_event_id_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "record_ranks"."events"("event_id");--> statement-breakpoint
ALTER TABLE "record_ranks"."posts" ADD CONSTRAINT "posts_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "record_ranks"."users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ADD CONSTRAINT "results_event_id_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "record_ranks"."events"("event_id");--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ADD CONSTRAINT "results_competition_id_contests_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "record_ranks"."contests"("competition_id");--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" ADD CONSTRAINT "rounds_competition_id_contests_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "record_ranks"."contests"("competition_id");--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" ADD CONSTRAINT "rounds_event_id_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "record_ranks"."events"("event_id");