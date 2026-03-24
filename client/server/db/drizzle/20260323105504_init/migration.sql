-- CREATE SCHEMA "record_ranks"; -- THIS WAS COMMENTED OUT, BECAUSE THE SUPABASE SETUP ALREADY CREATES THE SCHEMA!
--> statement-breakpoint
CREATE TYPE "record_ranks"."state" AS ENUM('ongoing', 'solved', 'archived');--> statement-breakpoint
CREATE TYPE "record_ranks"."contest_state" AS ENUM('created', 'approved', 'ongoing', 'finished', 'published', 'removed');--> statement-breakpoint
CREATE TYPE "record_ranks"."contest_type" AS ENUM('meetup', 'wca-comp', 'comp');--> statement-breakpoint
CREATE TYPE "record_ranks"."event_category" AS ENUM('unofficial', 'wca', 'extreme-bld', 'miscellaneous', 'removed');--> statement-breakpoint
CREATE TYPE "record_ranks"."event_format" AS ENUM('time', 'number', 'multi');--> statement-breakpoint
CREATE TYPE "record_ranks"."round_format" AS ENUM('a', '5', 'm', '3', '2', '1');--> statement-breakpoint
CREATE TYPE "record_ranks"."record_category" AS ENUM('competitions', 'meetups', 'video-based-results');--> statement-breakpoint
CREATE TYPE "record_ranks"."record_type" AS ENUM('WR', 'ER', 'NAR', 'SAR', 'AsR', 'AfR', 'OcR', 'NR');--> statement-breakpoint
CREATE TYPE "record_ranks"."round_proceed" AS ENUM('percentage', 'number');--> statement-breakpoint
CREATE TYPE "record_ranks"."round_type" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', 's', 'f');--> statement-breakpoint
CREATE TABLE "record_ranks"."access_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "record_ranks"."access_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"token_hash" text NOT NULL UNIQUE,
	"competition_id" text NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."accounts" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."sessions" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."users" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text UNIQUE,
	"display_username" text,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"person_id" integer UNIQUE
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."verifications" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."collective_solutions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "record_ranks"."collective_solutions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" text NOT NULL,
	"attempt_number" serial UNIQUE,
	"state" "record_ranks"."state" DEFAULT 'ongoing'::"record_ranks"."state" NOT NULL,
	"scramble" text NOT NULL,
	"solution" text DEFAULT '' NOT NULL,
	"last_user_who_interacted_id" text,
	"users_who_made_moves" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."contests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "record_ranks"."contests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"competition_id" text NOT NULL UNIQUE,
	"state" "record_ranks"."contest_state" DEFAULT 'created'::"record_ranks"."contest_state" NOT NULL,
	"name" text NOT NULL,
	"short_name" varchar(32) NOT NULL,
	"type" "record_ranks"."contest_type" NOT NULL,
	"city" text NOT NULL,
	"region_code" text NOT NULL,
	"venue" text NOT NULL,
	"address" text NOT NULL,
	"latitude_microdegrees" integer NOT NULL,
	"longitude_microdegrees" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"start_time" timestamp,
	"timezone" text,
	"organizer_ids" integer[] NOT NULL,
	"contact" text,
	"description" text,
	"competitor_limit" integer,
	"participants" integer DEFAULT 0 NOT NULL,
	"schedule" jsonb,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contests_meetup_check" CHECK (("type" <> 'meetup'
          AND "start_time" IS NULL
          AND "timezone" IS NULL
          AND "competitor_limit" IS NOT NULL
          AND "schedule" IS NOT NULL)
        OR ("type" = 'meetup'
          AND "start_time" IS NOT NULL
          AND "timezone" IS NOT NULL
          AND "schedule" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "record_ranks"."events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"rank" integer NOT NULL,
	"format" "record_ranks"."event_format" NOT NULL,
	"default_round_format" "record_ranks"."round_format" NOT NULL,
	"participants" integer NOT NULL,
	"submissions_allowed" boolean NOT NULL,
	"removed_wca" boolean NOT NULL,
	"has_memo" boolean NOT NULL,
	"hidden" boolean NOT NULL,
	"description" text,
	"rule" text,
	"important_info" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."persons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "record_ranks"."persons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"localized_name" text,
	"region_code" text NOT NULL,
	"wca_id" varchar(10) UNIQUE,
	"approved" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"created_externally" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."posts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "record_ranks"."posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"post_id" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."record_configs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "record_ranks"."record_configs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"record_type_id" "record_ranks"."record_type" NOT NULL,
	"category" "record_ranks"."record_category" NOT NULL,
	"label" text NOT NULL UNIQUE,
	"active" boolean DEFAULT true NOT NULL,
	"rank" integer NOT NULL,
	"color" varchar(7) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."results" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "record_ranks"."results_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"person_ids" integer[] NOT NULL,
	"region_code" text,
	"super_region_code" text,
	"attempts" jsonb[] NOT NULL,
	"best" bigint NOT NULL,
	"average" bigint NOT NULL,
	"record_category" "record_ranks"."record_category" NOT NULL,
	"regional_single_record" "record_ranks"."record_type",
	"regional_average_record" "record_ranks"."record_type",
	"competition_id" text,
	"round_id" integer,
	"ranking" integer,
	"proceeds" boolean,
	"video_link" text,
	"discussion_link" text,
	"created_by" text,
	"created_externally" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "results_check" CHECK (("competition_id" IS NOT NULL
          AND "record_category" <> 'video-based-results'
          AND "round_id" IS NOT NULL
          AND "ranking" IS NOT NULL)
        OR ("competition_id" IS NULL
          AND "record_category" = 'video-based-results'
          AND "round_id" IS NULL
          AND "ranking" IS NULL
          AND "proceeds" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."rounds" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "record_ranks"."rounds_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"competition_id" text NOT NULL,
	"event_id" text NOT NULL,
	"round_number" smallint NOT NULL,
	"round_type_id" "record_ranks"."round_type" NOT NULL,
	"format" "record_ranks"."round_format" NOT NULL,
	"time_limit_centiseconds" integer,
	"time_limit_cumulative_round_ids" integer[],
	"cutoff_attempt_result" integer,
	"cutoff_number_of_attempts" integer,
	"proceed_type" "record_ranks"."round_proceed",
	"proceed_value" integer,
	"open" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "competition_id_event_id_round_number" UNIQUE("competition_id","event_id","round_number"),
	CONSTRAINT "rounds_timelimit_check" CHECK ("time_limit_cumulative_round_ids" IS NULL OR "time_limit_centiseconds" IS NOT NULL),
	CONSTRAINT "rounds_cutoff_check" CHECK (("cutoff_attempt_result" IS NOT NULL AND "cutoff_number_of_attempts" IS NOT NULL)
        OR ("cutoff_attempt_result" IS NULL AND "cutoff_number_of_attempts" IS NULL)),
	CONSTRAINT "rounds_proceed_check" CHECK (("proceed_type" IS NOT NULL AND "proceed_value" IS NOT NULL)
        OR ("proceed_type" IS NULL AND "proceed_value" IS NULL)),
	CONSTRAINT "rounds_finals_check" CHECK ("round_type_id" <> 'f' OR "proceed_type" IS NULL)
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
CREATE INDEX "accounts_userId_idx" ON "record_ranks"."accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "record_ranks"."sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "record_ranks"."verifications" ("identifier");--> statement-breakpoint
ALTER TABLE "record_ranks"."access_tokens" ADD CONSTRAINT "access_tokens_competition_id_contests_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "record_ranks"."contests"("competition_id") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."access_tokens" ADD CONSTRAINT "access_tokens_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "record_ranks"."users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "record_ranks"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "record_ranks"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."collective_solutions" ADD CONSTRAINT "collective_solutions_event_id_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "record_ranks"."events"("event_id") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."collective_solutions" ADD CONSTRAINT "collective_solutions_last_user_who_interacted_id_users_id_fkey" FOREIGN KEY ("last_user_who_interacted_id") REFERENCES "record_ranks"."users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ADD CONSTRAINT "contests_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "record_ranks"."users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."persons" ADD CONSTRAINT "persons_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "record_ranks"."users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."posts" ADD CONSTRAINT "posts_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "record_ranks"."users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ADD CONSTRAINT "results_event_id_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "record_ranks"."events"("event_id") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ADD CONSTRAINT "results_competition_id_contests_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "record_ranks"."contests"("competition_id") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ADD CONSTRAINT "results_round_id_rounds_id_fkey" FOREIGN KEY ("round_id") REFERENCES "record_ranks"."rounds"("id");--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ADD CONSTRAINT "results_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "record_ranks"."users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" ADD CONSTRAINT "rounds_competition_id_contests_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "record_ranks"."contests"("competition_id") ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" ADD CONSTRAINT "rounds_event_id_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "record_ranks"."events"("event_id") ON UPDATE CASCADE;