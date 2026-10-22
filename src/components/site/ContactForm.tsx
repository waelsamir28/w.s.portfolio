"use client";

import { useRef, useState, type FormEvent } from "react";
import { IconCheck, IconWhatsApp } from "./icons";

const MAX_FILE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export default function ContactForm({
  serviceOptions,
  whatsapp,
  whatsappLabel,
  initialService = "",
}: {
  serviceOptions: string[];
  whatsapp: string;
  whatsappLabel: string;
  initialService?: string;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const waHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}` : "";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const form = formRef.current;
    if (!form) return;

    if (file && file.size > MAX_FILE) {
      setFileError("حجم الملف يتجاوز 10MB.");
      setFile(null);
      return;
    }

    const fd = new FormData(form);
    if (file) fd.append("attachment", file);

    setSending(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "حدث خطأ أثناء الإرسال، حاول مرة أخرى.");
        return;
      }
      setSent(true);
    } catch {
      setError("تعذر الاتصال بالخادم، حاول بعد قليل.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="card p-10 text-center anim-rise">
        <span
          className="inline-grid place-items-center w-16 h-16 mb-5"
          style={{
            color: "var(--primary)",
            background: "color-mix(in srgb, var(--primary) 12%, transparent)",
            borderRadius: "999px",
          }}
        >
          <IconCheck className="w-8 h-8" />
        </span>
        <h3 className="text-xl font-extrabold mb-3">تم استلام طلبك بنجاح</h3>
        <p className="leading-7 text-sm max-w-md mx-auto mb-6" style={{ color: "var(--muted)" }}>
          شكرًا لتواصلك. تم حفظ طلبك وسأعود إليك بأسرع وقت لمناقشة التفاصيل.
        </p>
        <button onClick={() => { setSent(false); setFile(null); }} className="btn btn-outline btn-sm">
          إرسال طلب آخر
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card p-5 sm:p-6 md:p-8 flex flex-col gap-5" noValidate>
      {/* Honeypot خفي */}
      <div className="hidden" aria-hidden="true">
        <label>
          لا تملأ هذا الحقل
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="lbl" htmlFor="cf-name">الاسم *</label>
          <input id="cf-name" name="name" className="field" required minLength={2} maxLength={80} placeholder="اسمك الكامل" />
        </div>
        <div>
          <label className="lbl" htmlFor="cf-email">البريد الإلكتروني *</label>
          <input id="cf-email" name="email" type="email" className="field font-en" dir="ltr" required maxLength={120} placeholder="you@example.com" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="lbl" htmlFor="cf-phone">رقم الهاتف (اختياري)</label>
          <input id="cf-phone" name="phone" className="field font-en" dir="ltr" maxLength={30} placeholder="+20 1x xxxx xxxx" />
        </div>
        <div>
          <label className="lbl" htmlFor="cf-service">نوع الخدمة المطلوبة</label>
          <select id="cf-service" name="serviceType" className="field" defaultValue={initialService}>
            <option value="">اختر الخدمة…</option>
            {serviceOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="أخرى">أخرى</option>
          </select>
        </div>
      </div>

      <div>
        <label className="lbl" htmlFor="cf-desc">وصف المشروع *</label>
        <textarea
          id="cf-desc"
          name="description"
          className="field"
          rows={5}
          required
          minLength={10}
          maxLength={4000}
          placeholder="اشرح فكرتك: ما الذي تريد تصميمه؟ وما الهدف من التصميم؟ وهل لديك أمثلة تحبها؟"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="lbl" htmlFor="cf-budget">الميزانية التقديرية (اختياري)</label>
          <input id="cf-budget" name="budget" className="field" maxLength={120} placeholder="مثال: 1000 – 2000 جنيه" />
        </div>
        <div>
          <label className="lbl" htmlFor="cf-deadline">موعد التسليم المتوقع (اختياري)</label>
          <input id="cf-deadline" name="deadline" className="field" maxLength={120} placeholder="مثال: خلال أسبوعين" />
        </div>
      </div>

      <div>
        <label className="lbl" htmlFor="cf-file">مرفق مرجعي (اختياري — صورة أو PDF حتى 10MB)</label>
        <input
          id="cf-file"
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="block w-full text-sm"
          style={{ color: "var(--muted)" }}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFileError("");
            if (f && !ALLOWED_TYPES.includes(f.type)) {
              setFileError("نوع الملف غير مدعوم (JPG/PNG/WebP/PDF فقط).");
              setFile(null);
              e.target.value = "";
              return;
            }
            setFile(f);
          }}
        />
        {file && <p className="text-xs mt-1.5" style={{ color: "var(--primary)" }}>{file.name}</p>}
        {fileError && <p className="text-xs mt-1.5" style={{ color: "#e08080" }}>{fileError}</p>}
      </div>

      {error && (
        <p className="text-sm font-semibold px-4 py-3" style={{ color: "#e08080", background: "rgba(220,80,80,.08)", border: "1px solid rgba(220,80,80,.25)", borderRadius: "10px" }}>
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-1">
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "جارٍ الإرسال…" : "إرسال الطلب"}
        </button>
        {waHref && (
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            <IconWhatsApp className="w-4.5 h-4.5" />
            {whatsappLabel}
          </a>
        )}
      </div>
    </form>
  );
}
