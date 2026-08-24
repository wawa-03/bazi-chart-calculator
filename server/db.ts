import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { consultationRequests, fateReviewRevisions, fateReviews, fateRuleVersions, InsertSavedArchive, InsertUser, savedArchives, themeNotes, users } from "../drizzle/schema";
import { ENV } from './_core/env';

export type ArchivePayload = {
  input: {
    datetime: string;
    longitude: number;
    latitude: number;
    gender: "male" | "female";
  };
  profile: {
    name: string;
    birthPlace: string;
    residence: string;
    year: number;
  };
};

export type ConsultationPayload = {
  service: "theme_report" | "annual_manual" | "deep_reading" | "collaboration";
  archiveId?: number;
  contactMethod: "account_email" | "wechat" | "other";
  contactDetail: string;
  request: string;
};

export type ConsultationStatus = "pending" | "reviewing" | "contacted" | "scheduled" | "closed";
export type FateReviewStatus = "pending" | "in_review" | "published";
export type CongGeVerdict = "undetermined" | "none" | "cong_strong" | "cong_weak" | "other";
export type FateReviewUpdate = {
  id: number;
  reviewStatus: FateReviewStatus;
  structureVerdict?: string;
  congGeVerdict: CongGeVerdict;
  specialCombinationVerdict?: string;
  rationale?: string;
  displayCopy?: string;
};
export type FateRuleDraft = { ruleKey: string; title: string; body: string };

function reviewSnapshot(review: typeof fateReviews.$inferSelect) {
  return {
    reviewStatus: review.reviewStatus,
    structureVerdict: review.structureVerdict,
    congGeVerdict: review.congGeVerdict,
    specialCombinationVerdict: review.specialCombinationVerdict,
    rationale: review.rationale,
    displayCopy: review.displayCopy,
  };
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function setUserLanguagePreference(userId: number, locale: string) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  await db.update(users).set({ languagePreference: locale }).where(eq(users.id, userId));
  return { locale };
}

export async function createSavedArchive(userId: number, payload: ArchivePayload) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");

  const values: InsertSavedArchive = {
    userId,
    label: payload.profile.name.trim() || "未署名年度归档",
    birthDatetime: payload.input.datetime,
    targetYear: payload.profile.year,
    inputJson: JSON.stringify(payload.input),
    profileJson: JSON.stringify(payload.profile),
  };
  const result = await db.insert(savedArchives).values(values);
  const id = Number(result[0].insertId);
  const created = await db.select().from(savedArchives)
    .where(and(eq(savedArchives.id, id), eq(savedArchives.userId, userId)))
    .limit(1);
  return created[0];
}

export async function listSavedArchives(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  return db.select().from(savedArchives)
    .where(eq(savedArchives.userId, userId))
    .orderBy(desc(savedArchives.createdAt));
}

export async function deleteSavedArchive(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  const result = await db.delete(savedArchives)
    .where(and(eq(savedArchives.id, id), eq(savedArchives.userId, userId)));
  return { deleted: result[0].affectedRows > 0 };
}

export async function listThemeNotes(userId: number, archiveId: number) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  return db.select().from(themeNotes)
    .where(and(eq(themeNotes.userId, userId), eq(themeNotes.archiveId, archiveId)))
    .orderBy(desc(themeNotes.updatedAt));
}

export async function listAllThemeNotes(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  return db.select().from(themeNotes)
    .where(eq(themeNotes.userId, userId))
    .orderBy(desc(themeNotes.updatedAt));
}

export async function saveThemeNote(userId: number, archiveId: number, themeKey: string, content: string) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  await db.insert(themeNotes).values({ userId, archiveId, themeKey, content }).onDuplicateKeyUpdate({
    set: { content, updatedAt: new Date() },
  });
  const saved = await db.select().from(themeNotes)
    .where(and(eq(themeNotes.userId, userId), eq(themeNotes.archiveId, archiveId), eq(themeNotes.themeKey, themeKey)))
    .limit(1);
  return saved[0];
}

export async function deleteThemeNote(userId: number, archiveId: number, themeKey: string) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  const result = await db.delete(themeNotes).where(and(
    eq(themeNotes.userId, userId),
    eq(themeNotes.archiveId, archiveId),
    eq(themeNotes.themeKey, themeKey),
  ));
  return { deleted: result[0].affectedRows > 0 };
}

export async function createConsultationRequest(userId: number, payload: ConsultationPayload) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  const result = await db.insert(consultationRequests).values({
    userId,
    archiveId: payload.archiveId,
    service: payload.service,
    contactMethod: payload.contactMethod,
    contactDetail: payload.contactDetail,
    request: payload.request,
  });
  const id = Number(result[0].insertId);
  const created = await db.select().from(consultationRequests)
    .where(and(eq(consultationRequests.id, id), eq(consultationRequests.userId, userId)))
    .limit(1);
  return created[0];
}

export async function listConsultationRequests(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  return db.select().from(consultationRequests)
    .where(eq(consultationRequests.userId, userId))
    .orderBy(desc(consultationRequests.createdAt));
}

export async function deleteConsultationRequest(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  const result = await db.delete(consultationRequests)
    .where(and(eq(consultationRequests.id, id), eq(consultationRequests.userId, userId)));
  return { deleted: result[0].affectedRows > 0 };
}

export async function listAllConsultationRequests() {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  return db.select().from(consultationRequests).orderBy(desc(consultationRequests.createdAt));
}

