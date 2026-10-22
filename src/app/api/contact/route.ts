import { db } from "@/db";
import { clientRequests } from "@/db/schema";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const MAX_FILE = 4 * 1024 * 1024; // 4MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

/* حماية بسيطة من الإغراق: حد للطلبات من نفس المصدر */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  hits.set(ip, arr);
  return arr.length >= 5;
}

function clean(v: string | null, max: number): string {
  return (v ?? "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, max);
}

export async function POST(req: Request) {
  try {
    const ip =
      (req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ??
        "unknown").split(",")[0]!.trim();

    if (rateLimited(ip)) {
      return Response.json({ error: "تم استلام طلبات كثيرة خلال وقت قصير، حاول بعد قليل." }, { status: 429 });
    }

    const form = await req.formData().catch(() => null);
    if (!form) return Response.json({ error: "نموذج غير صالح." }, { status: 400 });

    /* حقل خفي (Honeypot) — الروبوتات تملأه والإنسان لا */
    if (String(form.get("website") ?? "") !== "") {
      return Response.json({ ok: true }); // نتظاهر بالنجاح للروبوت
    }

    const name = clean(String(form.get("name") ?? ""), 80);
    const email = clean(String(form.get("email") ?? ""), 120);
    const phone = clean(String(form.get("phone") ?? ""), 30);
    const serviceType = clean(String(form.get("serviceType") ?? ""), 120);
    const description = clean(String(form.get("description") ?? ""), 4000);
    const budget = clean(String(form.get("budget") ?? ""), 120);
    const deadline = clean(String(form.get("deadline") ?? ""), 120);

    if (name.length < 2) return Response.json({ error: "الاسم مطلوب." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return Response.json({ error: "بريد إلكتروني غير صالح." }, { status: 400 });
    }
    if (description.length < 10) {
      return Response.json({ error: "اكتب وصفًا قصيرًا للمشروع (10 أحرف على الأقل)." }, { status: 400 });
    }

    let attachments: string[] = [];
    const file = form.get("attachment");
    if (file && file instanceof File) {
      if (file.size > MAX_FILE) {
        return Response.json({ error: "حجم المرفق يتجاوز 4MB." }, { status: 400 });
      }
      const ext = ALLOWED[file.type];
      if (!ext) {
        return Response.json({ error: "نوع الملف غير مدعوم (صور JPG/PNG/WebP أو PDF فقط)." }, { status: 400 });
      }
      const safeName = `req-${randomBytes(8).toString("hex")}.${ext}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      if (bytes.length > MAX_FILE) {
        return Response.json({ error: "حجم المرفق يتجاوز 4MB." }, { status: 400 });
      }
      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(path.join(UPLOAD_DIR, safeName), bytes);
      attachments = [safeName];
    }

    await db.insert(clientRequests).values({
      name,
      email,
      phone,
      serviceType,
      description,
      budget,
      deadline,
      attachments,
      status: "new",
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return Response.json({ error: "حدث خطأ أثناء الحفظ، حاول مرة أخرى." }, { status: 500 });
  }
}
