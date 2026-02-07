import { eq, and, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, members, seats, attendance } from "../drizzle/schema";
import { ENV } from './_core/env';

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

/**
 * Get members by generation
 */
export async function getMembersByGeneration(generation: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(members).where(eq(members.generation, generation));
}

/**
 * Get seat by name and generation
 */
export async function getSeatByName(name: string, generation: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(seats)
    .where(and(eq(seats.name, name), eq(seats.generation, generation)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Register attendance
 */
export async function registerAttendance(
  name: string,
  generation: number,
  tableNumber: string,
  seatPosition: number
) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(attendance).values({
    name,
    generation,
    tableNumber,
    seatPosition,
    syncedToSheet: "pending",
  });
  return result;
}

/**
 * Get latest attendance records
 */
export async function getLatestAttendance(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(attendance)
    .orderBy(desc(attendance.createdAt))
    .limit(limit);
}

/**
 * Get all attendance records
 */
export async function getAllAttendance() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendance).orderBy(desc(attendance.createdAt));
}

/**
 * Get pending attendance records for sheet sync
 */
export async function getPendingAttendanceForSync() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(attendance)
    .where(eq(attendance.syncedToSheet, "pending"))
    .orderBy(asc(attendance.createdAt));
}

/**
 * Update attendance sync status
 */
export async function updateAttendanceSyncStatus(
  id: number,
  status: "synced" | "failed"
) {
  const db = await getDb();
  if (!db) return undefined;
  return db
    .update(attendance)
    .set({ syncedToSheet: status })
    .where(eq(attendance.id, id));
}
