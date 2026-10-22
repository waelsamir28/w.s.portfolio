import Link from "next/link";
import Reveal from "./Reveal";
import { IconArrow, IconSpark } from "./icons";

export default function Hero({
  title,
  subtitle,
  btnWorks,
  btnRequest,
  btnContact,
  brandName,
  brandTitle,
  animate,
}: {
  title: string;
  subtitle: string;
  btnWorks: string;
  btnRequest: string;
  btnContact: string;
  brandName: string;
  brandTitle: string;
  animate: boolean;
}) {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "92vh", display: "flex", alignItems: "center", paddingTop: "6rem", paddingBottom: "3rem" }}>
      {/* خلفية زخرفية */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 start-1/2 w-[52rem] h-[52rem] -translate-x-1/2"
          style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--primary) 14%, transparent), transparent 70%)", filter: "blur(10px)" }}
        />
        <div
          className="absolute bottom-0 end-0 w-96 h-96"
          style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%)" }}
        />
      </div>

      <div className="container-x relative grid lg:grid-cols-[1.1fr_.9fr] gap-14 items-center">
        <div>
          <Reveal animate={animate}>
            <p className="kicker mb-5 font-en tracking-[0.3em]">{brandTitle}</p>
          </Reveal>
          <Reveal animate={animate} delay={120}>
            <h1 className="h1 mb-6">
              {title.split("تصنع الفرق.")[0]}
              <span style={{ color: "var(--primary)" }}>تصنع الفرق.</span>
            </h1>
          </Reveal>
          <Reveal animate={animate} delay={220}>
            <p className="max-w-xl text-base md:text-lg leading-8 mb-9" style={{ color: "var(--muted)" }}>
              {subtitle}
            </p>
          </Reveal>
          <Reveal animate={animate} delay={320}>
            <div className="flex flex-wrap items-center gap-3.5">
              <Link href="/portfolio" className="btn btn-primary">
                {btnWorks}
                <IconArrow className="w-4.5 h-4.5" />
              </Link>
              <Link href="/contact" className="btn btn-outline">
                <IconSpark className="w-4.5 h-4.5" />
                {btnRequest}
              </Link>
              <Link href="/contact" className="btn btn-ghost">
                {btnContact}
              </Link>
            </div>
          </Reveal>
        </div>

        {/* عرض بصري */}
        <Reveal animate={animate} delay={260} className="relative">
          <div className="relative max-w-md mx-auto lg:mx-0 lg:me-0">
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 opacity-60"
              style={{
                background: "linear-gradient(140deg, color-mix(in srgb, var(--primary) 22%, transparent), transparent 45%, color-mix(in srgb, var(--accent) 18%, transparent))",
                borderRadius: "calc(var(--radius) * 1.6)",
                filter: "blur(24px)",
              }}
            />
            <div
              className="relative overflow-hidden"
              style={{ borderRadius: "calc(var(--radius) * 1.3)", border: "1px solid var(--border)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-abstract.jpg"
                alt="تكوين بصري ذهبي يرمز للإبداع والتصميم"
                className="w-full h-auto block"
                style={{ aspectRatio: "4/4.6", objectFit: "cover" }}
                loading="eager"
              />
              <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--bg) 65%, transparent))" }} />
            </div>

            <div className="absolute -start-4 md:-start-8 top-10 anim-float" style={{ animationDelay: "0s" }}>
              <span className="chip text-xs md:text-sm px-3.5 py-1.5 backdrop-blur" style={{ background: "color-mix(in srgb, var(--surface) 88%, transparent)" }}>
                هوية بصرية
              </span>
            </div>
            <div className="absolute -end-3 md:-end-7 top-1/3 anim-float" style={{ animationDelay: "1.4s" }}>
              <span className="chip text-xs md:text-sm px-3.5 py-1.5 backdrop-blur" style={{ background: "color-mix(in srgb, var(--surface) 88%, transparent)" }}>
                موشن جرافيك
              </span>
            </div>
            <div className="absolute start-6 -bottom-4 anim-float" style={{ animationDelay: "2.6s" }}>
              <span className="chip text-xs md:text-sm px-3.5 py-1.5 backdrop-blur" style={{ background: "color-mix(in srgb, var(--surface) 88%, transparent)" }}>
                إعلانات وريلز
              </span>
            </div>

            <div
              className="absolute -bottom-7 start-1/2 -translate-x-1/2 lg:-start-4 lg:translate-x-0 whitespace-nowrap card px-5 py-3"
              style={{ background: "color-mix(in srgb, var(--surface) 90%, transparent)", backdropFilter: "blur(8px)" }}
            >
              <span className="font-en text-sm font-bold tracking-[0.2em]" style={{ color: "var(--primary)" }}>
                {brandName}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
