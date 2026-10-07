ALTER TABLE "user_preferences" ADD COLUMN "word_text_scale" real DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "example_text_scale" real DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "explanation_text_scale" real DEFAULT 1 NOT NULL;
