"use client";

import { useCallback, useEffect, useState } from "react";
import { IconChevronDown, IconClose } from "./icons";

export type LightboxImage = { url: string; alt: string };

export default function Lightbox({
  images,
  startIndex = 0,
  onClose,
}: {
  images: LightboxImage[];
  startIndex?: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const total = images.length;

  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") next(); // في RTL: يسار = التالي
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [next, prev, onClose]);

  if (!images[index]) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 anim-fade"
      style={{ background: "rgba(8, 8, 10, 0.92)", backdropFilter: "blur(8px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="معرض الصور"
      onClick={onClose}
    >
      <button
        className="absolute top-4 end-4 grid place-items-center w-11 h-11 text-white/80 hover:text-white transition-colors"
        style={{ border: "1px solid rgba(255,255,255,.2)", borderRadius: "999px" }}
        onClick={onClose}
        aria-label="إغلاق"
      >
        <IconClose className="w-5 h-5" />
      </button>

      {total > 1 && (
        <div className="absolute top-5 start-1/2 -translate-x-1/2 text-white/60 text-sm font-en" dir="ltr">
          {index + 1} / {total}
        </div>
      )}

      <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]!.url}
          alt={images[index]!.alt || "صورة المشروع"}
          className="w-full max-h-[78vh] object-contain mx-auto"
          style={{ borderRadius: "12px" }}
        />
        {images[index]!.alt && (
          <p className="text-center text-sm text-white/70 mt-4">{images[index]!.alt}</p>
        )}
      </div>

      {total > 1 && (
        <div className="flex items-center gap-3 mt-5" onClick={(e) => e.stopPropagation()}>
          <button
            className="grid place-items-center w-11 h-11 text-white/80 hover:text-white"
            style={{ border: "1px solid rgba(255,255,255,.2)", borderRadius: "999px" }}
            onClick={prev}
            aria-label="السابق"
          >
            <IconChevronDown className="w-5 h-5 -rotate-90" />
          </button>
          <button
            className="grid place-items-center w-11 h-11 text-white/80 hover:text-white"
            style={{ border: "1px solid rgba(255,255,255,.2)", borderRadius: "999px" }}
            onClick={next}
            aria-label="التالي"
          >
            <IconChevronDown className="w-5 h-5 rotate-90" />
          </button>
        </div>
      )}
    </div>
  );
}
