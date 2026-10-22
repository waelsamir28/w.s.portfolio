import { randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { admins, sessions, activityLog } from "@/db/schema";
import { and, eq, gt, desc, sql } from "drizzle-orm";

export const SESSION_COOKIE = "wael_admin_session";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const test = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return test.length === expected.length && timingSafeEqual(test, expected);
  } catch {
    return false;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(adminId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db
    .insert(sessions)
    .values({ adminId, tokenHash: hashToken(token), expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearOldSessions(): Promise<void> {
  await db.delete(sessions).where(sql`${sessions.expiresAt} < now()`);
}

export async function getSessionAdmin() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const now = new Date();
  const rows = await db
    .select({ admin: admins })
    .from(sessions)
    .innerJoin(admins, eq(sessions.adminId, admins.id))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, now)))
    .limit(1);
  return rows[0] ? rows[0].admin : null;
}

export async function logoutAdmin(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  jar.delete(SESSION_COOKIE);
}

/** يجب استخدامه داخل Route Handlers — يرمي 401 إذا لم يكن الزائر مديرًا. */
export async function requireAdmin() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }
  return admin;
}

export async function logActivity(adminId: number | null, action: string, details = "") {
  try {
    await db.insert(activityLog).values({ adminId, action, details });
  } catch {
    /* لا نوقف العملية الأصلية بسبب فشل السجل */
  }
}

export async function recentActivity(limit = 8) {
  return db
    .select({
      action: activityLog.action,
      details: activityLog.details,
      createdAt: activityLog.createdAt,
      username: admins.username,
    })
    .from(activityLog)
    .leftJoin(admins, eq(activityLog.adminId, admins.id))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}
