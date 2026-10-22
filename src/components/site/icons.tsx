import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function base(props: P) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export const IconPalette = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21a9 9 0 1 1 9-9c0 2.5-2 3-3.5 3H15a2 2 0 0 0-1.5 3.3c.4.5.5 1.7-1.5 1.7Z" />
    <circle cx="7.8" cy="10.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="16.2" cy="10.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconMegaphone = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 11v3a1 1 0 0 0 1 1h2l3 5h2v-5" />
    <path d="M11 15V9l8-4v14l-8-4Z" />
    <path d="M21 10v4" />
  </svg>
);

export const IconBadge = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
    <path d="m8.5 13.5-1.5 7 5-3 5 3-1.5-7" />
  </svg>
);

export const IconPrinter = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 9V3h12v6" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M6 14h12v7H6z" />
  </svg>
);

export const IconSign = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M12 16v5M8 21h8" />
    <path d="M7 8h10M7 12h6" />
  </svg>
);

export const IconFilm = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
  </svg>
);

export const IconReels = (p: P) => (
  <svg {...base(p)}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M10 6h4M10.5 12.2 14 15l-3.5 2.8Z" />
  </svg>
);

export const IconUi = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="4" width="19" height="14" rx="2" />
    <path d="M2.5 8h19M6 6.2h.01M8.5 6.2h.01M10.5 6.2h.01" />
    <path d="M9 21h6M12 18v3" />
  </svg>
);

export const IconStore = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9 5.5 4h13L20 9" />
    <path d="M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
    <path d="M5 11.5V20h14v-8.5" />
    <path d="M9 20v-5h6v5" />
  </svg>
);

export const IconArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const IconArrowDown = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);

export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconWhatsApp = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" />
    <path d="M9 8.5c0 4 2.5 6.5 6.5 6.5l.9-1.9-2.4-1.1-1 .9a5.6 5.6 0 0 1-1.9-1.9l.9-1-1.1-2.4Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
);

export const IconSpark = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </svg>
);

export const IconExternal = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 5h5v5M19 5l-8 8M12 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6" />
  </svg>
);

export const IconEye = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

export const IconEyeOff = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 4l16 16M9.9 5.9A9.5 9.5 0 0 1 12 5.5c6.5 0 10 6.5 10 6.5a17 17 0 0 1-3 3.8M6.6 6.9A16.4 16.4 0 0 0 2 12s3.5 6.5 10 6.5a9.8 9.8 0 0 0 4-.8" />
    <path d="M9.9 9.9a2.8 2.8 0 0 0 4 4" />
  </svg>
);

export const IconStar = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 3 2.7 5.6 6.3.8-4.6 4.3 1.2 6.1L12 16.9 6.4 19.8l1.2-6.1L3 9.4l6.3-.8Z" />
  </svg>
);

export const IconChevronUp = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 14 6-6 6 6" />
  </svg>
);

export const IconChevronDown = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 10 6 6 6-6" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconExpand = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
  </svg>
);

/* ===== أيقونات السوشيال ===== */

export const IconFacebook = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 8h2.5V4.5H14a4 4 0 0 0-4 4V11H7.5v3.5H10v5h3.5v-5h2.6l.6-3.5h-3.2V9a1 1 0 0 1 .5-.9Z" />
  </svg>
);

export const IconInstagram = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconBehance = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 6.5h5a2.5 2.5 0 0 1 0 5H3zM3 11.5h5.5a2.5 2.5 0 0 1 0 5H3zM3 6.5v10" />
    <path d="M14 14.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0ZM14 14.5h6" />
    <path d="M14.5 7.5h5" />
  </svg>
);

export const IconDribbble = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M6 6.8c3.5 3 8.5 4.5 14.3 3.4M4 13.7c5.5-1.4 10.7.3 13.7 5M9.2 3.7c3.4 4.5 5.3 9.8 5.8 16" />
  </svg>
);

export const IconLinkedIn = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8 10.5V17M8 7.5v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10.5V17" />
  </svg>
);

export const IconYouTube = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
    <path d="m10 9.5 5 2.5-5 2.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconTikTok = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.46" />
    <path d="M14 5.5c.8 1.8 2.4 3 4.5 3.2" />
  </svg>
);

export const SERVICE_ICONS: Record<string, (p: P) => React.ReactElement> = {
  palette: IconPalette,
  megaphone: IconMegaphone,
  badge: IconBadge,
  printer: IconPrinter,
  sign: IconSign,
  film: IconFilm,
  reels: IconReels,
  ui: IconUi,
  store: IconStore,
};

export const SOCIAL_ICONS: Record<string, (p: P) => React.ReactElement> = {
  facebook: IconFacebook,
  instagram: IconInstagram,
  behance: IconBehance,
  dribbble: IconDribbble,
  linkedin: IconLinkedIn,
  youtube: IconYouTube,
  tiktok: IconTikTok,
};
