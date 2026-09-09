import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);
export const userStatusEnum = pgEnum("user_status", ["invited", "active", "disabled"]);
export const cardStateEnum = pgEnum("card_state", ["new", "learning", "review", "relearning"]);
export const audioKindEnum = pgEnum("audio_kind", ["word", "example_1", "example_2", "example_3"]);
export const reviewRatingEnum = pgEnum("review_rating", ["again", "hard", "good", "easy"]);

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

export const oauthAccounts = pgTable("oauth_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 32 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("oauth_accounts_provider_account_unique").on(table.provider, table.providerAccountId),
  index("oauth_accounts_user_idx").on(table.userId),
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

export const decks = pgTable("decks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("decks_user_idx").on(table.userId)]);

export const flashcards = pgTable("flashcards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  deckId: uuid("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  inputText: text("input_text").notNull(),
  outputText: text("output_text").notNull(),
  word: text("word"),
  partOfSpeech: varchar("part_of_speech", { length: 64 }),
  transcription: text("transcription"),
  irregularForms: text("irregular_forms"),
  examples: jsonb("examples").$type<string[]>(),
  definition: text("definition"),
  state: cardStateEnum("state").notNull().default("new"),
  stepIndex: integer("step_index").notNull().default(0),
  ease: real("ease").notNull().default(2.5),
  intervalDays: real("interval_days").notNull().default(0),
  dueAt: timestamp("due_at", { withTimezone: true }).defaultNow().notNull(),
  lapses: integer("lapses").notNull().default(0),
  reps: integer("reps").notNull().default(0),
  model: varchar("model", { length: 128 }).notNull(),
  promptSnapshot: text("prompt_snapshot").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("flashcards_deck_due_idx").on(table.deckId, table.dueAt),
  index("flashcards_user_idx").on(table.userId),
]);

export const flashcardAudio = pgTable("flashcard_audio", {
  id: uuid("id").defaultRandom().primaryKey(),
  flashcardId: uuid("flashcard_id")
    .notNull()
    .references(() => flashcards.id, { onDelete: "cascade" }),
  kind: audioKindEnum("kind").notNull(),
  blobUrl: text("blob_url").notNull(),
  contentType: varchar("content_type", { length: 64 }).notNull().default("audio/mpeg"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("flashcard_audio_card_kind_unique").on(table.flashcardId, table.kind)]);

export const reviewLogs = pgTable("review_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  flashcardId: uuid("flashcard_id")
    .notNull()
    .references(() => flashcards.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: reviewRatingEnum("rating").notNull(),
  previousIntervalDays: real("previous_interval_days").notNull(),
  nextIntervalDays: real("next_interval_days").notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("review_logs_card_idx").on(table.flashcardId)]);

export const usersRelations = relations(users, ({ many }) => ({
  decks: many(decks),
  flashcards: many(flashcards),
  oauthAccounts: many(oauthAccounts),
}));

export const decksRelations = relations(decks, ({ one, many }) => ({
  user: one(users, { fields: [decks.userId], references: [users.id] }),
  flashcards: many(flashcards),
}));

export const flashcardsRelations = relations(flashcards, ({ one, many }) => ({
  user: one(users, { fields: [flashcards.userId], references: [users.id] }),
  deck: one(decks, { fields: [flashcards.deckId], references: [decks.id] }),
  audio: many(flashcardAudio),
  reviews: many(reviewLogs),
}));

export const flashcardAudioRelations = relations(flashcardAudio, ({ one }) => ({
  flashcard: one(flashcards, { fields: [flashcardAudio.flashcardId], references: [flashcards.id] }),
}));

export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, { fields: [oauthAccounts.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AppSettings = typeof appSettings.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type Deck = typeof decks.$inferSelect;
export type FlashcardAudio = typeof flashcardAudio.$inferSelect;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserStatus = (typeof userStatusEnum.enumValues)[number];
export type CardState = (typeof cardStateEnum.enumValues)[number];
export type AudioKind = (typeof audioKindEnum.enumValues)[number];
export type ReviewRating = (typeof reviewRatingEnum.enumValues)[number];
