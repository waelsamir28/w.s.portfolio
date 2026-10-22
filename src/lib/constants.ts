/** ثوابت مشتركة آمنة للاستخدام من مكونات العميل (بدون استيراد قاعدة البيانات). */

export const SECTION_IDS = [
  "hero",
  "featured",
  "services",
  "about",
  "skills",
  "process",
  "cta",
] as const;

export const SECTION_LABELS: Record<string, string> = {
  hero: "القسم الافتتاحي",
  featured: "الأعمال المميزة",
  services: "الخدمات",
  about: "نبذة عني",
  skills: "المهارات والتخصصات",
  process: "آلية العمل",
  cta: "الدعوة للتواصل",
};

export const SOCIAL_KEYS = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "behance", label: "Behance" },
  { key: "dribbble", label: "Dribbble" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
] as const;
