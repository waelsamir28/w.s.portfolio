"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, Badge } from "@/components/admin/ui";
import {
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconEyeOff,
  IconStar,
  IconTrash,
} from "@/components/site/icons";

type Row = {
  id: number;
  slug: string;
  title: string;
  coverImage: string;
  categoryId: number | null;
  categoryName: string;
  status: string;
  featured: boolean;
  hidden: boolean;
  sortOrder: number;
  description: string;
  updatedAt: string;
  [key: string]: unknown;
};

export default function ProjectsAdminPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api<{ projects: Row[]; error?: string }>("/api/admin/projects")
      .then((r) => {
        if (r.ok) setRows(r.data.projects);
        else setError(r.data.error ?? "فشل التحميل");
      })
      .catch(() => setError("فشل الاتصال"));
  }, []);

  useEffect(load, [load]);

  async function patch(id: number, changes: Record<string, unknown>) {
    const row = rows?.find((r) => r.id === id);
    if (!row) return;
    setBusyId(id);
    const r = await api<{ error?: string }>(`/api/admin/projects/${id}`, {
      method: "PUT",
      body: { ...row, ...changes },
    });
    setBusyId(null);
    if (r.ok) load();
    else setError(r.data.error ?? "فشل التحديث");
  }

  async function move(from: number, dir: -1 | 1) {
    if (!rows) return;
    const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const i = sorted.findIndex((r) => r.id === from);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sorted.length) return;
    const a = sorted[i]!;
    const b = sorted[j]!;
    setBusyId(from);
    await Promise.all([
      api(`/api/admin/projects/${a.id}`, { method: "PUT", body: { ...a, sortOrder: b.sortOrder || j + 1 } }),
      api(`/api/admin/projects/${b.id}`, { method: "PUT", body: { ...b, sortOrder: a.sortOrder || i + 1 } }),
    ]);
    setBusyId(null);
    load();
  }

  async function doDelete(row: Row) {
    setDeleting(true);
    const r = await api<{ error?: string }>(`/api/admin/projects/${row.id}`, { method: "DELETE" });
    setDeleting(false);
    setConfirmDelete(null);
    if (r.ok) load();
    else setError(r.data.error ?? "فشل الحذف");
  }

  if (error && !rows) return <p className="text-[#e08080] text-sm font-bold">{error}</p>;
  if (!rows) return <p className="text-white/40 text-sm">جارٍ التحميل…</p>;

  const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white/90">إدارة المشاريع</h1>
          <p className="text-xs text-white/40 mt-1">{rows.length} مشروع — الترتيب يحدد الظهور في الموقع.</p>
        </div>
        <Link href="/admin/projects/new" className="admin-btn">+ مشروع جديد</Link>
      </div>

      {error && <p className="text-[#e08080] text-xs font-bold">{error}</p>}

      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="text-[11px] text-white/40 border-b border-white/[0.06]">
              <th className="text-right font-bold px-4 py-3">الترتيب</th>
              <th className="text-right font-bold px-4 py-3">المشروع</th>
              <th className="text-right font-bold px-4 py-3">التصنيف</th>
              <th className="text-right font-bold px-4 py-3">الحالة</th>
              <th className="text-right font-bold px-4 py-3">مميز</th>
              <th className="text-right font-bold px-4 py-3">إظهار</th>
              <th className="text-left font-bold px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(p.id, 1)} disabled={busyId !== null} className="p-1 text-white/40 hover:text-[#c6a15b] disabled:opacity-30" aria-label="تحريك لأعلى">
                      <IconChevronUp className="w-4 h-4" />
                    </button>
                    <span className="font-en text-xs text-white/50 w-6 text-center">{p.sortOrder}</span>
                    <button onClick={() => move(p.id, -1)} disabled={busyId !== null} className="p-1 text-white/40 hover:text-[#c6a15b] disabled:opacity-30" aria-label="تحريك لأسفل">
                      <IconChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt="" className="w-14 h-10 object-cover rounded-lg shrink-0" />
                    ) : (
                      <span className="w-14 h-10 rounded-lg grid place-items-center text-white/20 shrink-0" style={{ background: "rgba(255,255,255,.05)" }}>
                        ؟
                      </span>
                    )}
                    <div className="min-w-0">
                      <Link href={`/admin/projects/${p.id}`} className="font-bold text-white/85 hover:text-[#c6a15b] transition-colors">
                        {p.title}
                      </Link>
                      <p className="text-[11px] text-white/35 font-en truncate" dir="ltr" style={{ textAlign: "end" }}>
                        /projects/{p.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/60 text-xs font-semibold">{p.categoryName || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => patch(p.id, { status: p.status === "published" ? "draft" : "published" })}
                    disabled={busyId !== null}
                    className="cursor-pointer"
                    title="اضغط للتبديل"
                  >
                    <Badge tone={p.status === "published" ? "green" : "amber"}>
                      {p.status === "published" ? "منشور" : "مسودة"}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => patch(p.id, { featured: !p.featured })}
                    disabled={busyId !== null}
                    className={`p-1.5 transition-colors ${p.featured ? "text-[#c6a15b]" : "text-white/25 hover:text-white/60"}`}
                    aria-label="تمييز في الرئيسية"
                    title="ظهور في قسم الأعمال المميزة"
                  >
                    <IconStar className="w-4.5 h-4.5" fill={p.featured ? "currentColor" : "none"} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => patch(p.id, { hidden: !p.hidden })}
                    disabled={busyId !== null}
                    className={`p-1.5 transition-colors ${p.hidden ? "text-[#e08080]" : "text-white/40 hover:text-white/70"}`}
                    aria-label="إظهار/إخفاء"
                    title={p.hidden ? "المشروع مخفي — اضغط للإظهار" : "اضغط للإخفاء"}
                  >
                    {p.hidden ? <IconEyeOff className="w-4.5 h-4.5" /> : <IconEye className="w-4.5 h-4.5" />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/admin/projects/${p.id}`} className="admin-btn-outline !px-3 !py-1.5 !text-xs">
                      تعديل
                    </Link>
                    <a href={`/projects/${p.slug}`} target="_blank" className="admin-btn-outline !px-3 !py-1.5 !text-xs" rel="noreferrer">
                      معاينة
                    </a>
                    <button onClick={() => setConfirmDelete(p)} className="admin-btn-danger !px-3 !py-1.5 !text-xs">
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-white/40 text-sm py-10">
                  لا توجد مشاريع — ابدأ بإضافة مشروعك الأول.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[90] grid place-items-center p-4"
          style={{ background: "rgba(5,5,8,.75)", backdropFilter: "blur(4px)" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="admin-card w-full max-w-sm p-6">
            <h3 className="font-extrabold text-white/90 mb-2">حذف المشروع</h3>
            <p className="text-sm text-white/55 leading-7 mb-5">
              هل أنت متأكد من حذف <b className="text-white/85">«{confirmDelete.title}»</b>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="admin-btn-outline">
                إلغاء
              </button>
              <button onClick={() => doDelete(confirmDelete)} className="admin-btn-danger" disabled={deleting}>
                {deleting ? "جارٍ الحذف…" : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
