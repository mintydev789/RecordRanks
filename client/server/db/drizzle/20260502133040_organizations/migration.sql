CREATE TABLE "record_ranks"."invitations" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."members" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_ranks"."organizations" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text
);
--> statement-breakpoint
ALTER TABLE "record_ranks"."sessions" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
ALTER TABLE "record_ranks"."persons" ADD COLUMN "member_id" text;--> statement-breakpoint
CREATE INDEX "invitations_organizationId_idx" ON "record_ranks"."invitations" ("organization_id");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "record_ranks"."invitations" ("email");--> statement-breakpoint
CREATE INDEX "members_organizationId_idx" ON "record_ranks"."members" ("organization_id");--> statement-breakpoint
CREATE INDEX "members_userId_idx" ON "record_ranks"."members" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_uidx" ON "record_ranks"."organizations" ("slug");--> statement-breakpoint
ALTER TABLE "record_ranks"."invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "record_ranks"."organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "record_ranks"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."members" ADD CONSTRAINT "members_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "record_ranks"."organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."members" ADD CONSTRAINT "members_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "record_ranks"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "record_ranks"."persons" ADD CONSTRAINT "persons_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "record_ranks"."members"("id") ON DELETE SET NULL;