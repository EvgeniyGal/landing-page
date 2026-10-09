ALTER TABLE "anaglyph_profiles" ADD COLUMN "strong_eye" varchar(5) DEFAULT 'right' NOT NULL;--> statement-breakpoint
ALTER TABLE "anaglyph_profiles" ADD COLUMN "strong_eye_weaken" real DEFAULT 0 NOT NULL;
