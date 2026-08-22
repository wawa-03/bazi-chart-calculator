import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertSavedArchive, InsertUser, savedArchives, users } from "../drizzle/schema";
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
