-- This was later renamed to member_requests
CREATE TABLE "record_ranks"."user_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "record_ranks"."user_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL UNIQUE,
	"requested_role" text,
	"requested_person_id" integer,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "record_ranks"."events" DROP COLUMN "removed_wca";--> statement-breakpoint
ALTER TABLE "record_ranks"."user_requests" ADD CONSTRAINT "user_requests_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "record_ranks"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."user_requests" ADD CONSTRAINT "user_requests_requested_person_id_persons_id_fkey" FOREIGN KEY ("requested_person_id") REFERENCES "record_ranks"."persons"("id") ON DELETE CASCADE;