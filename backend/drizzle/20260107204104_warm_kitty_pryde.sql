ALTER TABLE "family_members" ADD COLUMN "color" text DEFAULT '#4F46E5' NOT NULL;--> statement-breakpoint
ALTER TABLE "family_members" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "family_style_complete" boolean DEFAULT false NOT NULL;