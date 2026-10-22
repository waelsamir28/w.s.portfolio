import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, logActivity } from "@/lib/auth";
import {
  getDraftSettings,
  getPublishedSettings,
  mergeSettings,
  saveDraft,
  publishDraft,
  restoreDefaults,
} from "@/lib/settings";
import type { SiteSettingsDoc } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const [draft, published] = await Promise.all([getDraftSettings(), getPublishedSettings()]);
  return Response.json({
    draft,
    published,
    dirty: JSON.stringify(draft) !== JSON.stringify(published),
  });
}

/** حفظ كامل لمستند المسودة (المحتوى + التصميم معًا). */
export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  try {
    const body = (await req.json()) as { draft?: Partial<SiteSettingsDoc> };
    if (!body.draft || typeof body.draft !== "object") {
      return Response.json({ error: "بيانات غير صالحة." }, { status: 400 });
    }
    const current = await getDraftSettings();
    const merged = mergeSettings({ ...current, ...body.draft });
    await saveDraft(merged);
    await logActivity(auth.id, "حفظ إعدادات", "تم حفظ مسودة المحتوى/التصميم");
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[settings.put]", err);
    return Response.json({ error: "فشل الحفظ." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  try {
    const body = (await req.json().catch(() => ({}))) as { action?: string };
    if (body.action === "restore") {
      await restoreDefaults();
      await logActivity(auth.id, "استعادة التصميم", "إعادة الإعدادات الافتراضية");
    } else {
      await publishDraft();
      await logActivity(auth.id, "نشر", "نشر إعدادات الموقع على الواجهة");
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[settings.post]", err);
    return Response.json({ error: "فشل العملية." }, { status: 500 });
  }
}

