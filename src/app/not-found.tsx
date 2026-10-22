import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-6 pt-24" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="text-center max-w-md">
        <p className="font-en text-8xl font-bold mb-4" style={{ color: "var(--primary)" }}>
          404
        </p>
        <h1 className="text-2xl font-extrabold mb-3">الصفحة غير موجودة</h1>
        <p className="leading-7 mb-8" style={{ color: "var(--muted)" }}>
          قد تكون الصفحة نُقلت أو لم تعد موجودة. يمكنك العودة للرئيسية أو تصفح معرض الأعمال.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            العودة للرئيسية
          </Link>
          <Link href="/portfolio" className="btn btn-outline">
            معرض الأعمال
          </Link>
        </div>
      </div>
    </div>
  );
}
