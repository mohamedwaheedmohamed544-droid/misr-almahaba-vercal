// Loads every JSON file under /content and validates it.
// Used by build.mjs (the build FAILS on errors, so a broken edit never goes live)
// and by `npm run validate` / the GitHub Action on every push & pull request.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const readJson = (file) => {
  try { return JSON.parse(readFileSync(file, "utf8")); }
  catch (e) { throw new Error(`ملف JSON غير صالح / Invalid JSON: ${file}\n${e.message}`); }
};
const folder = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => ({ file: join(dir, f), ...readJson(join(dir, f)) })) : []);

export function loadContent(root) {
  const c = join(root, "content");
  return {
    settings: { general: readJson(join(c, "settings/general.json")), contact: readJson(join(c, "settings/contact.json")), stats: readJson(join(c, "settings/stats.json")), categories: readJson(join(c, "settings/categories.json")) },
    pages: { home: readJson(join(c, "pages/home.json")), about: readJson(join(c, "pages/about.json")), facilities: readJson(join(c, "pages/facilities.json")) },
    departments: folder(join(c, "departments")),
    services: folder(join(c, "services")),
    doctors: folder(join(c, "doctors")),
    news: folder(join(c, "news")),
  };
}

export function validateContent(C, root) {
  const errors = [], warnings = [];
  const err = (where, msg) => errors.push(`✖ ${where}: ${msg}`);
  const warn = (where, msg) => warnings.push(`⚠ ${where}: ${msg}`);
  const rel = (f) => (f ? f.replace(root + "/", "") : "");
  const filled = (v) => v && String(v.ar || "").trim() !== "";
  const needBi = (where, obj, field) => { if (!filled(obj?.[field])) err(where, `الحقل «${field}» بالعربية مطلوب`); else if (!String(obj[field].en || "").trim()) warn(where, `الترجمة الإنجليزية لـ «${field}» فارغة`); };
  const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
  const imageOk = (where, p) => { if (p && p.startsWith("/uploads/") && !existsSync(join(root, "content", p))) err(where, `الصورة غير موجودة: ${p}`); };
  const unique = (list, key, label) => { const seen = new Set(); list.forEach((x) => { if (seen.has(x[key])) err(rel(x.file), `${label} مكرر: ${x[key]}`); seen.add(x[key]); }); };

  const G = C.settings.general;
  needBi("settings/general.json", G, "name"); imageOk("settings/general.json", G.logo);
  const phones = (C.settings.contact.phones || []).filter((p) => p.number);
  if (!phones.length) err("settings/contact.json", "أضف رقم هاتف واحد على الأقل");
  phones.forEach((p) => { if (!/^[+\d][\d\s-]{5,}$/.test(p.number)) err("settings/contact.json", `رقم هاتف غير صالح: ${p.number}`); });

  const deptCats = new Set(C.settings.categories.departments.map((x) => x.id));
  const svcCats = new Set(C.settings.categories.services.map((x) => x.id));
  const deptSlugs = new Set(C.departments.map((d) => d.slug));
  const svcSlugs = new Set(C.services.map((s) => s.slug));

  unique(C.departments, "slug", "المعرّف"); unique(C.services, "slug", "المعرّف"); unique(C.doctors, "id", "المعرّف"); unique(C.news, "slug", "المعرّف");

  C.departments.forEach((d) => {
    const w = rel(d.file);
    if (!slugRe.test(d.slug || "")) err(w, "المعرّف (slug) يجب أن يكون حروف إنجليزية صغيرة وأرقام وشرطات فقط");
    needBi(w, d, "name"); needBi(w, d, "summary");
    if (!deptCats.has(d.category)) err(w, `الفئة غير معروفة: ${d.category}`);
    (d.services || []).forEach((s) => { if (!svcSlugs.has(s)) err(w, `خدمة مرتبطة غير موجودة: ${s}`); });
    imageOk(w, d.image);
  });
  C.services.forEach((s) => {
    const w = rel(s.file);
    if (!slugRe.test(s.slug || "")) err(w, "المعرّف (slug) غير صالح");
    needBi(w, s, "name"); needBi(w, s, "summary");
    if (!svcCats.has(s.category)) err(w, `الفئة غير معروفة: ${s.category}`);
    if (s.dept && !deptSlugs.has(s.dept)) err(w, `القسم المرتبط غير موجود: ${s.dept}`);
    imageOk(w, s.image);
  });
  C.doctors.forEach((d) => {
    const w = rel(d.file);
    if (!slugRe.test(d.id || "")) err(w, "المعرّف (id) غير صالح");
    needBi(w, d, "name"); needBi(w, d, "title");
    if (!deptSlugs.has(d.dept)) err(w, `القسم غير موجود: ${d.dept}`);
    (d.services || []).forEach((s) => { if (!svcSlugs.has(s)) err(w, `خدمة غير موجودة: ${s}`); });
    (d.schedule || []).forEach((s, i) => {
      if (!timeRe.test(s.from || "") || !timeRe.test(s.to || "")) err(w, `موعد رقم ${i + 1}: الوقت يجب أن يكون بصيغة HH:MM`);
      else if (s.from >= s.to) err(w, `موعد رقم ${i + 1}: وقت البداية يجب أن يكون قبل النهاية`);
      if (!/^[0-6]$/.test(String(s.day))) err(w, `موعد رقم ${i + 1}: اليوم غير صالح`);
    });
    if (!(d.schedule || []).length) warn(w, "لا توجد مواعيد عمل للطبيب");
    imageOk(w, d.photo);
  });
  C.news.forEach((n) => {
    const w = rel(n.file);
    if (!slugRe.test(n.slug || "")) err(w, "المعرّف (slug) غير صالح");
    if (!/^\d{4}-\d{2}-\d{2}/.test(n.date || "")) err(w, "التاريخ مطلوب");
    needBi(w, n, "title");
    if (n.source?.url && !/^https?:\/\//.test(n.source.url)) err(w, "رابط المصدر يجب أن يبدأ بـ http");
    imageOk(w, n.image);
  });
  (C.pages.home.featuredDepartments || []).forEach((s) => { if (!deptSlugs.has(s)) err("pages/home.json", `قسم مميز غير موجود: ${s}`); });
  imageOk("pages/home.json", C.pages.home.hero?.image);
  return { errors, warnings };
}
