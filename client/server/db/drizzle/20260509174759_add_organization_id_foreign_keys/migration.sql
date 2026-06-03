ALTER TABLE "record_ranks"."contests" ADD COLUMN "organization_id" text NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE "record_ranks"."events" ADD COLUMN "organization_id" text NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE "record_ranks"."persons" ADD COLUMN "organization_id" text NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE "record_ranks"."posts" ADD COLUMN "organization_id" text NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE "record_ranks"."record_configs" ADD COLUMN "organization_id" text NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE "record_ranks"."regions" ADD COLUMN "organization_id" text NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ADD COLUMN "organization_id" text NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" ADD COLUMN "organization_id" text NOT NULL DEFAULT 'default';--> statement-breakpoint
-- CUSTOM ADDITION FOR RECORDRANKS: {
INSERT INTO "record_ranks"."organizations" ("id", "name", "slug", "created_at", "metadata") VALUES
  ('default', 'Default Organization', 'default', NOW(), '{"private":false,"contactEmail":"","plan":"custom","showDonationLinks":true}');
--> statement-breakpoint
ALTER TABLE "record_ranks"."contests" ALTER COLUMN "organization_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "record_ranks"."events" ALTER COLUMN "organization_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "record_ranks"."persons" ALTER COLUMN "organization_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "record_ranks"."posts" ALTER COLUMN "organization_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "record_ranks"."record_configs" ALTER COLUMN "organization_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "record_ranks"."regions" ALTER COLUMN "organization_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ALTER COLUMN "organization_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" ALTER COLUMN "organization_id" DROP DEFAULT;--> statement-breakpoint
-- }
ALTER TABLE "record_ranks"."contests" ADD CONSTRAINT "contests_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "record_ranks"."organizations"("id");--> statement-breakpoint
ALTER TABLE "record_ranks"."events" ADD CONSTRAINT "events_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "record_ranks"."organizations"("id");--> statement-breakpoint
ALTER TABLE "record_ranks"."persons" ADD CONSTRAINT "persons_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "record_ranks"."organizations"("id");--> statement-breakpoint
ALTER TABLE "record_ranks"."posts" ADD CONSTRAINT "posts_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "record_ranks"."organizations"("id");--> statement-breakpoint
ALTER TABLE "record_ranks"."record_configs" ADD CONSTRAINT "record_configs_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "record_ranks"."organizations"("id");--> statement-breakpoint
ALTER TABLE "record_ranks"."regions" ADD CONSTRAINT "regions_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "record_ranks"."organizations"("id");--> statement-breakpoint
ALTER TABLE "record_ranks"."results" ADD CONSTRAINT "results_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "record_ranks"."organizations"("id");--> statement-breakpoint
ALTER TABLE "record_ranks"."rounds" ADD CONSTRAINT "rounds_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "record_ranks"."organizations"("id");--> statement-breakpoint
