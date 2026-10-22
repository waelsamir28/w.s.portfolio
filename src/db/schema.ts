import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

/* ---------- أنواع مستندات الإعدادات (محتوى الموقع + التصميم) ---------- */

export type GalleryImage = { url: string; alt: string };

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type ProcessStep = { title: string; body: string };

export type DesignSettings = {
  theme: "dark" | "light";
  colors: {
    primary: string;
    accent: string;
    bg: string;
    surface: string;
    text: string;
    muted: string;
    button: string;
    buttonText: string;
    link: string;
  };
  fonts: { arabic: string; latin: string };
  headingScale: "md" | "lg" | "xl";
  radius: number;
  shadow: "none" | "soft" | "strong";
  grid: "uniform" | "featured";
  animations: boolean;
};

export type SiteSettingsDoc = {
  brand: { name: string; nameAr: string; title: string; tagline: string };
  hero: {
    title: string;
    subtitle: string;
    btnWorks: string;
    btnRequest: string;
    btnContact: string;
  };
  featured: { title: string; subtitle: string };
  services: { title: string; subtitle: string; items: ServiceItem[] };
  about: { title: string; body: string; imageUrl: string };
  skills: { title: string; subtitle: string; items: string[] };
  process: { title: string; subtitle: string; steps: ProcessStep[] };
  cta: {
    title: string;
    body: string;
    btnRequest: string;
    btnWhatsapp: string;
    btnMore: string;
  };
  portfolio: { title: string; subtitle: string };
  contact: {
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    whatsapp: string;
    location: string;
  };
  social: Record<string, string>;
  footer: { about: string; privacyTitle: string; privacyBody: string };
  sections: { order: string[]; visibility: Record<string, boolean> };
  design: DesignSettings;
};

/* ---------- جدول مسؤولي النظام ---------- */

export const admins = pgTable("admins", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text().notNull().unique(),
  passwordHash: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

/* ---------- جلسات تسجيل الدخول ---------- */

export const sessions = pgTable("sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  adminId: integer()
    .notNull()
    .references(() => admins.id, { onDelete: "cascade" }),
  tokenHash: text().notNull().unique(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

/* ---------- تصنيفات الأعمال ---------- */

export const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  description: text().notNull().default(""),
  visible: boolean().notNull().default(true),
  sortOrder: integer().notNull().default(0),
});

/* ---------- المشاريع ---------- */

export const projects = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: text().notNull().unique(),
  title: text().notNull(),
  categoryId: integer().references(() => categories.id, {
    onDelete: "set null",
  }),
  coverImage: text().notNull().default(""),
  gallery: jsonb().$type<GalleryImage[]>().default([]),
  videoUrl: text().notNull().default(""),
  description: text().notNull().default(""),
  goal: text().notNull().default(""),
  servicesDone: jsonb().$type<string[]>().default([]),
  role: text().notNull().default(""),
  tools: jsonb().$type<string[]>().default([]),
  projectDate: text().notNull().default(""),
  tags: jsonb().$type<string[]>().default([]),
  featured: boolean().notNull().default(false),
  hidden: boolean().notNull().default(false),
  status: text().notNull().default("draft"), // draft | published
  sortOrder: integer().notNull().default(0),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

/* ---------- إعدادات الموقع (مسودة + منشور) ---------- */

export const siteSettings = pgTable("site_settings", {
  id: integer().primaryKey().default(1),
  draft: jsonb().$type<SiteSettingsDoc>(),
  published: jsonb().$type<SiteSettingsDoc>(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

/* ---------- طلبات العملاء ---------- */

export const clientRequests = pgTable("client_requests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  email: text().notNull(),
  phone: text().notNull().default(""),
  serviceType: text().notNull().default(""),
  description: text().notNull(),
  budget: text().notNull().default(""),
  deadline: text().notNull().default(""),
  attachments: jsonb().$type<string[]>().default([]),
  status: text().notNull().default("new"), // new | review | contacted | done | rejected
  adminNotes: text().notNull().default(""),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

/* ---------- سجل العمليات الإدارية ---------- */

export const activityLog = pgTable("activity_log", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  adminId: integer().references(() => admins.id, { onDelete: "set null" }),
  action: text().notNull(),
  details: text().notNull().default(""),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

/* ---------- عداد الزيارات (بيانات حقيقية) ---------- */

export const pageViews = pgTable("page_views", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  path: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ClientRequest = typeof clientRequests.$inferSelect;
