/* =========================================================
   UTILITIES — escaping, icons, formatting, SEO, motion, calling
   ========================================================= */
const esc = (v) => String(tr(v) ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
/* Value, or a visible "pending approval" marker when the field is empty in the dashboard */
const val = (v, label = "") => (isFilled(v) ? esc(v) : `<span class="tbd">${label ? esc(label) + " — " : ""}${esc(t("pending"))}</span>`);

/* Icon set (24px, 1.75 stroke) */
const ICON_PATHS = {
  pulse: '<path d="M3 12h4l2.5-6 5 12L17 12h4"/>',
  heart: '<path d="M12 20s-7-4.4-9-9.2C1.7 7.4 4 4 7.4 4c2 0 3.5 1.1 4.6 2.6C13.1 5.1 14.6 4 16.6 4 20 4 22.3 7.4 21 10.8 19 15.6 12 20 12 20z"/>',
  drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
  scalpel: '<path d="M14.5 3.5 20.5 9.5 10 20H4v-6z"/><path d="m12 6 6 6"/>',
  baby: '<circle cx="12" cy="9" r="5"/><path d="M10 9h.01M14 9h.01M10.5 11.5c.9.6 2.1.6 3 0"/><path d="M6 20c1.5-2.5 3.6-3.5 6-3.5s4.5 1 6 3.5"/>',
  stethoscope: '<path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M10 12v2a5 5 0 0 0 10 0v-1"/><circle cx="20" cy="11" r="2"/>',
  motion: '<circle cx="13" cy="4.5" r="1.8"/><path d="m9 21 2.5-6 3 2.5V21"/><path d="M6.5 11.5 9 8l4 .5 2.5 3.5 3 1"/><path d="m11.5 15 1.5-6.5"/>',
  tooth: '<path d="M7.5 3C5 3 3.5 5 3.5 7.5c0 3 1.5 4.5 2 7.5.4 2.6 1 6 2.5 6s1.8-4.5 4-4.5 2.5 4.5 4 4.5 2.1-3.4 2.5-6c.5-3 2-4.5 2-7.5C20.5 5 19 3 16.5 3 14.5 3 13.5 4 12 4S9.5 3 7.5 3z"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
  scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="3.5"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  spine: '<path d="M12 2v20"/><rect x="8" y="4" width="8" height="3.5" rx="1.5"/><rect x="8" y="10.25" width="8" height="3.5" rx="1.5"/><rect x="8" y="16.5" width="8" height="3.5" rx="1.5"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
  tablet: '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M9 7h6M9 11h6M9 15h3"/>',
  badge: '<circle cx="12" cy="9" r="6"/><path d="m9.5 9 1.7 1.7L14.5 7.5"/><path d="M8.5 14.3 7 21l5-2.5 5 2.5-1.5-6.7"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  phone: '<path d="M5 3.5h3.2l1.6 4-2 1.3a11 11 0 0 0 5.4 5.4l1.3-2 4 1.6V17a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.9-3.4 3.4-5.2 6.5-5.2s5.6 1.8 6.5 5.2"/><path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4M18 14.9c1.8.7 3 2.4 3.5 5.1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  arrow: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  back: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chev: '<path d="m14 6-6 6 6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M10 17h10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  map: '<path d="m3 6 6-2.5 6 2.5 6-2.5v14.5L15 20.5 9 18 3 20.5z"/><path d="M9 3.5V18M15 6v14.5"/>',
  hospital: '<path d="M4 21V8l8-5 8 5v13"/><path d="M10 21v-5h4v5M12 8v4M10 10h4"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  play: '<rect x="3" y="5" width="18" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
  facebook: '<path d="M14.5 8H17V4.5h-2.5A4 4 0 0 0 10.5 8.5V11H8v3.5h2.5V21H14v-6.5h2.6l.4-3.5h-3V9a1 1 0 0 1 1-1z"/>',
};
const icon = (name, cls = "") => `<svg class="i-${name} ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name] || ""}</svg>`;


/* ---------- Formatting (language-aware) ---------- */
const loc = () => LANGS[LANG].locale;
const fmtDate = (iso, opts = { day: "numeric", month: "long", year: "numeric" }) => new Intl.DateTimeFormat(loc(), opts).format(new Date(iso + "T00:00:00"));
const toISO = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const fmtTime = (s) => { const [h, m] = s.split(":").map(Number); const hh = ((h + 11) % 12) + 1; return `${hh}:${String(m).padStart(2, "0")} ${h >= 12 ? t("pm") : t("am")}`; };
const normalize = (s) => String(s || "").toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");
const comma = () => (LANG === "ar" ? "، " : ", ");
const bothLangs = (v) => (v && typeof v === "object" && "ar" in v ? v.ar + " " + v.en : String(v ?? ""));

const bySlug = {
  dept: (s) => DEPARTMENTS.find((d) => d.slug === s),
  service: (s) => SERVICES.find((d) => d.slug === s),
  doctor: (id) => DOCTORS.find((d) => d.id === id),
  news: (s) => NEWS.find((n) => n.slug === s),
};
/* Image URL: optional Vercel Image Optimization (set VERCEL_IMAGES=1) — widths must match vercel.json images.sizes */
const imgSrc = (path, w = 1200) => {
  if (!path) return null;
  if (typeof INLINE_MEDIA !== "undefined" && INLINE_MEDIA[path]) return INLINE_MEDIA[path];
  if (BUILD.imageCdn && path.startsWith("/")) { const sizes = [320, 640, 960, 1280, 1600, 1920]; const sw = sizes.find((s) => s >= w) || 1920; return `/_vercel/image?url=${encodeURIComponent(path)}&w=${sw}&q=80`; }
  return path.startsWith("/") && location.protocol === "file:" ? "." + path : path;
};

/* ---------- SEO ---------- */
const Seo = {
  set({ title, description, path = "/", jsonld }) {
    const full = title ? `${tr(title)} | ${t("siteName")}` : `${tr(SITE.name)} — ${tr(SITE.slogan)}`;
    document.title = full;
    const put = (attr, key, content) => { let m = document.head.querySelector(`meta[${attr}="${key}"]`); if (!m) { m = document.createElement("meta"); m.setAttribute(attr, key); document.head.appendChild(m); } m.setAttribute("content", content); };
    const desc = tr(description) || tr(SITE.seoDescription);
    put("name", "description", desc);
    put("property", "og:title", full); put("property", "og:description", desc); put("property", "og:type", "website");
    put("property", "og:locale", LANG === "ar" ? "ar_EG" : "en_GB");
    const url = (lang) => SITE.url + (lang === "en" ? "/en" : "") + (path === "/" && lang === "en" ? "" : path);
    put("property", "og:url", url(LANG));
    const setLink = (rel, href, hreflang) => { const sel = `link[rel="${rel}"]${hreflang ? `[hreflang="${hreflang}"]` : ""}`; let l = document.head.querySelector(sel); if (!l) { l = document.createElement("link"); l.rel = rel; if (hreflang) l.hreflang = hreflang; document.head.appendChild(l); } l.href = href; };
    setLink("canonical", url(LANG)); setLink("alternate", url("ar"), "ar"); setLink("alternate", url("en"), "en"); setLink("alternate", url("ar"), "x-default");
    let s = document.getElementById("route-jsonld");
    if (!s) { s = document.createElement("script"); s.type = "application/ld+json"; s.id = "route-jsonld"; document.head.appendChild(s); }
    s.textContent = JSON.stringify(jsonld || Seo.hospital());
  },
  hospital() {
    return { "@context": "https://schema.org", "@type": "Hospital", name: SITE.name.ar, alternateName: SITE.name.en, slogan: tr(SITE.slogan), url: SITE.url,
      telephone: SITE.phones[0].value, logo: SITE.url + (CONTENT.settings.general.logo || ""), sameAs: Object.values(SITE.social).filter(Boolean),
      address: { "@type": "PostalAddress", streetAddress: SITE.address.line.en, addressLocality: "Beni Mazar", addressRegion: "Minya", addressCountry: "EG" },
      medicalSpecialty: DEPARTMENTS.map((d) => d.name.en) };
  },
};
STR.siteName = SITE.name;

/* ---------- Motion ---------- */
const Motion = {
  reduced: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  io: null,
  observe(root = document) {
    const reduced = this.reduced();
    const items = $$("[data-rv]", root);
    const special = $$(".journey, [data-count], .cta-band", root);
    if (reduced || !("IntersectionObserver" in window)) { special.forEach((el) => this.reveal(el, true)); return; }
    this.io?.disconnect();
    this.io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { this.reveal(e.target); this.io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    const vh = window.innerHeight;
    items.forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.9) return; // visible on load → stays at rest
      el.classList.add("rv-armed");
      if (el.dataset.rv === "mask") el.classList.add("rv-mask");
      // stagger siblings in the same grid
      const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.hasAttribute("data-rv")) : [];
      const i = Math.max(0, sibs.indexOf(el));
      el.style.setProperty("--rv-delay", Math.min(i, 5) * 80 + "ms");
      this.io.observe(el);
    });
    special.forEach((el) => this.io.observe(el));
  },
  reveal(el, instant = false) {
    el.classList.add("rv-in", "is-in");
    if (el.dataset.count != null) this.countUp(el, instant);
  },
  countUp(el, instant) {
    const target = Number(el.dataset.count); const prefix = el.dataset.prefix || "";
    const fmt = (n) => prefix + new Intl.NumberFormat(loc()).format(n);
    if (instant) { el.textContent = fmt(target); return; }
    const dur = 1400; const t0 = performance.now();
    const step = (now) => { const p = Math.min(1, (now - t0) / dur); const e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(Math.round(target * e)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  },
  /* Scroll-linked: progress bar, header hide/show, hero parallax (rAF-throttled) */
  initScroll() {
    if (this._scrollBound) { this._update?.(); return; }
    this._scrollBound = true;
    let lastY = window.scrollY, ticking = false;
    const update = () => {
      const bar = $(".progress i"), header = $(".site-header"); if (!header) return;
      const y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
      bar?.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
      header.classList.toggle("is-scrolled", y > 8);
      const drawerOpen = $("#drawer")?.classList.contains("is-open");
      header.classList.toggle("is-hidden", !drawerOpen && y > 420 && y > lastY + 4);
      if (y < lastY - 4 || y < 420) header.classList.remove("is-hidden");
      if (!this.reduced()) {
        const img = $(".hero-frame img");
        if (img && y < 900) img.style.translate = `0 ${Math.min(y * 0.05, 22).toFixed(1)}px`;
      }
      lastY = y; ticking = false;
    };
    this._update = update;
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  },
  /* Cursor spotlight on cards (desktop only) */
  initSpotlight() {
    if (!window.matchMedia("(hover: hover)").matches) return;
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest?.(".card"); if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px"); card.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });
  },
};

/* ---------- Calling ---------- */
const Call = {
  /* Tries to open the dialer; if the page stays focused (desktop, or a sandboxed preview), shows a call sheet */
  start(tel = SITE.phones[0].value) {
    const href = "tel:" + tel;
    try { window.top.location.href = href; } catch (_) { /* sandboxed/cross-origin frame: fall back to the call sheet */ }
    setTimeout(() => { if (document.visibilityState === "visible" && document.hasFocus()) this.sheet(tel); }, 650);
  },
  sheet(tel) {
    let d = $("#call-dialog");
    if (!d) { d = document.createElement("dialog"); d.id = "call-dialog"; d.className = "call-dialog"; document.body.appendChild(d); }
    const main = SITE.phones.find((p) => p.value === tel) || SITE.phones[0];
    d.setAttribute("aria-labelledby", "call-title");
    d.innerHTML = `<div class="call-card">
      <button type="button" class="icon-btn close" data-dialog-close aria-label="${t("close")}">${icon("close")}</button>
      <span class="call-pulse">${icon("phone")}</span>
      <h2 class="h3" id="call-title">${t("callDialogTitle")}</h2>
      <a class="call-number num" href="tel:${main.value}" target="_top">${main.display}</a>
      <p class="muted" style="font-size:var(--fs-sm)">${t("callDialogText")}</p>
      <div class="call-actions">
        <a class="btn btn--lg btn--block" href="tel:${main.value}" target="_top">${icon("phone")}${t("callNow")}</a>
        <button type="button" class="btn btn--ghost btn--block" data-copy="${main.display}">${t("copy")}</button>
      </div>
      <div class="call-lines"><span>${t("otherLines")}</span>${SITE.phones.filter((p) => p !== main).map((p) => `<a class="num" href="tel:${p.value}" target="_top">${p.display}</a>`).join("")}</div>
    </div>`;
    if (!d.open) d.showModal?.();
    d.onclick = (e) => { if (e.target === d || e.target.closest("[data-dialog-close]")) d.close(); };
  },
};

const copyText = async (text, okKey = "copied") => {
  try { await navigator.clipboard.writeText(text); toast(t(okKey)); }
  catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast(t(okKey)); } catch {} ta.remove(); }
};

/* ---------- Toast ---------- */
const toast = (msg) => {
  let el = $(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el); }
  el.textContent = msg; el.classList.add("is-on");
  clearTimeout(el._h); el._h = setTimeout(() => el.classList.remove("is-on"), 2600);
};
