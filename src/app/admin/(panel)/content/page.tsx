"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { api, Field, SaveState } from "@/components/admin/ui";
import type { SiteSettingsDoc } from "@/db/schema";
import { SOCIAL_KEYS } from "@/lib/constants";
import { SERVICE_ICONS } from "@/components/site/icons";
import { IconTrash, IconChevronUp, IconChevronDown } from "../projects/[id]/icons-local";

function Section({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="admin-card p-5 space-y-4">
      <div>
        <h2 className="font-extrabold text-white/85">{title}</h2>
        {desc && <p className="text-[11px] text-white/35 mt-1">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

export default function ContentAdminPage() {
  const [doc, setDoc] = useState<SiteSettingsDoc | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const aboutImgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<{ draft: SiteSettingsDoc; error?: string }>("/api/admin/settings").then((r) => {
      if (r.ok) setDoc(r.data.draft);
      else setMsg(r.data.error ?? "فشل التحميل"), setTone("err");
    });
  }, []);

  function up(fn: (d: SiteSettingsDoc) => SiteSettingsDoc) {
    setDoc((d) => (d ? fn(structuredClone(d)) : d));
    setDirty(true);
    setMsg("");
  }

  async function save() {
    if (!doc) return;
    setSaving(true);
    const r = await api<{ error?: string }>("/api/admin/settings", { method: "PUT", body: { draft: doc } });
    setSaving(false);
    if (r.ok) {
      setDirty(false);
      setTone("ok");
      setMsg("تم حفظ المسودة — اذهب لصفحة التصميم (أو استخدم زر النشر هنا) لنشرها");
    } else {
      setTone("err");
      setMsg(r.data.error ?? "فشل الحفظ");
    }
  }

  async function publish() {
    await save();
    const r = await api<{ error?: string }>("/api/admin/settings", { method: "POST", body: { action: "publish" } });
    if (r.ok) {
      setTone("ok");
      setMsg("تم النشر — التعديلات أصبحت ظاهرة على الموقع الآن");
    } else {
      setTone("err");
      setMsg(r.data.error ?? "فشل النشر");
    }
  }

  if (!doc) return <p className="text-white/40 text-sm">جارٍ التحميل…</p>;

  async function uploadAboutImage(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const r = await api<{ url?: string; error?: string }>("/api/admin/upload", { method: "POST", formData: fd });
    if (r.ok && r.data.url) up((d) => ({ ...d, about: { ...d.about, imageUrl: r.data.url! } }));
    else {
      setTone("err");
      setMsg(r.data.error ?? "فشل رفع الصورة");
    }
  }

  const d = doc;
  const input = "admin-input";

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 py-2" style={{ background: "rgba(11,11,14,.92)", backdropFilter: "blur(8px)" }}>
        <div>
          <h1 className="text-xl font-extrabold text-white/90">محتوى الموقع</h1>
          <p className="text-xs text-white/40 mt-0.5">
            كل النصوص والعناوين والأزرار هنا تُدار من هذه الصفحة وتظهر مباشرة بعد النشر.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {msg && <SaveState msg={msg} tone={tone} />}
          <button onClick={save} disabled={saving} className="admin-btn-outline">{saving ? "…" : "حفظ المسودة"}</button>
          <button onClick={publish} disabled={saving} className="admin-btn">حفظ ونشر</button>
        </div>
      </div>

      <Section title="الهوية الأساسية">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="الاسم (لاتيني — يظهر في الشعار)">
            <input className={`${input} font-en`} dir="ltr" value={d.brand.name} onChange={(e) => up((x) => ({ ...x, brand: { ...x.brand, name: e.target.value } }))} maxLength={60} />
          </Field>
          <Field label="الاسم العربي">
            <input className={input} value={d.brand.nameAr} onChange={(e) => up((x) => ({ ...x, brand: { ...x.brand, nameAr: e.target.value } }))} maxLength={60} />
          </Field>
        </div>
        <Field label="المسمى المهني">
          <input className={`${input} font-en`} dir="ltr" value={d.brand.title} onChange={(e) => up((x) => ({ ...x, brand: { ...x.brand, title: e.target.value } }))} maxLength={120} />
        </Field>
        <Field label="الوصف المختصر (يظهر في SEO والتذييل)">
          <textarea className={input} rows={2} value={d.brand.tagline} onChange={(e) => up((x) => ({ ...x, brand: { ...x.brand, tagline: e.target.value } }))} maxLength={300} />
        </Field>
      </Section>

      <Section title="القسم الافتتاحي (Hero)">
        <Field label="العنوان الرئيسي">
          <input className={input} value={d.hero.title} onChange={(e) => up((x) => ({ ...x, hero: { ...x.hero, title: e.target.value } }))} maxLength={160} />
        </Field>
        <Field label="النص التعريفي">
          <textarea className={input} rows={4} value={d.hero.subtitle} onChange={(e) => up((x) => ({ ...x, hero: { ...x.hero, subtitle: e.target.value } }))} maxLength={600} />
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="زر: الأعمال">
            <input className={input} value={d.hero.btnWorks} onChange={(e) => up((x) => ({ ...x, hero: { ...x.hero, btnWorks: e.target.value } }))} maxLength={40} />
          </Field>
          <Field label="زر: الطلب">
            <input className={input} value={d.hero.btnRequest} onChange={(e) => up((x) => ({ ...x, hero: { ...x.hero, btnRequest: e.target.value } }))} maxLength={40} />
          </Field>
          <Field label="زر: التواصل">
            <input className={input} value={d.hero.btnContact} onChange={(e) => up((x) => ({ ...x, hero: { ...x.hero, btnContact: e.target.value } }))} maxLength={40} />
          </Field>
        </div>
      </Section>

      <Section title="قسم الأعمال المميزة" desc="يُملأ تلقائيًا من المشاريع المميزة (نجمة) في لوحة المشاريع.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="عنوان القسم">
            <input className={input} value={d.featured.title} onChange={(e) => up((x) => ({ ...x, featured: { ...x.featured, title: e.target.value } }))} maxLength={80} />
          </Field>
          <Field label="وصف القسم">
            <input className={input} value={d.featured.subtitle} onChange={(e) => up((x) => ({ ...x, featured: { ...x.featured, subtitle: e.target.value } }))} maxLength={200} />
          </Field>
        </div>
      </Section>

      <Section title="النبذة الشخصية">
        <Field label="عنوان القسم">
          <input className={input} value={d.about.title} onChange={(e) => up((x) => ({ ...x, about: { ...x.about, title: e.target.value } }))} maxLength={80} />
        </Field>
        <Field label="النص">
          <textarea className={input} rows={5} value={d.about.body} onChange={(e) => up((x) => ({ ...x, about: { ...x.about, body: e.target.value } }))} maxLength={1500} />
        </Field>
        <div className="flex items-center gap-3">
          <input ref={aboutImgRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAboutImage(e.target.files[0])} />
          <button onClick={() => aboutImgRef.current?.click()} className="admin-btn-outline">رفع صورة (شخصية / بيئة العمل)</button>
          {d.about.imageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.about.imageUrl} alt="" className="w-14 h-14 object-cover rounded-lg border border-white/10" />
              <button onClick={() => up((x) => ({ ...x, about: { ...x.about, imageUrl: "" } }))} className="text-xs text-[#e08080] hover:underline">إزالة</button>
            </>
          )}
          {d.about.imageUrl && (
            <input className={`${input} !w-64 !py-1.5 !text-xs font-en`} dir="ltr" value={d.about.imageUrl} onChange={(e) => up((x) => ({ ...x, about: { ...x.about, imageUrl: e.target.value } }))} aria-label="رابط الصورة" />
          )}
        </div>
      </Section>

      <Section title="الخدمات" desc="أضف أو عدّل أو احذف الخدمات — تظهر في قسم الخدمات وفي نموذج التواصل.">
        {d.services.items.map((item, i) => (
          <div key={item.id || i} className="rounded-xl border border-white/[0.07] p-3.5 space-y-3" style={{ background: "rgba(255,255,255,.02)" }}>
            <div className="grid sm:grid-cols-[1fr_auto] gap-3">
              <input
                className={`${input} !py-2`}
                value={item.title}
                placeholder="عنوان الخدمة"
                onChange={(e) => up((x) => ({ ...x, services: { ...x.services, items: x.services.items.map((it, xi) => (xi === i ? { ...it, title: e.target.value } : it)) } }))}
                maxLength={80}
              />
              <div className="flex items-center gap-1">
                <select
                  className="admin-input !w-auto !py-2 !text-xs"
                  value={item.icon}
                  onChange={(e) => up((x) => ({ ...x, services: { ...x.services, items: x.services.items.map((it, xi) => (xi === i ? { ...it, icon: e.target.value } : it)) } }))}
                  aria-label="أيقونة الخدمة"
                >
                  {Object.keys(SERVICE_ICONS).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <button
                  onClick={() => up((x) => ({ ...x, services: { ...x.services, items: x.services.items.filter((_, xi) => xi !== i) } }))}
                  className="text-[#e08080] p-1.5"
                  aria-label="حذف الخدمة"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            <input
              className={`${input} !py-2 !text-sm`}
              value={item.description}
              placeholder="وصف قصير للخدمة"
              onChange={(e) => up((x) => ({ ...x, services: { ...x.services, items: x.services.items.map((it, xi) => (xi === i ? { ...it, description: e.target.value } : it)) } }))}
              maxLength={200}
            />
          </div>
        ))}
        <button
          onClick={() => up((x) => ({ ...x, services: { ...x.services, items: [...x.services.items, { id: `svc-${Date.now()}`, title: "خدمة جديدة", description: "", icon: "palette" }] } }))}
          className="admin-btn-outline"
        >
          + إضافة خدمة
        </button>
      </Section>

      <Section title="المهارات والتخصصات">
        <div className="flex flex-wrap gap-2">
          {d.skills.items.map((sk, i) => (
            <span key={sk + i} className="admin-badge gray !text-xs !px-3 !py-1.5">
              {sk}
              <button
                onClick={() => up((x) => ({ ...x, skills: { ...x.skills, items: x.skills.items.filter((_, xi) => xi !== i) } }))}
                className="text-[#e08080] hover:opacity-80"
                aria-label={`حذف ${sk}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <SkillAdder onAdd={(v) => up((x) => ({ ...x, skills: { ...x.skills, items: [...x.skills.items, v] } }))} />
      </Section>

      <Section title="آلية العمل (خطوات)">
        {d.process.steps.map((st, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="font-en text-white/30 text-sm w-7">{String(i + 1).padStart(2, "0")}</span>
              <input
                className={`${input} !py-2`}
                value={st.title}
                placeholder="عنوان الخطوة"
                onChange={(e) => up((x) => ({ ...x, process: { ...x.process, steps: x.process.steps.map((s2, xi) => (xi === i ? { ...s2, title: e.target.value } : s2)) } }))}
                maxLength={60}
              />
            </div>
            <div className="flex gap-1.5 items-center">
              <input
                className={`${input} !py-2 !text-sm`}
                value={st.body}
                placeholder="وصف الخطوة"
                onChange={(e) => up((x) => ({ ...x, process: { ...x.process, steps: x.process.steps.map((s2, xi) => (xi === i ? { ...s2, body: e.target.value } : s2)) } }))}
                maxLength={200}
              />
              <button onClick={() => up((x) => ({ ...x, process: { ...x.process, steps: x.process.steps.filter((_, xi) => xi !== i) } }))} className="text-[#e08080] p-1.5" aria-label="حذف الخطوة">
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <button
            onClick={() => up((x) => ({ ...x, process: { ...x.process, steps: [...x.process.steps, { title: "خطوة جديدة", body: "" }] } }))}
            className="admin-btn-outline"
          >
            + إضافة خطوة
          </button>
          <button
            onClick={() => up((x) => {
              const steps = [...x.process.steps];
              for (let i = 0; i < steps.length - 1; i++) steps[i] = steps[i + 1]!;
              steps.pop();
              return { ...x, process: { ...x.process, steps } };
            })}
            className="admin-btn-outline"
            disabled={d.process.steps.length < 2}
          >
            <IconChevronUp className="w-4 h-4" /> تبديل الترتيب
          </button>
        </div>
      </Section>

      <Section title="الدعوة للتواصل (CTA)">
        <Field label="العنوان">
          <input className={input} value={d.cta.title} onChange={(e) => up((x) => ({ ...x, cta: { ...x.cta, title: e.target.value } }))} maxLength={140} />
        </Field>
        <Field label="النص">
          <textarea className={input} rows={3} value={d.cta.body} onChange={(e) => up((x) => ({ ...x, cta: { ...x.cta, body: e.target.value } }))} maxLength={500} />
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="زر: الطلب">
            <input className={input} value={d.cta.btnRequest} onChange={(e) => up((x) => ({ ...x, cta: { ...x.cta, btnRequest: e.target.value } }))} maxLength={40} />
          </Field>
          <Field label="زر: واتساب">
            <input className={input} value={d.cta.btnWhatsapp} onChange={(e) => up((x) => ({ ...x, cta: { ...x.cta, btnWhatsapp: e.target.value } }))} maxLength={40} />
          </Field>
          <Field label="زر: الأعمال">
            <input className={input} value={d.cta.btnMore} onChange={(e) => up((x) => ({ ...x, cta: { ...x.cta, btnMore: e.target.value } }))} maxLength={40} />
          </Field>
        </div>
      </Section>

      <Section title="صفحة التواصل" desc="تظهر فقط الحقول المعبأة — لا نعرض بيانات غير موجودة.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="البريد الإلكتروني">
            <input className={`${input} font-en`} dir="ltr" value={d.contact.email} onChange={(e) => up((x) => ({ ...x, contact: { ...x.contact, email: e.target.value } }))} placeholder="you@example.com" maxLength={120} />
          </Field>
          <Field label="رقم الهاتف">
            <input className={`${input} font-en`} dir="ltr" value={d.contact.phone} onChange={(e) => up((x) => ({ ...x, contact: { ...x.contact, phone: e.target.value } }))} placeholder="+201xxxxxxxxx" maxLength={30} />
          </Field>
          <Field label="رقم واتساب (بالرمز الدولي)" hint="يظهر أزرار WhatsApp عند تعبئته">
            <input className={`${input} font-en`} dir="ltr" value={d.contact.whatsapp} onChange={(e) => up((x) => ({ ...x, contact: { ...x.contact, whatsapp: e.target.value } }))} placeholder="2010xxxxxxxx" maxLength={30} />
          </Field>
          <Field label="الموقع / المدينة">
            <input className={input} value={d.contact.location} onChange={(e) => up((x) => ({ ...x, contact: { ...x.contact, location: e.target.value } }))} maxLength={80} />
          </Field>
        </div>
      </Section>

      <Section title="روابط التواصل الاجتماعي" desc="تُعرض فقط الحسابات التي تملؤها برابط حقيقي.">
        <div className="grid sm:grid-cols-2 gap-4">
          {SOCIAL_KEYS.map((sk) => (
            <Field key={sk.key} label={sk.label}>
              <input className={`${input} font-en`} dir="ltr" value={d.social[sk.key] ?? ""} onChange={(e) => up((x) => ({ ...x, social: { ...x.social, [sk.key]: e.target.value } }))} placeholder="https://" maxLength={300} />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="تذييل الموقع">
        <Field label="وصف قصير في التذييل">
          <textarea className={input} rows={2} value={d.footer.about} onChange={(e) => up((x) => ({ ...x, footer: { ...x.footer, about: e.target.value } }))} maxLength={300} />
        </Field>
        <Field label="نص سياسة الخصوصية (افصل الفقرات بسطر فارغ)">
          <textarea className={input} rows={5} value={d.footer.privacyBody} onChange={(e) => up((x) => ({ ...x, footer: { ...x.footer, privacyBody: e.target.value } }))} maxLength={2000} />
        </Field>
      </Section>

      <div className="flex items-center gap-2 pb-4">
        <button onClick={save} disabled={saving} className="admin-btn-outline">{saving ? "…" : "حفظ المسودة"}</button>
        <button onClick={publish} disabled={saving} className="admin-btn">حفظ ونشر</button>
      </div>
    </div>
  );
}

function SkillAdder({ onAdd }: { onAdd: (v: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="flex gap-2">
      <input className={`${"admin-input"} !py-2`} value={v} onChange={(e) => setV(e.target.value)} placeholder="مهارة جديدة (إنجليزيًا)" maxLength={60} />
      <button
        onClick={() => {
          if (v.trim()) {
            onAdd(v.trim());
            setV("");
          }
        }}
        className="admin-btn-outline"
      >
        إضافة
      </button>
    </div>
  );
}
