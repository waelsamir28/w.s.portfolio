"use client";

import { useCallback, useEffect, useState } from "react";
import { api, Badge, SaveState } from "@/components/admin/ui";
import { IconTrash } from "../projects/[id]/icons-local";

type Req = {
  id: number;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  description: string;
  budget: string;
  deadline: string;
  attachments: string[];
  status: string;
  adminNotes: string;
  createdAt: string;
};

const STATUSES: { value: string; label: string; tone: "blue" | "amber" | "green" | "red" }[] = [
  { value: "new", label: "جديد", tone: "blue" },
  { value: "review", label: "قيد المراجعة", tone: "amber" },
  { value: "contacted", label: "تم التواصل", tone: "green" },
  { value: "done", label: "مكتمل", tone: "green" },
  { value: "rejected", label: "مرفوض", tone: "red" },
];

export default function RequestsAdminPage() {
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(() => {
    api<{ requests: Req[]; error?: string }>("/api/admin/requests")
      .then((r) => {
        if (r.ok) {
          setReqs(r.data.requests);
          const n: Record<number, string> = {};
          r.data.requests.forEach((x) => (n[x.id] = x.adminNotes));
          setNotes(n);
        } else setError(r.data.error ?? "فشل التحميل");
      })
      .catch(() => setError("فشل الاتصال"));
  }, []);

  useEffect(load, [load]);

  async function patch(id: number, changes: { status?: string; adminNotes?: string }) {
    const r = await api<{ error?: string }>(`/api/admin/requests/${id}`, { method: "PUT", body: changes });
    if (r.ok) {
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2500);
      load();
    } else setError(r.data.error ?? "فشل الحفظ");
  }

  async function del(id: number) {
    setDeleting(id);
    const r = await api<{ error?: string }>(`/api/admin/requests/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (r.ok) load();
    else setError(r.data.error ?? "فشل الحذف");
  }

  if (!reqs) return <p className="text-white/40 text-sm">{error || "جارٍ التحميل…"}</p>;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold text-white/90">طلبات العملاء</h1>
        <p className="text-xs text-white/40 mt-1">
          تصل من نموذج صفحة التواصل. الملاحظات الداخلية لا تظهر للعملاء إطلاقًا.
        </p>
      </div>

      {reqs.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <p className="text-4xl mb-3" aria-hidden>📨</p>
          <p className="text-sm text-white/45">
            لم تستلم طلبات بعد. عندما يرسل عميل طلبًا من صفحة «تواصل معي» سيظهر هنا مباشرة.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reqs.map((q) => {
            const st = STATUSES.find((s) => s.value === q.status) ?? STATUSES[0]!;
            return (
              <div key={q.id} className="admin-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="font-extrabold text-white/90">{q.name}</h2>
                      <Badge tone={st.tone}>{st.label}</Badge>
                      {savedId === q.id && <SaveState msg="تم الحفظ" />}
                    </div>
                    <p className="text-xs text-white/40 mt-1.5">
                      <a href={`mailto:${q.email}`} className="font-en hover:text-[#c6a15b]" dir="ltr">{q.email}</a>
                      {q.phone && (
                        <>
                          {" · "}
                          <span className="font-en" dir="ltr">{q.phone}</span>
                        </>
                      )}
                      {" · "}
                      {new Date(q.createdAt).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="admin-input !w-auto !py-1.5 !text-xs"
                      value={q.status}
                      onChange={(e) => patch(q.id, { status: e.target.value })}
                      aria-label="حالة الطلب"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <button onClick={() => del(q.id)} className="admin-btn-danger !px-2.5" disabled={deleting === q.id} aria-label="حذف الطلب">
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-2 text-xs mb-3">
                  {q.serviceType && (
                    <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,.04)" }}>
                      <span className="text-white/35 block mb-0.5">الخدمة</span>
                      <span className="text-white/80 font-bold">{q.serviceType}</span>
                    </div>
                  )}
                  {q.budget && (
                    <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,.04)" }}>
                      <span className="text-white/35 block mb-0.5">الميزانية</span>
                      <span className="text-white/80 font-bold">{q.budget}</span>
                    </div>
                  )}
                  {q.deadline && (
                    <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,.04)" }}>
                      <span className="text-white/35 block mb-0.5">الموعد المتوقع</span>
                      <span className="text-white/80 font-bold">{q.deadline}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm leading-7 text-white/70 mb-3" style={{ whiteSpace: "pre-wrap" }}>{q.description}</p>

                {q.attachments?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {q.attachments.map((a) => (
                      <a key={a} href={`/api/files/${a}`} target="_blank" rel="noreferrer" className="admin-btn-outline !py-1 !px-3 !text-[11px]">
                        📎 {a.split("/").pop()}
                      </a>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-white/40 mb-1.5">ملاحظات داخلية (خاصة بك فقط)</label>
                  <textarea
                    className="admin-input !text-xs"
                    rows={2}
                    value={notes[q.id] ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [q.id]: e.target.value }))}
                    placeholder="ملاحظاتك حول هذا العميل…"
                  />
                  {(notes[q.id] ?? "") !== q.adminNotes && (
                    <button onClick={() => patch(q.id, { adminNotes: notes[q.id] ?? "" })} className="admin-btn !py-1 !px-3 !text-[11px] mt-2">
                      حفظ الملاحظة
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {error && <p className="text-[#e08080] text-xs font-bold">{error}</p>}
    </div>
  );
}
