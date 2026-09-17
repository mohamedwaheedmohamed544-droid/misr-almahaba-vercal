import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { loadContent, validateContent } from "./content.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
try {
  const { errors, warnings } = validateContent(loadContent(root), root);
  warnings.forEach((w) => console.log(w));
  if (errors.length) { errors.forEach((e) => console.error(e)); console.error(`\n${errors.length} خطأ في المحتوى — تم إيقاف النشر.`); process.exit(1); }
  console.log(`✔ المحتوى سليم (${warnings.length} تنبيه)`);
} catch (e) { console.error("✖", e.message); process.exit(1); }
