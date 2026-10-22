"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, Field, Modal, SaveState, Toggle, Badge } from "@/components/admin/ui";
import { IconChevronDown, IconChevronUp, IconTrash } from "./icons-local";

type GalleryImage = { url: string; alt: string };

type Form = {
  title: string;
  slug: string;
  categoryId: number | "";
  coverImage: string;
  gallery: GalleryImage[];
  videoUrl: string;
  description: string;
  goal: string;
  servicesDone: string[];
  role: string;
  tools: string;
  projectDate: string;
  tags: string;
  status: "draft" | "published";
  featured: boolean;
  hidden: boolean;
  sortOrder: number;
};

const EMPTY: Form = {
  title: "",
  slug: "",
  categoryId: "",
  coverImage: "",
  gallery: [],
  videoUrl: "",
  description: "",
  goal: "",
  servicesDone: [],
  role: "",
  tools: "",
  projectDate: "",
  tags: "",
  status: "draft",
  featured: false,
  hidden: false,
  sortOrder: 1,
};

export function ProjectEditor({ projectId }: { projectId: string }) {
  const router = useRouter();
  const isNew = projectId === "new";

  const [form, setForm] = useState<Form>(EMPTY);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const [cats, settings, project] = await Promise.all([
      api<{ categories: { id: number; name: string }[]; error?: string }>("/api/admin/categories"),
      api<{ draft: { services: { items: { title: string }[] } }; error?: string }>("/api/admin/settings"),
      isNew
        ? Promise.resolve({ ok: false, data: {} as Record<string, never> })
        : api<{ project: Record<string, unknown>; error?: string }>(`/api/admin/projects/${projectId}`),
    ]);
    if (cats.ok) setCategories(cats.data.categories);
    if (settings.ok) setServiceOptions(settings.data.draft.services.items.map((i) => i.title));
    if (!isNew && project.ok) {
      const p = project.data.project as {
        title: string; slug: string; categoryId: number | null; coverImage: string;
        gallery: GalleryImage[]; videoUrl: string; description: string; goal: string;
        servicesDone: string[]; role: string; tools: string[]; projectDate: string;
        tags: string[]; status: string; featured: boolean; hidden: boolean; sortOrder: number;
      };
      setForm({
        title: p.title ?? "",
        slug: p.slug ?? "",
        categoryId: p.categoryId ?? "",
        coverImage: p.coverImage ?? "",
        gallery: p.gallery ?? [],
        videoUrl: p.videoUrl ?? "",
        description: p.description ?? "",
        goal: p.goal ?? "",
        servicesDone: p.servicesDone ?? [],
        role: p.role ?? "",
        tools: (p.tools ?? []).join(", "),
        projectDate: p.projectDate ?? "",
        tags: (p.tags ?? []).join(", "),
        status: p.status === "published" ? "published" : "draft",
        featured: Boolean(p.featured),
        hidden: Boolean(p.hidden),
        sortOrder: p.sortOrder ?? 1,
      });
    }
    setReady(true);
  }, [projectId, isNew]);

  useEffect(() => {
    void load();
  }, [load]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setSaved("");
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function uploadCover(file: File) {
    setUploading("الغلاف");
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const r = await api<{ url?: string; error?: string }>("/api/admin/upload", { method: "POST", formData: fd });
    setUploading("");
    if (r.ok && r.data.url) {
      setForm((f) => {
        const gallery = f.coverImage ? f.gallery : [{ url: f.coverImage, alt: f.title || "غلاف" }, ...f.gallery];
        return { ...f, coverImage: r.data.url!, gallery };
      });
    } else {
      setError(r.data.error ?? "فشل رفع الصورة");
    }
  }

  async function uploadGallery(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading("المعرض");
    setError("");
    const added: GalleryImage[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const r = await api<{ url?: string; error?: string }>("/api/admin/upload", { method: "POST", formData: fd });
      if (r.ok && r.data.url) added.push({ url: r.data.url, alt: file.name.replace(/\.[^.]+$/, "") });
      else {
        setError(r.data.error ?? `فشل رفع ${file.name}`);
        break;
      }
    }
    if (added.length) setForm((f) => ({ ...f, gallery: [...f.gallery, ...added] }));
    setUploading("");
    if (galleryRef.current) galleryRef.current.value = "";
  }

  function galleryMove(i: number, dir: -1 | 1) {
    setForm((f) => {
      const g = [...f.gallery];
      const j = i + dir;
      if (j < 0 || j >= g.length) return f;
      [g[i], g[j]] = [g[j]!, g[i]!];
      return { ...f, gallery: g };
    });
  }

  async function save(status: "draft" | "published") {
    if (!form.title.trim()) {
      setError("اسم المشروع مطلوب.");
      return;
    }
    setSaving(true);
    setError("");
    setSaved("");
    const body = {
      title: form.title,
      slug: form.slug || undefined,
      categoryId: form.categoryId === "" ? null : Number(form.categoryId),
      coverImage: form.coverImage,
      gallery: form.gallery,
      videoUrl: form.videoUrl,
      description: form.description,
      goal: form.goal,
      servicesDone: form.servicesDone,
      role: form.role,
      tools: form.tools.split(",").map((t) => t.trim()).filter(Boolean),
      projectDate: form.projectDate,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      featured: form.featured,
      hidden: form.hidden,
      sortOrder: Number(form.sortOrder) || 0,
    };

    let res: { ok: boolean; data: { id?: number; slug?: string; error?: string } };
    if (isNew) {
      res = await api<{ id?: number; slug?: string; error?: string }>("/api/admin/projects", { method: "POST", body });
    } else {
      res = await api<{ id?: number; slug?: string; error?: string }>(`/api/admin/projects/${projectId}`, { method: "PUT", body });
    }
    setSaving(false);
    if (res.ok) {
      setSaved(status === "published" ? "تم الحفظ والنشر — يظهر على الموقع الآن" : "تم حفظ المسودة");
      if (isNew && res.data.id) {
        router.replace(`/admin/projects/${res.data.id}`);
      } else {
        setForm((f) => ({ ...f, status, slug: res.data.slug ?? f.slug }));
      }
    } else {
      setError(res.data.error ?? "فشل الحفظ");
    }
  }

  async function remove() {
    const r = await api<{ error?: string }>(`/api/admin/projects/${projectId}`, { method: "DELETE" });
    if (r.ok) router.push("/admin/projects");
    else {
      setConfirmDelete(false);
      setError(r.data.error ?? "فشل الحذف");
    }
  }

  if (!ready) return <p className="text-white/40 text-sm">جارٍ التحميل…</p>;

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white/90">{isNew ? "مشروع جديد" : "تعديل المشروع"}</h1>
          {!isNew && form.slug && (
            <p className="text-[11px] text-white/35 font-en mt-1" dir="ltr" style={{ textAlign: "end" }}>
              /projects/{form.slug}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {saved && <SaveState msg={saved} />}
          {error && <SaveState msg={error} tone="err" />}
          {!isNew && form.slug && (
            <a href={`/projects/${form.slug}`} target="_blank" rel="noreferrer" className="admin-btn-outline">
              معاينة ↗
            </a>
          )}
          <button onClick={() => save("draft")} disabled={saving} className="admin-btn-outline">
            {saving ? "جارٍ الحفظ…" : "حفظ كمسودة"}
          </button>
          <button onClick={() => save("published")} disabled={saving} className="admin-btn">
            حفظ ونشر
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_20rem] gap-5 items-start">
        <div className="space-y-5">
          {/* المعلومات الأساسية */}
          <section className="admin-card p-5 space-y-4">
            <h2 className="font-extrabold text-white/85">المعلومات الأساسية</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="اسم المشروع *">
                <input
                  className="admin-input"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="مثال: هوية بصرية لمطعم"
                  maxLength={140}
                />
              </Field>
              <Field label="الاسم الرابط (Slug)" hint="إن تركته فارغًا سيُولَّد تلقائيًا. استخدم إنجليزيًا للروابط المثالية.">
                <input
                  className="admin-input font-en"
                  dir="ltr"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="cafe-identity"
                  maxLength={100}
                />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="التصنيف">
                <select className="admin-input" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value === "" ? "" : Number(e.target.value))}>
                  <option value="">بدون تصنيف</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="تاريخ المشروع (اختياري)">
                <input className="admin-input" value={form.projectDate} onChange={(e) => set("projectDate", e.target.value)} placeholder="2025" maxLength={40} />
              </Field>
            </div>
            <Field label="رابط فيديو (اختياري — YouTube / Vimeo / رابط مباشر)">
              <input className="admin-input font-en" dir="ltr" value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://youtube.com/watch?v=…" maxLength={500} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="الخدمات المنفذة في المشروع">
                <div className="flex flex-wrap gap-1.5">
                  {serviceOptions.map((sv) => {
                    const on = form.servicesDone.includes(sv);
                    return (
                      <button
                        key={sv}
                        type="button"
                        onClick={() => set("servicesDone", on ? form.servicesDone.filter((x) => x !== sv) : [...form.servicesDone, sv])}
                        className="text-xs font-bold px-3 py-1.5 rounded-full border transition-colors"
                        style={
                          on
                            ? { background: "rgba(198,161,91,.15)", color: "#d9b878", borderColor: "rgba(198,161,91,.4)" }
                            : { background: "transparent", color: "rgba(255,255,255,.5)", borderColor: "rgba(255,255,255,.12)" }
                        }
                      >
                        {sv}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          </section>

          {/* الوصف */}
          <section className="admin-card p-5 space-y-4">
            <h2 className="font-extrabold text-white/85">الوصف والهدف</h2>
            <Field label="وصف الفكرة">
              <textarea className="admin-input" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={8000} placeholder="ما فكرة المشروع؟ وما القصة خلف التصميم؟" />
            </Field>
            <Field label="الهدف من التصميم">
              <textarea className="admin-input" rows={3} value={form.goal} onChange={(e) => set("goal", e.target.value)} maxLength={3000} placeholder="ماذا يجب أن يحقق هذا التصميم؟" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="دوري في المشروع">
                <input className="admin-input" value={form.role} onChange={(e) => set("role", e.target.value)} maxLength={300} placeholder="التصميم الكامل وإدارة الهوية" />
              </Field>
              <Field label="البرامج والأدوات (افصل بينها بفاصلة)">
                <input className="admin-input font-en" dir="ltr" value={form.tools} onChange={(e) => set("tools", e.target.value)} placeholder="Illustrator, Photoshop" maxLength={300} />
              </Field>
            </div>
            <Field label="وسوم (افصل بينها بفاصلة)">
              <input className="admin-input" value={form.tags} onChange={(e) => set("tags", e.target.value)} maxLength={300} placeholder="مقهى, هوية, علامة محلية" />
            </Field>
          </section>

          {/* الصور */}
          <section className="admin-card p-5 space-y-5">
            <h2 className="font-extrabold text-white/85">الصور</h2>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-bold text-white/55 mb-2">صورة الغلاف</p>
                <div className="flex items-center gap-3">
                  {form.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.coverImage} alt="الغلاف" className="w-24 h-16 object-cover rounded-lg border border-white/10" />
                  ) : (
                    <div className="w-24 h-16 rounded-lg grid place-items-center text-white/25 text-xs" style={{ background: "rgba(255,255,255,.05)" }}>
                      بدون غلاف
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
                    <button type="button" className="admin-btn-outline !py-1.5 !text-xs" onClick={() => fileRef.current?.click()} disabled={Boolean(uploading)}>
                      {uploading === "الغلاف" ? "جارٍ الرفع…" : "رفع صورة الغلاف"}
                    </button>
                    {form.coverImage && (
                      <button type="button" className="text-[11px] text-[#e08080] hover:underline" onClick={() => set("coverImage", "")}>
                        إزالة الغلاف
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-white/30 mt-2">JPG / PNG / WebP / SVG — حتى 10MB</p>
              </div>

              <div>
                <p className="text-xs font-bold text-white/55 mb-2">معرض صور المشروع</p>
                <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" multiple className="hidden" onChange={(e) => void uploadGallery(e.target.files)} />
                <button type="button" className="admin-btn-outline !py-1.5 !text-xs" onClick={() => galleryRef.current?.click()} disabled={Boolean(uploading)}>
                  {uploading === "المعرض" ? "جارٍ الرفع…" : "+ رفع صور (متعددة)"}
                </button>
              </div>
            </div>

            {form.gallery.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {form.gallery.map((g, i) => (
                  <div key={g.url + i} className="rounded-xl overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.url} alt={g.alt} className="w-full h-24 object-cover" loading="lazy" />
                    <div className="p-2 space-y-1.5" style={{ background: "rgba(255,255,255,.03)" }}>
                      <input
                        className="w-full bg-transparent text-[11px] text-white/70 border border-white/10 rounded-md px-2 py-1"
                        value={g.alt}
                        placeholder="وصف بديل (Alt)"
                        onChange={(e) => {
                          const alt = e.target.value;
                          setForm((f) => ({ ...f, gallery: f.gallery.map((x, xi) => (xi === i ? { ...x, alt } : x)) }));
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex gap-0.5">
                          <button onClick={() => galleryMove(i, -1)} className="p-1 text-white/40 hover:text-[#c6a15b]" aria-label="أعلى">
                            <IconChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => galleryMove(i, 1)} className="p-1 text-white/40 hover:text-[#c6a15b]" aria-label="أسفل">
                            <IconChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setForm((f) => ({ ...f, coverImage: g.url, gallery: g.url === f.coverImage ? f.gallery.filter((_, xi) => xi !== i) : f.gallery }))}
                            className="text-[10px] font-bold text-[#c6a15b] hover:underline"
                            title="تعيين كغلاف"
                          >
                            {form.coverImage === g.url ? "الغلاف" : "اجعلها غلافًا"}
                          </button>
                          <button
                            onClick={() => setForm((f) => ({ ...f, gallery: f.gallery.filter((_, xi) => xi !== i) }))}
                            className="text-[#e08080] p-1"
                            aria-label="حذف الصورة"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* الجانب: الحالة والنشر */}
        <aside className="space-y-4">
          <div className="admin-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-white/85">الحالة</h2>
              <Badge tone={form.status === "published" ? "green" : "amber"}>
                {form.status === "published" ? "منشور" : "مسودة"}
              </Badge>
            </div>
            <div className="space-y-3">
              <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="مميز — يظهر في الصفحة الرئيسية" />
              <Toggle checked={form.hidden} onChange={(v) => set("hidden", v)} label="إخفاء عن الزوار (يبقى متاحًا من اللوحة)" />
            </div>
            <Field label="ترتيب الظهور (1 = أولًا)">
              <input type="number" className="admin-input font-en" dir="ltr" min={0} value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
            </Field>
            <div className="gold-note text-[11px] leading-5 text-white/35 border-t border-white/[0.06] pt-3">
              المسودات لا تظهر للزوار. «حفظ ونشر» يجعل المشروع ظاهرًا على الموقع فورًا.
            </div>
          </div>

          {!isNew && (
            <button onClick={() => setConfirmDelete(true)} className="admin-btn-danger w-full">
              <IconTrash className="w-4 h-4" />
              حذف المشروع
            </button>
          )}

          <Link href="/admin/projects" className="admin-btn-outline w-full !justify-center">
            العودة لقائمة المشاريع
          </Link>
        </aside>
      </div>

      {confirmDelete && (
        <Modal title="حذف المشروع" onClose={() => setConfirmDelete(false)}>
          <p className="text-sm text-white/55 leading-7 mb-5">
            هل أنت متأكد من حذف <b className="text-white/85">«{form.title}»</b> نهائيًا؟ لا يمكن التراجع.
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setConfirmDelete(false)} className="admin-btn-outline">إلغاء</button>
            <button onClick={remove} className="admin-btn-danger">تأكيد الحذف</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
