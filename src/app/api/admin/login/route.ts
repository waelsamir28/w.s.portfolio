import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, logActivity, verifyPassword } from "@/lib/auth";
import { clearOldSessions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const attempts = new Map<string, { count: number; first: number }>();

export async function POST(req: Request) {
  try {
    const ip =
      (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]!.trim();
    const now = Date.now();
    const rec = attempts.get(ip);
    if (rec && now - rec.first < 15 * 60 * 1000 && rec.count >= 8) {
      return Response.json({ error: "محاولات كثيرة خاطئة، حاول بعد 15 دقيقة." }, { status: 429 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      username?: string;
      password?: string;
    };
    const username = String(body.username ?? "").trim().slice(0, 60);
    const password = String(body.password ?? "");
    if (!username || !password) {
      return Response.json({ error: "أدخل اسم المستخدم وكلمة المرور." }, { status: 400 });
    }

    const rows = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
    const admin = rows[0];
    const ok = admin && verifyPassword(password, admin.passwordHash);

    if (!ok) {
      const r = attempts.get(ip);
      if (r) r.count += 1;
      else attempts.set(ip, { count: 1, first: now });
      return Response.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة." }, { status: 401 });
    }

    attempts.delete(ip);
    await clearOldSessions();
    await createSession(admin!.id);
    await logActivity(admin!.id, "تسجيل دخول", `دخول إلى لوحة التحكم (${username})`);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[login]", err);
    return Response.json({ error: "خطأ في الخادم." }, { status: 500 });
  }
}