export async function updateConsultationRequestStatus(id: number, status: ConsultationStatus) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  await db.update(consultationRequests).set({ status, updatedAt: new Date() }).where(eq(consultationRequests.id, id));
  const updated = await db.select().from(consultationRequests).where(eq(consultationRequests.id, id)).limit(1);
  return updated[0];
}

async function ownedArchive(userId: number, archiveId: number) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  const archive = await db.select().from(savedArchives)
    .where(and(eq(savedArchives.id, archiveId), eq(savedArchives.userId, userId))).limit(1);
  if (!archive[0]) throw new Error("未找到可提交复核的私有命书。");
  return { db, archive: archive[0] };
}

/** A review can only be created from an archive intentionally selected by its owner. */
export async function requestFateReview(userId: number, archiveId: number) {
  const { db } = await ownedArchive(userId, archiveId);
  const existing = await db.select().from(fateReviews).where(eq(fateReviews.archiveId, archiveId)).limit(1);
  if (existing[0]) return existing[0];
  const inserted = await db.insert(fateReviews).values({ archiveId, ownerUserId: userId });
  const id = Number(inserted[0].insertId);
  const created = await db.select().from(fateReviews).where(and(eq(fateReviews.id, id), eq(fateReviews.ownerUserId, userId))).limit(1);
  return created[0];
}

export async function getFateReviewForOwner(userId: number, archiveId: number) {
  const { db } = await ownedArchive(userId, archiveId);
  const review = await db.select().from(fateReviews)
    .where(and(eq(fateReviews.archiveId, archiveId), eq(fateReviews.ownerUserId, userId))).limit(1);
  return review[0] || null;
}

/** Authorized reviewers see only charts that an owner explicitly submitted. */
export async function listSubmittedFateReviews() {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  return db.select({
    review: fateReviews,
    archive: {
      id: savedArchives.id,
      label: savedArchives.label,
      birthDatetime: savedArchives.birthDatetime,
      inputJson: savedArchives.inputJson,
      profileJson: savedArchives.profileJson,
      targetYear: savedArchives.targetYear,
    },
  }).from(fateReviews).innerJoin(savedArchives, eq(fateReviews.archiveId, savedArchives.id)).orderBy(desc(fateReviews.updatedAt));
}

export async function updateFateReview(reviewerId: number, payload: FateReviewUpdate) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  const existing = await db.select().from(fateReviews).where(eq(fateReviews.id, payload.id)).limit(1);
  if (!existing[0]) throw new Error("复核记录不存在。");
  const isPublished = payload.reviewStatus === "published";
  await db.update(fateReviews).set({
    reviewStatus: payload.reviewStatus,
    structureVerdict: payload.structureVerdict?.trim() || null,
    congGeVerdict: payload.congGeVerdict,
    specialCombinationVerdict: payload.specialCombinationVerdict?.trim() || null,
    rationale: payload.rationale?.trim() || null,
    displayCopy: payload.displayCopy?.trim() || null,
    reviewerId,
    reviewedAt: isPublished ? new Date() : existing[0].reviewedAt,
    updatedAt: new Date(),
  }).where(eq(fateReviews.id, payload.id));
  const updated = await db.select().from(fateReviews).where(eq(fateReviews.id, payload.id)).limit(1);
  if (updated[0]) {
    await db.insert(fateReviewRevisions).values({
      reviewId: payload.id,
      editorId: reviewerId,
      beforeJson: JSON.stringify(reviewSnapshot(existing[0])),
      afterJson: JSON.stringify(reviewSnapshot(updated[0])),
    });
  }
  return updated[0];
}

export async function listFateReviewRevisions(reviewId: number) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  return db.select().from(fateReviewRevisions)
    .where(eq(fateReviewRevisions.reviewId, reviewId))
    .orderBy(desc(fateReviewRevisions.createdAt));
}

export async function listFateRuleVersions() {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  return db.select().from(fateRuleVersions).orderBy(desc(fateRuleVersions.updatedAt));
}

export async function listPublishedFateRules() {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  return db.select().from(fateRuleVersions).where(eq(fateRuleVersions.status, "published")).orderBy(desc(fateRuleVersions.publishedAt));
}

/** Each edit creates a new version instead of overwriting a published rule. */
export async function createFateRuleDraft(editorId: number, payload: FateRuleDraft) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  const existing = await db.select({ version: fateRuleVersions.version }).from(fateRuleVersions)
    .where(eq(fateRuleVersions.ruleKey, payload.ruleKey));
  const version = Math.max(0, ...existing.map((item) => item.version)) + 1;
  const inserted = await db.insert(fateRuleVersions).values({
    ruleKey: payload.ruleKey,
    version,
    title: payload.title.trim(),
    body: payload.body.trim(),
    editorId,
  });
  const id = Number(inserted[0].insertId);
  const created = await db.select().from(fateRuleVersions).where(eq(fateRuleVersions.id, id)).limit(1);
  return created[0];
}

export async function publishFateRuleVersion(editorId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("数据库暂不可用，请稍后重试。");
  const target = await db.select().from(fateRuleVersions).where(eq(fateRuleVersions.id, id)).limit(1);
  if (!target[0]) throw new Error("规则版本不存在。");
  await db.update(fateRuleVersions).set({ status: "archived", updatedAt: new Date() })
    .where(and(eq(fateRuleVersions.ruleKey, target[0].ruleKey), eq(fateRuleVersions.status, "published")));
  await db.update(fateRuleVersions).set({ status: "published", editorId, publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(fateRuleVersions.id, id));
  const published = await db.select().from(fateRuleVersions).where(eq(fateRuleVersions.id, id)).limit(1);
  return published[0];
}
