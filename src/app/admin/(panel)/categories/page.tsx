"use client";

import { useCallback, useEffect, useState } from "react";
import { api, Field, Modal, SaveState, Toggle } from "@/components/admin/ui";
import { IconChevronDown, IconChevronUp, IconTrash } from "../projects/[id]/icons-local";

type Cat = {
  id: number;
  slug: string;
  name: string;
  description: string;
  visible: boolean;
  sortOrder: number;
  projectCount: number;
};

export default function CategoriesAdminPage() {
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Cat | null>(null);
  const [moveTo, setMoveTo] = useState<number | "">("");

  const load = useCallback(() => {
    api<{ categories: Cat[]; error?: string }>("/api/admin/categories")
      .then((r) => (r.ok ? setCats(r.data.categories) : setError(r.data.error ?? "فشل التحميل")))
      .catch(() => setError("فشل الاتصال"));
  }, []);

  useEffect(load, [load]);

  async function create() {
    if (!newName.trim()) return;
    setCreating(true);
    const r = await api<{ error?: string }>("/api/admin/categories", {
      method: "POST",
      body: { name: newName, description: newDesc, visible: true },
    });
    setCreating(false);
    if (r.ok) {
      setNewName("");
      setNewDesc("");
      setSaved("تم إضافة التصنيف");
      load();
    } else setError(r.data.error ?? "فشل الإضافة");
  }

  async function patch(cat: Cat, changes: Partial<Cat>) {
    const r = await api<{ error?: string }>(`/api/admin/categories/${cat.id}`, {
      method: "PUT",
      body: changes,
    });
    if (r.ok) {
      setSaved("تم الحفظ");
      load();
    } else setError(r.data.error ?? "فشل الحفظ");
  }

  async function move(cat: Cat, dir: -1 | 1) {
    if (!cats) return;
    const sorted = [...cats].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const i = sorted.findIndex((c) => c.id === cat.id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sorted.length) return;
    const a = sorted[i]!;
    const b = sorted[j]!;
    await Promise.all([
      patch(a, { sortOrder: b.sortOrder || j + 1 }),
      patch(b, { sortOrder: a.sortOrder || i + 1 }),
    ]);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const r = await api<{ error?: string }>(`/api/admin/categories/${deleteTarget.id}`, {
      method: "DELETE",
      body: { moveTo: moveTo === "" ? null : Number(moveTo) },
    });
    if (r.ok) {
      setDeleteTarget(null);
      setMoveTo("");
      setSaved("تم حذف التصنيف");
      load();
    } else {
      setError(r.data.error ?? "فشل الحذف");
      setDeleteTarget(null);
    }
  }

  if (!cats) return <p className="text-white/40 text-sm">{error || "جارٍ التحميل…"}</p>;
  const sorted = [...cats].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white/90">إدارة التصنيفات</h1>
          <p className="text-xs text-white/40 mt-1">تظهر هذه التصنيفات كفلاتر في معرض الأعمال.</p>
        </div>
        {saved && <SaveState msg={saved} />}
      </div>

      <div className="admin-card p-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <Field label="اسم التصنيف الجديد">
          <input className="admin-input" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={80} placeholder="مثال: تصميم الأغلفة" />
        </Field>
        <Field label="وصف (اختياري)">
          <input className="admin-input" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} maxLength={300} />
        </Field>
        <button onClick={create} disabled={creating || !newName.trim()} className="admin-btn h-[42px]">
          {creating ? "…" : "+ إضافة"}
        </button>
      </div>

      <div className="admin-card divide-y divide-white/[0.05]">
        {sorted.map((c) => (
          <div key={c.id} className="p-4 grid md:grid-cols-[auto_1fr_1fr_auto] gap-3 items-center">
            <div className="flex items-center gap-1">
              <button onClick={() => move(c, 1)} className="p-1 text-white/40 hover:text-[#c6a15b]" aria-label="أعلى">
                <IconChevronUp className="w-4 h-4" />
              </button>
              <button onClick={() => move(c, -1)} className="p-1 text-white/40 hover:text-[#c6a15b]" aria-label="أسفل">
                <IconChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              <input
                className="admin-input !py-2"
                value={c.name}
                onChange={(e) => patch(c, { name: e.target.value })}
                maxLength={80}
                aria-label={`اسم: ${c.name}`}
              />
              <span className="admin-badge gray">{c.projectCount} مشروع</span>
            </div>
            <div className="space-y-2">
              <input
                className="admin-input !py-2"
                value={c.description}
                placeholder="وصف التصنيف"
                onChange={(e) => patch(c, { description: e.target.value })}
                maxLength={300}
                aria-label="وصف التصنيف"
              />
              <Toggle checked={c.visible} onChange={(v) => patch(c, { visible: v })} label="ظاهر في الفلاتر" />
            </div>
            <button onClick={() => { setDeleteTarget(c); setMoveTo(""); }} className="admin-btn-danger self-start" aria-label={`حذف ${c.name}`}>
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-center text-white/40 text-sm py-10">لا توجد تصنيفات — أضف أول تصنيف.</p>
        )}
      </div>

      {error && <p className="text-[#e08080] text-xs font-bold">{error}</p>}

      {deleteTarget && (
        <Modal title={`حذف «${deleteTarget.name}»`} onClose={() => setDeleteTarget(null)}>
          {deleteTarget.projectCount > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-white/60 leading-7">
                هذا التصنيف مرتبط بـ <b className="text-white/85">{deleteTarget.projectCount} مشروع</b>.
                اختر تصنيفًا بديلًا لنقل هذه المشاريع إليه قبل الحذف:
              </p>
              <select className="admin-input" value={moveTo} onChange={(e) => setMoveTo(e.target.value === "" ? "" : Number(e.target.value))}>
                <option value="">اختر تصنيفًا بديلًا…</option>
                {sorted.filter((c) => c.id !== deleteTarget.id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setDeleteTarget(null)} className="admin-btn-outline">إلغاء</button>
                <button onClick={confirmDelete} disabled={moveTo === ""} className="admin-btn-danger">نقل المشاريع وحذف التصنيف</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-white/60 leading-7">لا توجد مشاريع مرتبطة بهذا التصنيف. سيتم حذفه نهائيًا.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setDeleteTarget(null)} className="admin-btn-outline">إلغاء</button>
                <button onClick={confirmDelete} className="admin-btn-danger">تأكيد الحذف</button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
