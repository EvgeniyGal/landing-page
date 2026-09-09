CREATE TYPE "public"."card_state" AS ENUM('new', 'learning', 'review', 'relearning');--> statement-breakpoint
CREATE TYPE "public"."audio_kind" AS ENUM('word', 'example_1', 'example_2', 'example_3');--> statement-breakpoint
CREATE TYPE "public"."review_rating" AS ENUM('again', 'hard', 'good', 'easy');--> statement-breakpoint
CREATE TABLE "decks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(32) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "decks" ("user_id", "name", "is_default")
SELECT "id", 'English', true FROM "users";--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "deck_id" uuid;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "word" text;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "part_of_speech" varchar(64);--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "transcription" text;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "irregular_forms" text;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "examples" jsonb;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "definition" text;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "state" "card_state" DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "step_index" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "ease" real DEFAULT 2.5 NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "interval_days" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "due_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "lapses" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN "reps" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "flashcards" AS f SET "deck_id" = d."id", "word" = COALESCE(f."word", f."input_text")
FROM "decks" AS d WHERE d."user_id" = f."user_id" AND d."is_default" = true;--> statement-breakpoint
ALTER TABLE "flashcards" ALTER COLUMN "deck_id" SET NOT NULL;--> statement-breakpoint
CREATE TABLE "flashcard_audio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flashcard_id" uuid NOT NULL,
	"kind" "audio_kind" NOT NULL,
	"blob_url" text NOT NULL,
	"content_type" varchar(64) DEFAULT 'audio/mpeg' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flashcard_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" "review_rating" NOT NULL,
	"previous_interval_days" real NOT NULL,
	"next_interval_days" real NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_audio" ADD CONSTRAINT "flashcard_audio_flashcard_id_flashcards_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_flashcard_id_flashcards_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "decks_user_idx" ON "decks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_accounts_provider_account_unique" ON "oauth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "oauth_accounts_user_idx" ON "oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "flashcards_deck_due_idx" ON "flashcards" USING btree ("deck_id","due_at");--> statement-breakpoint
CREATE INDEX "flashcards_user_idx" ON "flashcards" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "flashcard_audio_card_kind_unique" ON "flashcard_audio" USING btree ("flashcard_id","kind");--> statement-breakpoint
CREATE INDEX "review_logs_card_idx" ON "review_logs" USING btree ("flashcard_id");
