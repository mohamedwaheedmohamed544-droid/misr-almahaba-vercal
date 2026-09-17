/* =========================================================
   DATA ADAPTER
   All editable content lives in /content (JSON) and is managed from the
   dashboard at /admin. build.mjs injects it here as `CONTENT`.
   This file only shapes that content for the UI — no content in code.
   ========================================================= */
const byOrder = (a, b) => (a.order ?? 999) - (b.order ?? 999);
const isFilled = (v) => v != null && (typeof v === "object" && "ar" in v ? String(v.ar || v.en || "").trim() !== "" : String(v).trim() !== "");
const telHref = (n) => { const d = String(n || "").replace(/[^\d+]/g, ""); return d.startsWith("+") ? d : d.startsWith("00") ? "+" + d.slice(2) : d.startsWith("0") ? "+20" + d.slice(1) : d; };

const G = CONTENT.settings.general, C = CONTENT.settings.contact;

const SITE = {
  name: G.name, shortName: G.shortName, slogan: G.slogan, affiliation: G.affiliation,
  seoDescription: G.seoDescription, announcement: G.announcement || { enabled: false },
  address: C.address,
  phones: (C.phones || []).filter((p) => p.number).map((p) => ({ label: p.label, value: telHref(p.number), display: p.display || p.number })),
  whatsapp: C.whatsapp ? telHref(C.whatsapp).replace("+", "") : "",
  email: C.email, hours: C.hours || {}, social: C.social || {},
  mapsUrl: C.mapsUrl, mapImage: C.mapImage,
  url: (CONTENT.siteUrl || G.siteUrl || "https://www.misralmahaba.example").replace(/\/$/, ""),
  logo: () => imgSrc(G.logo, 160),
};
if (!SITE.phones.length) SITE.phones.push({ label: { ar: "", en: "" }, value: "", display: "—" });

const STATS = CONTENT.settings.stats.enabled === false ? null : {
  asOf: CONTENT.settings.stats.asOf, source: CONTENT.settings.stats.source,
  items: (CONTENT.settings.stats.items || []).map((i) => ({ n: Number(i.number) || 0, prefix: i.prefix || "", label: i.label })),
};

const NAV = [
  { path: "/", key: "home" }, { path: "/about", key: "about" }, { path: "/departments", key: "departments" },
  { path: "/services", key: "services" }, { path: "/doctors", key: "doctors" }, { path: "/facilities", key: "facilities" },
  { path: "/news", key: "news" }, { path: "/contact", key: "contact" },
];

const DEPARTMENTS = CONTENT.departments.filter((d) => d.published !== false).sort(byOrder);
const DEPT_CATEGORIES = [{ id: "all", label: { ar: "الكل", en: "All" } }, ...CONTENT.settings.categories.departments];
const SERVICE_CATEGORIES = [{ id: "all", label: { ar: "كل الخدمات", en: "All services" } }, ...CONTENT.settings.categories.services];
const SERVICES = CONTENT.services.filter((s) => s.published !== false).sort(byOrder).map((s) => ({ ...s, dept: s.dept || null, services: s.services || [] }));
DEPARTMENTS.forEach((d) => { d.services = (d.services || []).filter((slug) => SERVICES.some((s) => s.slug === slug)); d.offers ||= []; d.forWhom ||= []; });

const DOCTORS = CONTENT.doctors.filter((d) => d.published !== false && DEPARTMENTS.some((x) => x.slug === d.dept)).sort(byOrder).map((d) => ({
  ...d, demo: !!d.sample, services: (d.services || []).filter((slug) => SERVICES.some((s) => s.slug === slug)), qualifications: d.qualifications || [],
  schedule: (d.schedule || []).map((s) => ({ day: Number(s.day), from: s.from, to: s.to })).filter((s) => s.from && s.to && s.from < s.to).sort((a, b) => a.day - b.day || a.from.localeCompare(b.from)),
}));

const DAY_NAMES = [{ ar: "الأحد", en: "Sunday" }, { ar: "الاثنين", en: "Monday" }, { ar: "الثلاثاء", en: "Tuesday" }, { ar: "الأربعاء", en: "Wednesday" }, { ar: "الخميس", en: "Thursday" }, { ar: "الجمعة", en: "Friday" }, { ar: "السبت", en: "Saturday" }];

const HOME = CONTENT.pages.home;
const ABOUT = CONTENT.pages.about;
const FACILITIES = CONTENT.pages.facilities.items || [];
const WHY = HOME.why || [];
const NEWS = CONTENT.news.filter((n) => n.published !== false).sort((a, b) => String(b.date).localeCompare(String(a.date))).map((n) => ({ ...n, body: n.body || [], source: n.source || {} }));
