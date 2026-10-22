"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/components/admin/ui";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<{ ok?: boolean; error?: string }>("/api/admin/login", {
        method: "POST",
        body: { username, password },
      });
      if (res.ok) {
        const next = params.get("next") ?? "/admin";
        router.push(next.startsWith("/admin") ? next : "/admin");
        router.refresh();
      } else {
        setError(res.data.error ?? "تعذر تسجيل الدخول.");
      }
    } catch {
      setError("تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-shell min-h-screen grid place-items-center p-4" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span
            className="inline-grid place-items-center w-14 h-14 font-en text-xl font-bold mb-4"
            style={{
              color: "#c6a15b",
              background: "rgba(198,161,91,.12)",
              border: "1px solid rgba(198,161,91,.4)",
              borderRadius: 14,
            }}
          >
            WS
          </span>
          <h1 className="font-en tracking-[0.25em] font-bold text-white/90 text-sm">WAEL SAMIR</h1>
          <p className="text-white/45 text-sm mt-2">لوحة التحكم — تسجيل الدخول</p>
        </div>

        <form onSubmit={onSubmit} className="admin-card p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/55 mb-1.5">اسم المستخدم</label>
            <input
              className="admin-input font-en"
              dir="ltr"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/55 mb-1.5">كلمة المرور</label>
            <input
              className="admin-input font-en"
              dir="ltr"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p className="text-xs font-bold px-3 py-2.5" style={{ color: "#e08080", background: "rgba(220,80,80,.1)", border: "1px solid rgba(220,80,80,.25)", borderRadius: 10 }}>
              {error}
            </p>
          )}
          <button type="submit" className="admin-btn w-full" disabled={loading}>
            {loading ? "جارٍ الدخول…" : "تسجيل الدخول"}
          </button>
        </form>

        <p className="text-center text-[11px] text-white/30 mt-5">
          للدخول الأول استخدم البيانات المحددة في ملف .env (ADMIN_USERNAME / ADMIN_PASSWORD)
        </p>
      </div>
    </div>
  );
}
