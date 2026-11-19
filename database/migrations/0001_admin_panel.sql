CREATE TYPE "public"."announcement_kind" AS ENUM('announcement', 'news');--> statement-breakpoint
CREATE TYPE "public"."announcement_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('upcoming', 'ongoing', 'completed', 'on_hold');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"kind" "announcement_kind" DEFAULT 'news' NOT NULL,
	"title" varchar(200) NOT NULL,
	"summary" text NOT NULL,
	"body" text[] DEFAULT '{}'::text[] NOT NULL,
	"image_url" varchar(300),
	"publish_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "announcement_status" DEFAULT 'draft' NOT NULL,
	"show_on_homepage" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "announcements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" date DEFAULT CURRENT_DATE NOT NULL,
	"path" varchar(300) NOT NULL,
	"visitor_hash" varchar(64) NOT NULL,
	"referrer" varchar(300),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"ip" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_resets_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "project_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "project_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"url" varchar(300) NOT NULL,
	"caption" varchar(200),
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(200) NOT NULL,
	"category_id" integer,
	"sector_id" integer,
	"client" varchar(200),
	"location" varchar(160),
	"project_value" varchar(80),
	"started_on" date,
	"completed_on" date,
	"summary" text NOT NULL,
	"description" text[] DEFAULT '{}'::text[] NOT NULL,
	"highlights" text[] DEFAULT '{}'::text[] NOT NULL,
	"cover_image_url" varchar(300),
	"status" "project_status" DEFAULT 'ongoing' NOT NULL,
	"publish_status" "publish_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug"),
	CONSTRAINT "projects_dates" CHECK ("projects"."completed_on" IS NULL OR "projects"."started_on" IS NULL OR "projects"."completed_on" >= "projects"."started_on")
);
--> statement-breakpoint
ALTER TABLE "job_applications" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
-- Data: map the previous application statuses to the new set.
UPDATE "job_applications" SET "status" = CASE "status" WHEN 'new' THEN 'pending' WHEN 'interview' THEN 'shortlisted' WHEN 'hired' THEN 'selected' ELSE "status" END;--> statement-breakpoint
ALTER TABLE "job_applications" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."application_status";--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('pending', 'shortlisted', 'rejected', 'selected');--> statement-breakpoint
ALTER TABLE "job_applications" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."application_status";--> statement-breakpoint
ALTER TABLE "job_applications" ALTER COLUMN "status" SET DATA TYPE "public"."application_status" USING "status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "enquiries" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
-- Data: 'spam' is no longer a status; such enquiries are closed.
UPDATE "enquiries" SET "status" = 'closed' WHERE "status" = 'spam';--> statement-breakpoint
ALTER TABLE "enquiries" ALTER COLUMN "status" SET DEFAULT 'new'::text;--> statement-breakpoint
DROP TYPE "public"."enquiry_status";--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
ALTER TABLE "enquiries" ALTER COLUMN "status" SET DEFAULT 'new'::"public"."enquiry_status";--> statement-breakpoint
ALTER TABLE "enquiries" ALTER COLUMN "status" SET DATA TYPE "public"."enquiry_status" USING "status"::"public"."enquiry_status";--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "role" SET DEFAULT 'admin';--> statement-breakpoint
ALTER TABLE "job_openings" ALTER COLUMN "employment_type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "job_openings" ALTER COLUMN "employment_type" SET DATA TYPE varchar(40) USING "employment_type"::text;--> statement-breakpoint
ALTER TABLE "job_openings" ALTER COLUMN "employment_type" SET DEFAULT 'Full-time';--> statement-breakpoint
ALTER TABLE "activity_log" ADD COLUMN "details" jsonb;--> statement-breakpoint
ALTER TABLE "activity_log" ADD COLUMN "ip" varchar(64);--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD COLUMN "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "username" varchar(60);--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "follow_up_on" date;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcements_public_idx" ON "announcements" USING btree ("status","publish_at");--> statement-breakpoint
CREATE INDEX "page_views_created_idx" ON "page_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "page_views_day_visitor_idx" ON "page_views" USING btree ("day","visitor_hash");--> statement-breakpoint
CREATE INDEX "password_resets_user_idx" ON "password_resets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_images_project_idx" ON "project_images" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projects_public_idx" ON "projects" USING btree ("publish_status","status");--> statement-breakpoint
CREATE INDEX "projects_category_idx" ON "projects" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "projects_sector_idx" ON "projects" USING btree ("sector_id");--> statement-breakpoint
CREATE INDEX "activity_log_entity_idx" ON "activity_log" USING btree ("entity");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_username_uq" ON "admin_users" USING btree (lower("username"));--> statement-breakpoint
-- Data: single administrator. The first active admin gets the username "admin"; any other accounts are deactivated.
UPDATE "admin_users" SET "username" = 'admin' WHERE "id" = (SELECT min("id") FROM "admin_users" WHERE "role" = 'admin' AND "active") AND "username" IS NULL;--> statement-breakpoint
UPDATE "admin_users" SET "active" = false WHERE "role" <> 'admin';
