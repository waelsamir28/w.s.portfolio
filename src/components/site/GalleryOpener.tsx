"use client";

import { useState } from "react";
import Lightbox, { type LightboxImage } from "./Lightbox";
import { IconExpand } from "./icons";

/** زر يفتح الصورة داخل Lightbox — الغلاف والمعرض. */
export default function GalleryOpener({
  images,
  initial = 0,
  small = false,
}: {
  images: LightboxImage[];
  initial?: number;
  small?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const img = images[initial];
  if (!img) return null;

  return (
    <button
      type="button"
      className="group relative block w-full overflow-hidden cursor-zoom-in"
      style={{ borderRadius: small ? "calc(var(--radius)*.8)" : "calc(var(--radius)*1.2)" }}
      onClick={() => setOpen(true)}
      aria-label={`تكبير الصورة: ${img.alt || "صورة"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.url}
        alt={img.alt}
        loading="lazy"
        className="w-full block"
        style={{
          objectFit: "cover",
          aspectRatio: small ? "4/3" : "16/9",
          transition: "transform .6s cubic-bezier(.22,1,.36,1)",
        }}
      />
      <span
        className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center w-12 h-12 opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{ background: "rgba(10,10,12,.55)", backdropFilter: "blur(4px)", borderRadius: "999px", color: "#fff" }}
      >
        <IconExpand className="w-5 h-5" />
      </span>
      {open && <Lightbox images={images} startIndex={initial} onClose={() => setOpen(false)} />}
    </button>
  );
}
