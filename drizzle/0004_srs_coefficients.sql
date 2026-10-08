ALTER TABLE "user_preferences" ADD COLUMN "srs_interval_modifier" real DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "srs_starting_ease" real DEFAULT 2.5 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "srs_easy_bonus" real DEFAULT 1.3 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "srs_hard_interval" real DEFAULT 0.8 NOT NULL;
