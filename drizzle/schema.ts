import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  /** Explicit user override. A detected IP-based region is never persisted. */
  languagePreference: varchar("languagePreference", { length: 12 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Explicitly saved personal archive records. The payload is only created by a
 * user-directed save action and stays scoped to its owner via userId.
 */
export const savedArchives = mysqlTable("savedArchives", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 120 }).notNull(),
  birthDatetime: varchar("birthDatetime", { length: 32 }).notNull(),
  targetYear: int("targetYear").notNull(),
  inputJson: text("inputJson").notNull(),
  profileJson: text("profileJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("saved_archives_user_created_idx").on(table.userId, table.createdAt),
]);

export type SavedArchive = typeof savedArchives.$inferSelect;
export type InsertSavedArchive = typeof savedArchives.$inferInsert;

/**
 * A short personal reflection attached to one saved archive and one displayed
 * life theme. Ownership is duplicated deliberately for query isolation.
 */
export const themeNotes = mysqlTable("themeNotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  archiveId: int("archiveId").notNull().references(() => savedArchives.id, { onDelete: "cascade" }),
  themeKey: varchar("themeKey", { length: 24 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("theme_notes_owner_archive_theme_idx").on(table.userId, table.archiveId, table.themeKey),
  index("theme_notes_owner_updated_idx").on(table.userId, table.updatedAt),
]);

export type ThemeNote = typeof themeNotes.$inferSelect;

/**
 * User-directed application for an independent human deep-reading service.
 * Detailed consultation requests remain private to the applicant and project
 * administrators; a saved archive can be associated but is never copied here.
 */
export const consultationRequests = mysqlTable("consultationRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  archiveId: int("archiveId").references(() => savedArchives.id, { onDelete: "cascade" }),
  service: mysqlEnum("service", ["theme_report", "annual_manual", "deep_reading", "collaboration"]).notNull(),
  contactMethod: mysqlEnum("contactMethod", ["account_email", "wechat", "other"]).notNull(),
  contactDetail: varchar("contactDetail", { length: 180 }).notNull(),
  request: text("request").notNull(),
  status: mysqlEnum("status", ["pending", "contacted", "closed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("consultation_requests_user_created_idx").on(table.userId, table.createdAt),
  index("consultation_requests_status_created_idx").on(table.status, table.createdAt),
]);

export type ConsultationRequest = typeof consultationRequests.$inferSelect;
