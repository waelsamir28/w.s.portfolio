"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { IconClose } from "@/components/site/icons";

/* ===== مساعد طلبات API ===== */

export async function api<T = Record<string, unknown>>(
  path: string,
  opts?: { method?: string; body?: unknown; formData?: FormData }
): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(path, {
    method: opts?.method ?? "GET",
    headers: opts?.formData ? undefined : { "Content-Type": "application/json" },
    body: opts?.formData
      ? opts.formData
      : opts?.body
        ? JSON.stringify(opts.body)
        : undefined,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  return { ok: res.ok, status: res.status, data };
}

export function errText(data: { error?: string }, fallback: string) {
  return data.error ?? fallback;
}

/* ===== مكونات صغيرة ===== */

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="admin-card p-5">
      <p className="text-xs font-semibold text-white/50 mb-2">{label}</p>
      <p className="text-3xl font-extrabold text-[#f3f0e8]">{value}</p>
      {hint && <p className="text-[11px] text-white/40 mt-1.5">{hint}</p>}
    </div>
  );
}

export function Badge({ tone, children }: { tone: "green" | "amber" | "gray" | "red" | "blue"; children: ReactNode }) {
  return <span className={`admin-badge ${tone}`}>{children}</span>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-white/55 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white/35 mt-1">{hint}</p>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors"
      aria-pressed={checked}
    >
      <span
        className="relative inline-flex w-10 h-5.5 shrink-0"
        style={{
          width: 40,
          height: 22,
          borderRadius: 999,
          background: checked ? "#c6a15b" : "rgba(255,255,255,.14)",
          transition: "background .2s",
        }}
      >
        <span
          className="absolute top-0.5"
          style={{
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "#0e0e12",
            insetInlineStart: checked ? 19 : 2,
            transition: "inset-inline-start .2s",
          }}
        />
      </span>
      {label}
    </button>
  );
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center p-4"
      style={{ background: "rgba(5,5,8,.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="admin-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-[#f3f0e8]">{title}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white" aria-label="إغلاق">
            <IconClose className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ===== حالة حفظ ===== */

export function SaveState({ msg, tone = "ok" }: { msg?: string; tone?: "ok" | "err" }) {
  if (!msg) return null;
  return (
    <span
      className="text-xs font-bold px-3 py-1.5 rounded-lg"
      style={
        tone === "ok"
          ? { background: "rgba(90,200,120,.12)", color: "#7fd79a" }
          : { background: "rgba(220,80,80,.12)", color: "#e08080" }
      }
    >
      {msg}
    </span>
  );
}
