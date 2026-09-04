import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);
export const userStatusEnum = pgEnum("user_status", ["invited", "active", "disabled"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: text("password_hash"),
  name: varchar("name", { length: 255 }),
  role: userRoleEnum("role").notNull().default("user"),
  status: userStatusEnum("status").notNull().default("invited"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("users_email_unique").on(table.email)]);

export const inviteTokens = pgTable("invite_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("invite_tokens_hash_unique").on(table.tokenHash)]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("password_reset_tokens_hash_unique").on(table.tokenHash)]);

export const telegramLinkTokens = pgTable("telegram_link_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("telegram_link_tokens_hash_unique").on(table.tokenHash)]);

export const telegramConnections = pgTable("telegram_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  telegramUserId: text("telegram_user_id").notNull(),
  telegramUsername: varchar("telegram_username", { length: 255 }),
  linkedAt: timestamp("linked_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("telegram_connections_user_unique").on(table.userId),
  uniqueIndex("telegram_connections_telegram_user_unique").on(table.telegramUserId),
]);

export const APP_SETTINGS_ID = 1;

export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey(),
  encryptedTelegramBotToken: text("encrypted_telegram_bot_token"),
  telegramBotTokenLast4: varchar("telegram_bot_token_last4", { length: 4 }),
  telegramBotUsername: varchar("telegram_bot_username", { length: 255 }),
  encryptedOpenaiApiKey: text("encrypted_openai_api_key"),
  openaiApiKeyLast4: varchar("openai_api_key_last4", { length: 4 }),
  openaiModel: varchar("openai_model", { length: 128 }),
  flashcardPrompt: text("flashcard_prompt").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const flashcards = pgTable("flashcards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  inputText: text("input_text").notNull(),
  outputText: text("output_text").notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  promptSnapshot: text("prompt_snapshot").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AppSettings = typeof appSettings.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserStatus = (typeof userStatusEnum.enumValues)[number];
