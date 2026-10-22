"use client";

import { useEffect, useMemo, useState } from "react";
import { api, Field, SaveState, Toggle } from "@/components/admin/ui";
import type { SiteSettingsDoc, DesignSettings } from "@/db/schema";
import { SECTION_LABELS } from "@/lib/constants";
import { IconChevronDown, IconChevronUp } from "../projects/[id]/icons-local";

const COLOR_FIELDS: { key: keyof DesignSettings["colors"]; label: string }[] = [
  { key: "primary", label: "اللون الأساسي (الذهبي)" },
  { key: "accent", label: "اللون الثانوي (البرونزي)" },
  { key: "bg", label: "خلفية الموقع" },
  { key: "surface", label: "لون البطاقات" },
  { key: "text", label: "لون النصوص" },
  { key: "muted", label: "لون النصوص الثانوية" },
  { key: "button", label: "لون الأزرار" },
  { key: "buttonText", label: "نص الأزرار" },
  { key: "link", label: "لون الروابط" },
];

export default function DesignAdminPage() {
  const [doc, setDoc] = useState<SiteSettingsDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    api<{ draft: SiteSettingsDoc; error?: string }>("/api/admin/settings").then((r) => {
      if (r.ok) setDoc(r.data.draft);
      else {
        setMsg(r.data.error ?? "فشل التحميل");
        setTone("err");
      }
    });
  }, []);

  function up(fn: (d: SiteSettingsDoc) => SiteSettingsDoc) {
    setDoc((d) => (d ? fn(structuredClone(d)) : d));
    setMsg("");
  }

  async function save() {
    if (!doc) return;
    setSaving(true);
    const r = await api<{ error?: string }>("/api/admin/settings", { method: "PUT", body: { draft: doc } });
    setSaving(false);
    if (r.ok) {
      setTone("ok");
      setMsg("تم حفظ المسودة");
    } else {
      setTone("err");
      setMsg(r.data.error ?? "فشل الحفظ");
    }
  }

  async function publish() {
    if (!doc) return;
    setSaving(true);
    const r1 = await api<{ error?: string }>("/api/admin/settings", { method: "PUT", body: { draft: doc } });
    const r2 = await api<{ error?: string }>("/api/admin/settings", { method: "POST", body: { action: "publish" } });
    setSaving(false);
    if (r1.ok && r2.ok) {
      setTone("ok");
      setMsg("تم النشر — الموقع يعكس هذا التصميم الآن");
    } else {
      setTone("err");
      setMsg(r2.data.error ?? r1.data.error ?? "فشل العملية");
    }
  }

  async function restore() {
    if (!confirm("سيتم استعادة جميع الإعدادات (المحتوى والتصميم) إلى الوضع الافتراضي. متأكد؟")) return;
    setRestoring(true);
    const r = await api<{ error?: string }>("/api/admin/settings", { method: "POST", body: { action: "restore" } });
    setRestoring(false);
    if (r.ok) {
      const fresh = await api<{ draft: SiteSettingsDoc }>("/api/admin/settings");
      if (fresh.ok) setDoc(fresh.data.draft);
      setTone("ok");
      setMsg("تمت استعادة التصميم والمحتوى الافتراضيان ونُشرتا");
    } else {
      setTone("err");
      setMsg(r.data.error ?? "فشل الاستعادة");
    }
  }

  const previewVars = useMemo(() => {
    if (!doc) return {};
    const c = doc.design.colors;
    return {
      "--c-primary": c.primary,
      "--c-bg": c.bg,
      "--c-surface": c.surface,
      "--c-text": c.text,
      "--c-muted": c.muted,
      "--c-button": c.button,
      "--c-button-text": c.buttonText,
      "--radius": `${doc.design.radius}px`,
    } as React.CSSProperties;
  }, [doc]);

  if (!doc) return <p className="text-white/40 text-sm">جارٍ التحميل…</p>;
  const d = doc.design;
  const input = "admin-input";

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 py-2" style={{ background: "rgba(11,11,14,.92)", backdropFilter: "blur(8px)" }}>
        <div>
          <h1 className="text-xl font-extrabold text-white/90">التصميم والهوية البصرية</h1>
          <p className="text-xs text-white/40 mt-0.5">ألوان، خطوط، أقسام، وحركة — كل شيء ينعكس من نظام تصميم مركزي.</p>
        </div>
        <div className="flex items-center gap-2">
          {msg && <SaveState msg={msg} tone={tone} />}
          <button onClick={save} disabled={saving} className="admin-btn-outline">{saving ? "…" : "حفظ"}</button>
          <button onClick={publish} disabled={saving} className="admin-btn">نشر</button>
          <button onClick={restore} disabled={restoring} className="admin-btn-danger">{restoring ? "…" : "استعادة الافتراضي"}</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_22rem] gap-5 items-start">
        <div className="space-y-5">
          {/* الوضع */}
          <section className="admin-card p-5">
            <h2 className="font-extrabold text-white/85 mb-4">الوضع العام</h2>
            <div className="flex flex-wrap gap-2">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => up((x) => ({ ...x, design: { ...x.design, theme: t } }))}
                  className="admin-btn-outline !px-5"
                  style={d.theme === t ? { borderColor: "#c6a15b", background: "rgba(198,161,91,.12)" } : undefined}
                >
                  {t === "dark" ? "داكن" : "فاتح"}
                </button>
              ))}
            </div>
          </section>

          {/* الألوان */}
          <section className="admin-card p-5">
            <h2 className="font-extrabold text-white/85 mb-4">الألوان</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {COLOR_FIELDS.map((cf) => (
                <Field key={cf.key} label={cf.label}>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(d.colors[cf.key]) ? d.colors[cf.key] : "#000000"}
                      onChange={(e) => up((x) => ({ ...x, design: { ...x.design, colors: { ...x.design.colors, [cf.key]: e.target.value } } }))}
                      className="w-9 h-9 rounded-lg cursor-pointer border border-white/15 shrink-0"
                      style={{ background: "transparent", padding: 0 }}
                      aria-label={cf.label}
                    />
                    <input
                      className={`${input} font-en !w-28 !py-1.5 !text-xs`}
                      dir="ltr"
                      value={d.colors[cf.key]}
                      onChange={(e) => up((x) => ({ ...x, design: { ...x.design, colors: { ...x.design.colors, [cf.key]: e.target.value } } }))}
                      maxLength={20}
                    />
                  </div>
                </Field>
              ))}
            </div>
          </section>

          {/* الخطوط والحجم */}
          <section className="admin-card p-5 space-y-4">
            <h2 className="font-extrabold text-white/85">الخطوط والقياسات</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="الخط العربي">
                <select className={input} value={d.fonts.arabic} onChange={(e) => up((x) => ({ ...x, design: { ...x.design, fonts: { ...x.design.fonts, arabic: e.target.value } } }))}>
                  <option value="cairo">Cairo</option>
                  <option value="almarai">Almarai</option>
                  <option value="tajawal">Tajawal</option>
                </select>
              </Field>
              <Field label="الخط اللاتيني (الشعار والعناوين الإنجليزية)">
                <select className={input} value={d.fonts.latin} onChange={(e) => up((x) => ({ ...x, design: { ...x.design, fonts: { ...x.design.fonts, latin: e.target.value } } }))}>
                  <option value="grotesk">Space Grotesk</option>
                  <option value="syne">Syne</option>
                </select>
              </Field>
              <Field label="حجم العناوين">
                <select className={input} value={d.headingScale} onChange={(e) => up((x) => ({ ...x, design: { ...x.design, headingScale: e.target.value as DesignSettings["headingScale"] } }))}>
                  <option value="md">متوسط</option>
                  <option value="lg">كبير (افتراضي)</option>
                  <option value="xl">جبار</option>
                </select>
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label={`استدارة البطاقات: ${d.radius}px`}>
                <input
                  type="range"
                  min={0}
                  max={28}
                  value={d.radius}
                  onChange={(e) => up((x) => ({ ...x, design: { ...x.design, radius: Number(e.target.value) } }))}
                  className="w-full accent-[#c6a15b]"
                  aria-label="الاستدارة"
                />
              </Field>
              <Field label="الظلال">
                <select className={input} value={d.shadow} onChange={(e) => up((x) => ({ ...x, design: { ...x.design, shadow: e.target.value as DesignSettings["shadow"] } }))}>
                  <option value="none">بدون</option>
                  <option value="soft">ناعمة (افتراضي)</option>
                  <option value="strong">قوية</option>
                </select>
              </Field>
              <Field label="شكل شبكة معرض الأعمال">
                <select className={input} value={d.grid} onChange={(e) => up((x) => ({ ...x, design: { ...x.design, grid: e.target.value as DesignSettings["grid"] } }))}>
                  <option value="featured">مميز (الأول أكبر)</option>
                  <option value="uniform">موحّد</option>
                </select>
              </Field>
            </div>
            <Toggle checked={d.animations} onChange={(v) => up((x) => ({ ...x, design: { ...x.design, animations: v } }))} label="تفعيل حركات الظهور والانتقالات" />
          </section>

          {/* ترتيب وإخفاء أقسام الصفحة الرئيسية */}
          <section className="admin-card p-5">
            <h2 className="font-extrabold text-white/85 mb-1">أقسام الصفحة الرئيسية</h2>
            <p className="text-[11px] text-white/35 mb-4">الترتيب من الأعلى للأسفل = ترتيب الظهور. أخفِ أي قسم لا تريده.</p>
            <div className="space-y-2">
              {doc.sections.order.map((id, i) => (
                <div key={id} className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2" style={{ background: "rgba(255,255,255,.02)" }}>
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => up((x) => {
                        const order = [...x.sections.order];
                        const j = order.indexOf(id);
                        if (j > 0) [order[j - 1], order[j]] = [order[j]!, order[j - 1]!];
                        return { ...x, sections: { ...x.sections, order } };
                      })}
                      className="p-1 text-white/40 hover:text-[#c6a15b]"
                      aria-label="رفع"
                    >
                      <IconChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => up((x) => {
                        const order = [...x.sections.order];
                        const j = order.indexOf(id);
                        if (j < order.length - 1) [order[j + 1], order[j]] = [order[j]!, order[j + 1]!];
                        return { ...x, sections: { ...x.sections, order } };
                      })}
                      className="p-1 text-white/40 hover:text-[#c6a15b]"
                      aria-label="خفض"
                    >
                      <IconChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="flex-1 text-sm font-bold text-white/75">{SECTION_LABELS[id] ?? id}</span>
                  <Toggle
                    checked={doc.sections.visibility[id] !== false}
                    onChange={(v) => up((x) => ({ ...x, sections: { ...x.sections, visibility: { ...x.sections.visibility, [id]: v } } }))}
                    label={doc.sections.visibility[id] !== false ? "ظاهر" : "مخفي"}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* معاينة حية */}
        <aside className="lg:sticky lg:top-20">
          <p className="text-xs font-bold text-white/50 mb-3">معاينة حية للمسودة (قبل النشر)</p>
          <div className="overflow-hidden rounded-2xl border border-white/10" style={previewVars}>
            <div style={{ background: "var(--c-bg)", padding: "1.6rem 1.2rem 2rem" }}>
              <div style={{ color: "var(--c-primary)", fontSize: 11, fontWeight: 800, letterSpacing: "0.25em", fontFamily: "var(--font-grotesk)" }}>
                GRAPHIC DESIGNER
              </div>
              <div className="font-en mt-1" style={{ color: "var(--c-text)", fontWeight: 800, fontSize: 13, letterSpacing: "0.18em" }}>
                {doc.brand.name}
              </div>
              <h3 className="mt-3" style={{ color: "var(--c-text)", fontSize: doc.design.headingScale === "md" ? 19 : doc.design.headingScale === "lg" ? 22 : 26, fontWeight: 800, lineHeight: 1.25 }}>
                {doc.hero.title}
              </h3>
              <p className="mt-2 line-clamp-3" style={{ color: "var(--c-muted)", fontSize: 11, lineHeight: 1.7 }}>
                {doc.hero.subtitle}
              </p>
              <div className="mt-3 flex gap-2">
                <span style={{ background: "var(--c-button)", color: "var(--c-button-text)", borderRadius: "var(--radius)", padding: "6px 14px", fontSize: 11, fontWeight: 800 }}>
                  {doc.hero.btnRequest}
                </span>
                <span style={{ border: "1px solid color-mix(in srgb, var(--c-primary) 55%, transparent)", color: "var(--c-text)", borderRadius: "var(--radius)", padding: "6px 14px", fontSize: 11, fontWeight: 700 }}>
                  {doc.hero.btnWorks}
                </span>
              </div>
              <div
                className="mt-4"
                style={{
                  background: "var(--c-surface)",
                  border: "1px solid color-mix(in srgb, var(--c-text) 10%, transparent)",
                  borderRadius: "var(--radius)",
                  padding: 12,
                }}
              >
                <div
                  style={{
                    height: 64,
                    borderRadius: "calc(var(--radius) * .6)",
                    background: `radial-gradient(80% 120% at 30% 0%, color-mix(in srgb, var(--c-primary) 30%, var(--c-surface)), var(--c-surface))`,
                  }}
                />
                <div className="mt-2" style={{ color: "var(--c-text)", fontWeight: 800, fontSize: 12 }}>
                  {doc.featured.title}
                </div>
                <div style={{ color: "var(--c-muted)", fontSize: 10 }}>
                  {doc.featured.subtitle}
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-white/30 mt-2 leading-4">
            هذه معاينة تقريبية. النتيجة النهائية تظهر كاملة بعد «نشر».
          </p>
        </aside>
      </div>
    </div>
  );
}
