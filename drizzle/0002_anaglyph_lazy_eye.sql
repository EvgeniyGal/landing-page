CREATE TYPE "public"."anaglyph_background" AS ENUM('black', 'gray', 'white');--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"lazy_eye_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anaglyph_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"left_hue" real DEFAULT 0 NOT NULL,
	"left_lightness" real DEFAULT 50 NOT NULL,
	"right_hue" real DEFAULT 180 NOT NULL,
	"right_lightness" real DEFAULT 50 NOT NULL,
	"background" "anaglyph_background" DEFAULT 'black' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anaglyph_profiles" ADD CONSTRAINT "anaglyph_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "anaglyph_profiles_user_idx" ON "anaglyph_profiles" USING btree ("user_id");
