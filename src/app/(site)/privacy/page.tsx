import type { Metadata } from "next";
import { ensureSeeded } from "@/lib/seed";
import { getPublishedSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "كيف يتم استخدام بياناتك عبر موقع وائل سمير.",
};

export default async function PrivacyPage() {
  await ensureSeeded();
  const s = await getPublishedSettings();

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container-x max-w-3xl">
        <p className="kicker mb-4">Privacy</p>
        <h1 className="h2 mb-8">{s.footer.privacyTitle}</h1>
        <div className="card p-8 space-y-5">
          {s.footer.privacyBody.split("\n\n").map((para, i) => (
            <p key={i} className="leading-8" style={{ color: "var(--muted)" }}>
              {para.trim()}
            </p>
          ))}
          <div className="gold-line" />
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            آخر تحديث: {new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}
