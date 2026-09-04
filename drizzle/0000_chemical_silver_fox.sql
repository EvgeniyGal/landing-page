CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('invited', 'active', 'disabled');--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"encrypted_telegram_bot_token" text,
	"telegram_bot_token_last4" varchar(4),
	"telegram_bot_username" varchar(255),
	"encrypted_openai_api_key" text,
	"openai_api_key_last4" varchar(4),
	"openai_model" varchar(128),
	"flashcard_prompt" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"input_text" text NOT NULL,
	"output_text" text NOT NULL,
	"model" varchar(128) NOT NULL,
	"prompt_snapshot" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"telegram_user_id" text NOT NULL,
	"telegram_username" varchar(255),
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_link_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"name" varchar(255),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"status" "user_status" DEFAULT 'invited' NOT NULL,
	"email_verified" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_tokens" ADD CONSTRAINT "invite_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_connections" ADD CONSTRAINT "telegram_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_link_tokens" ADD CONSTRAINT "telegram_link_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "invite_tokens_hash_unique" ON "invite_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_hash_unique" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_connections_user_unique" ON "telegram_connections" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_connections_telegram_user_unique" ON "telegram_connections" USING btree ("telegram_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_link_tokens_hash_unique" ON "telegram_link_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");