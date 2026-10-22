import { readFile, stat } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
};

/** خدمة ملفات الرفع — الأسماء مُولَّدة داخليًا (لا يمكن تجاوز المجلد). */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-zA-Z0-9._-]+$/.test(name) || name.includes("..")) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const filePath = path.join(UPLOAD_DIR, name);
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new Response("Not Found", { status: 404 });
    const data = await readFile(filePath);
    const ext = path.extname(name).slice(1).toLowerCase();
    const type = TYPES[ext] ?? "application/octet-stream";
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
