// Zero-dependency build.
//  1. Loads /content (managed from /admin) and validates it — invalid content stops the deploy.
//  2. Bundles CSS + JS + content into dist/index.html.
//  3. Copies /content/uploads → dist/uploads and /admin → dist/admin.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { loadContent, validateContent } from "./scripts/content.mjs";
const root = new URL(".", import.meta.url).pathname.replace(/\/$/, "");
const u = (p) => new URL(p, import.meta.url);
const r = (p) => readFileSync(u(p), "utf8");
const ARTIFACT = !!process.env.ARTIFACT;
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const SITE_URL = (process.env.SITE_URL || (vercelUrl ? "https://" + vercelUrl : "") || "https://www.misralmahaba.example").replace(/\/$/, "");

const content = loadContent(root);
const { errors, warnings } = validateContent(content, root);
warnings.forEach((w) => console.log(w));
if (errors.length) { errors.forEach((e) => console.error(e)); console.error(`\nBuild stopped: ${errors.length} content error(s).`); process.exit(1); }
const strip = (x) => JSON.parse(JSON.stringify(x, (k, v) => (k === "file" ? undefined : v)));
const CONTENT = { ...strip(content), siteUrl: SITE_URL };

let contentJs = `const CONTENT = ${JSON.stringify(CONTENT)};\nconst BUILD = ${JSON.stringify({ imageCdn: process.env.VERCEL_IMAGES === "1" && !ARTIFACT, time: new Date().toISOString() })};`;
if (ARTIFACT) { // inline referenced uploads for the single-file preview
  const media = {};
  for (const f of readdirSync(u("content/uploads/"))) { const p = "/uploads/" + f; if (contentJs.includes(p)) media[p] = `data:image/${f.split(".").pop().replace("jpg", "jpeg")};base64,` + readFileSync(u("content/uploads/" + f)).toString("base64"); }
  contentJs += `\nconst INLINE_MEDIA = ${JSON.stringify(media)};`;
}

const css = ["tokens", "base", "components", "sections"].map((f) => r(`src/styles/${f}.css`)).join("\n").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n\s*\n/g, "\n");
const js = [contentJs, ...["src/utils/i18n.js", "src/data/index.js", "src/services/api.js", "src/utils/core.js", "src/components/ui.js",
  "src/pages/home.js", "src/pages/catalog.js", "src/pages/people.js", "src/pages/booking.js", "src/main.js"].map(r)].join("\n;\n").replaceAll("</script", "<\\/script");

const G = content.settings.general;
const favicon = ARTIFACT ? "" : `<link rel="icon" href="${G.favicon || G.logo}">`;
const head = `<title>${G.name.ar}</title>
<meta name="description" content="${(G.seoDescription?.ar || "").replace(/"/g, "&quot;")}">
<meta name="theme-color" content="#0F6CB4">
${favicon}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Readex+Pro:wght@500;600&display=swap">
<style>${css}</style>`;
const body = `<div id="app"><noscript><p style="padding:2rem">يرجى تفعيل JavaScript لعرض الموقع.</p></noscript></div>\n<script>${js}</script>`;

rmSync(u("dist/"), { recursive: true, force: true });
mkdirSync(u("dist/"), { recursive: true });
if (ARTIFACT) writeFileSync(u("dist/artifact.html"), `${head}\n${body}\n`);
writeFileSync(u("dist/index.html"), `<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`);
cpSync(u("content/uploads/"), u("dist/uploads/"), { recursive: true });
if (existsSync(u("admin/"))) {
  cpSync(u("admin/"), u("dist/admin/"), { recursive: true });
  // Fill the dashboard's GitHub repo/branch automatically from Vercel's build environment
  // Repo resolution order: CMS_REPO env → GITHUB_REPO in admin/config.js → Vercel Git env → git remote
  const fromUrl = (x) => (String(x || "").match(/github\.com[/:]([^/\s]+\/[^/\s]+?)(?:\.git)?\/?$/) || [])[1];
  let gitRemote = "";
  try { gitRemote = execSync("git config --get remote.origin.url", { cwd: root, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch {}
  const rawCfg = r("admin/config.js");
  const pinned = (rawCfg.match(/const GITHUB_REPO = "([^"]*)"/) || [])[1];
  const repo = process.env.CMS_REPO || pinned || (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}` : "") || fromUrl(gitRemote) || "";
  if (repo) console.log(`✔ dashboard repo: ${repo}`);
  else console.warn("⚠ dashboard repo not detected — set GITHUB_REPO in admin/config.js or CMS_REPO in Vercel environment variables");
  const cfg = rawCfg.replace('const GITHUB_REPO = "' + (pinned || "") + '"', 'const GITHUB_REPO = "' + repo + '"').replace("__BRANCH__", process.env.CMS_BRANCH || process.env.VERCEL_PRODUCTION_BRANCH || "main").replaceAll("__SITE_URL__", SITE_URL);
  writeFileSync(u("dist/admin/config.js"), cfg);
}

// sitemap + robots generated from content
const paths = ["/", "/about", "/departments", "/services", "/doctors", "/facilities", "/news", "/booking", "/contact",
  ...content.departments.filter((d) => d.published !== false).map((d) => "/departments/" + d.slug),
  ...content.services.filter((s) => s.published !== false).map((s) => "/services/" + s.slug),
  ...content.doctors.filter((d) => d.published !== false).map((d) => "/doctors/" + d.id),
  ...content.news.filter((n) => n.published !== false).map((n) => "/news/" + n.slug)];
const en = (p) => SITE_URL + "/en" + (p === "/" ? "" : p);
writeFileSync(u("dist/sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  paths.flatMap((p) => [SITE_URL + p, en(p)].map((loc) => `  <url><loc>${loc}</loc><xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL + p}"/><xhtml:link rel="alternate" hreflang="en" href="${en(p)}"/></url>`)).join("\n") + "\n</urlset>\n");
writeFileSync(u("dist/robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`✔ built dist/ (${(readFileSync(u("dist/index.html")).length / 1024).toFixed(0)}KB) · ${content.departments.length} departments · ${content.services.length} services · ${content.doctors.length} doctors · ${content.news.length} news`);
