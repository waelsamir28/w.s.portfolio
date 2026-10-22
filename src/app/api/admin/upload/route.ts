import { put } from "@vercel/blob";
import { randomBytes } from "crypto";
import { requireAdmin, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/** فحص أمان للملفات SVG (منع سكربتات أو روابط خطرة) */
function svgSafe(content: string): boolean {
  const lower = content.toLowerCase();
  return (
    !lower.includes("<script") &&
    !lower.includes("javascript:") &&
    !lower.includes("onload") &&
    !lower.includes("onerror") &&
    !lower.includes("<foreignobject") &&
    !lower.includes("<iframe")
  );
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return Response.json({ error: "لا يوجد ملف." }, { status: 400 });
    }

    const asImage = form.get("as") === "video";
    const table = asImage ? VIDEO_TYPES : IMAGE_TYPES;
    const ext = table[file.type];
    if (!ext) {
      return Response.json({
        error: asImage ? "فيديو غير مدعوم (MP4/WebM فقط)." : "صورة غير مدعومة (JPG/PNG/WebP/SVG فقط).",
      }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return Response.json({ error: "حجم الملف يتجاوز 10MB." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length === 0) return Response.json({ error: "الملف فارغ." }, { status: 400 });

    if (ext === "svg") {
      const text = bytes.toString("utf8");
      if (text.length > 300_000 || !svgSafe(text)) {
        return Response.json({ error: "ملف SVG غير آمن." }, { status: 400 });
      }
    }

    const safeName = `uploads/u-${Date.now().toString(36)}-${randomBytes(5).toString("hex")}.${ext}`;
    const blob = await put(safeName, bytes, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });

    await logActivity(auth.id, "رفع ملف إلى Blob", blob.pathname);
    return Response.json({ url: blob.url, name: blob.pathname, size: bytes.length });
  } catch (err) {
    console.error("[upload]", err);
    return Response.json({ error: "فشل رفع الملف." }, { status: 500 });
  }
}
