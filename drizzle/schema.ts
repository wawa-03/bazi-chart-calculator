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
  role: mysqlEnum("role", ["user", "astrologer", "admin"]).default("user").notNull(),
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
  status: mysqlEnum("status", ["pending", "reviewing", "contacted", "scheduled", "closed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("consultation_requests_user_created_idx").on(table.userId, table.createdAt),
  index("consultation_requests_status_created_idx").on(table.status, table.createdAt),
]);

export type ConsultationRequest = typeof consultationRequests.$inferSelect;

/**
 * A user may explicitly submit one saved archive for a human review of
 * structure, following-pattern, or special stem/branch transformation. The
 * source chart remains in the archive and is exposed only to authorized
 * reviewers after this user-directed request.
 */
export const fateReviews = mysqlTable("fateReviews", {
  id: int("id").autoincrement().primaryKey(),
  archiveId: int("archiveId").notNull().references(() => savedArchives.id, { onDelete: "cascade" }),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  reviewStatus: mysqlEnum("reviewStatus", ["pending", "in_review", "published"]).default("pending").notNull(),
  structureVerdict: varchar("structureVerdict", { length: 160 }),
  congGeVerdict: mysqlEnum("congGeVerdict", ["undetermined", "none", "cong_strong", "cong_weak", "other"]).default("undetermined").notNull(),
  specialCombinationVerdict: text("specialCombinationVerdict"),
  rationale: text("rationale"),
  displayCopy: text("displayCopy"),
  reviewerId: int("reviewerId").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("fate_reviews_archive_idx").on(table.archiveId),
  index("fate_reviews_owner_status_idx").on(table.ownerUserId, table.reviewStatus),
  index("fate_reviews_reviewer_updated_idx").on(table.reviewerId, table.updatedAt),
]);

export type FateReview = typeof fateReviews.$inferSelect;

/**
 * Immutable audit entries for a human review. The reviewer workspace can read
 * these entries to understand what changed, while chart owners only receive
 * the current published conclusion.
 */
export const fateReviewRevisions = mysqlTable("fateReviewRevisions", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: int("reviewId").notNull().references(() => fateReviews.id, { onDelete: "cascade" }),
  editorId: int("editorId").notNull().references(() => users.id, { onDelete: "restrict" }),
  beforeJson: text("beforeJson").notNull(),
  afterJson: text("afterJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("fate_review_revisions_review_created_idx").on(table.reviewId, table.createdAt),
  index("fate_review_revisions_editor_created_idx").on(table.editorId, table.createdAt),
]);

export type FateReviewRevision = typeof fateReviewRevisions.$inferSelect;

/**
 * Append-only editorial versions for the short rule/copy notes shown beside
 * automated readings. A new version is created for every edit; publishing
 * archives the preceding published version of the same key.
 */
export const fateRuleVersions = mysqlTable("fateRuleVersions", {
  id: int("id").autoincrement().primaryKey(),
  ruleKey: varchar("ruleKey", { length: 64 }).notNull(),
  version: int("version").notNull(),
  title: varchar("title", { length: 120 }).notNull(),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  editorId: int("editorId").notNull().references(() => users.id, { onDelete: "restrict" }),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("fate_rule_versions_key_version_idx").on(table.ruleKey, table.version),
  index("fate_rule_versions_status_key_idx").on(table.status, table.ruleKey, table.version),
  index("fate_rule_versions_editor_updated_idx").on(table.editorId, table.updatedAt),
]);

export type FateRuleVersion = typeof fateRuleVersions.$inferSelect;
