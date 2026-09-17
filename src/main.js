/* =========================================================
   ROUTER + APP SHELL
   #/path → Arabic (default) · #/en/path → English.
   Mirrors production URLs: /departments/dialysis and /en/departments/dialysis.
   ========================================================= */
const ROUTES = [
  ["/", HomePage], ["/about", AboutPage],
  ["/departments", DepartmentsPage], ["/departments/:slug", DepartmentDetailPage],
  ["/services", ServicesPage], ["/services/:slug", ServiceDetailPage],
  ["/doctors", DoctorsPage], ["/doctors/:id", DoctorProfilePage],
  ["/facilities", FacilitiesPage],
  ["/news", NewsPage], ["/news/:slug", NewsDetailPage],
  ["/booking", BookingPage], ["/contact", ContactPage],
];

function parseHash() {
  let raw = location.hash.replace(/^#/, "") || "/";
  const [pathPart, query = ""] = raw.split("?");
  let path = pathPart || "/", lang = "ar";
  if (path === "/en" || path.startsWith("/en/")) { lang = "en"; path = path.slice(3) || "/"; }
  return { path, lang, query };
}

function matchRoute(path) {
  for (const [pattern, page] of ROUTES) {
    const keys = [];
    const re = new RegExp("^" + pattern.replace(/:[^/]+/g, (k) => { keys.push(k.slice(1)); return "([^/]+)"; }) + "/?$");
    const m = path.match(re);
    if (m) return { page, params: Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
  }
  return { page: NotFoundPage, params: {} };
}

const App = {
  main: null, shellLang: null, first: true, current: { path: "/", query: "" },

  renderShell() {
    const root = document.documentElement;
    root.lang = LANG; root.dir = LANGS[LANG].dir;
    $("#app").innerHTML = `${UI.header()}<main id="main" tabindex="-1"></main>${UI.footer()}${UI.mobileBar()}`;
    this.main = $("#main");
    this.shellLang = LANG;
    Motion.initScroll();
  },

  async route() {
    const { path, lang, query } = parseHash();
    if (!path.startsWith("/")) return;
    const langChanged = lang !== LANG || !this.main;
    LANG = lang;
    if (langChanged) this.renderShell();
    this.current = { path, query };
    const { page, params } = matchRoute(path);

    // leave transition (skip on first load / language switch)
    if (!this.first && !langChanged && !Motion.reduced() && this.main.firstElementChild) {
      this.main.firstElementChild.classList.add("page-leave");
      await new Promise((r) => setTimeout(r, 160));
    }

    const meta = page.meta?.(params) || NotFoundPage.meta();
    this.main.innerHTML = `<div class="page">${page.render(params)}</div>`;
    Seo.set(meta);
    const section = "/" + (path.split("/")[1] || "");
    $$("[data-nav]").forEach((a) => a.toggleAttribute("aria-current", false) || (a.dataset.nav === section && a.setAttribute("aria-current", "page")));
    this.closeDrawer();
    if (!this.first) { window.scrollTo({ top: 0, behavior: "auto" }); this.main.focus({ preventScroll: true }); }
    this.first = false;
    await page.mount?.(this.main);
    requestAnimationFrame(() => Motion.observe(this.main));
  },

  switchLang(to) {
    const { path, query } = this.current;
    document.body.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: Motion.reduced() ? 1 : 160, fill: "forwards" }).finished.then(() => {
      location.hash = pathFor(to, path).slice(1) + (query ? "?" + query : "");
      document.body.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: Motion.reduced() ? 1 : 260, fill: "forwards" });
    });
  },

  openDrawer() {
    const d = $("#drawer"); d.classList.add("is-open");
    $("[data-menu]").setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden";
    setTimeout(() => $("nav a", d)?.focus(), 60);
  },
  closeDrawer() {
    const d = $("#drawer"); if (!d?.classList.contains("is-open")) return;
    d.classList.remove("is-open"); $("[data-menu]")?.setAttribute("aria-expanded", "false"); document.body.style.overflow = "";
  },

  init() {
    window.addEventListener("hashchange", () => this.route());

    document.addEventListener("click", (e) => {
      const el = e.target.closest("a, button"); if (!el) return;

      // Phone calls: native tel: link on normal pages; inside a sandboxed preview frame we open the call sheet
      if (el.matches("[data-call]")) {
        const inFrame = window.top !== window.self;
        if (inFrame) { e.preventDefault(); Call.start(el.dataset.call); }
        else setTimeout(() => { if (document.visibilityState === "visible" && document.hasFocus() && !window.matchMedia("(pointer: coarse)").matches) Call.sheet(el.dataset.call); }, 700);
        return;
      }
      if (el.matches('[href^="tel:"]') && window.top !== window.self) { e.preventDefault(); Call.start(el.getAttribute("href").slice(4)); return; }
      if (el.matches("[data-lang]")) { this.switchLang(el.dataset.lang); return; }
      if (el.matches("[data-menu]")) { this.openDrawer(); return; }
      if (el.matches("[data-close]")) { this.closeDrawer(); return; }
      if (el.matches("[data-copy]")) { copyText(el.dataset.copy); return; }
      if (el.matches("[data-skip]")) { e.preventDefault(); this.main.focus(); return; }
      if (el.matches("[data-theme-toggle]")) {
        const r = document.documentElement; const dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
        r.dataset.theme = dark ? "light" : "dark";
        try { localStorage.setItem("ma-theme", r.dataset.theme); } catch {}
        return;
      }
      // Same-page link: re-run route so state resets (e.g. clicking Booking while on Booking)
      if (el.tagName === "A" && el.getAttribute("href") === location.hash) { e.preventDefault(); this.route(); }
    });
    $("#drawer-scrim")?.addEventListener("click", () => this.closeDrawer());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeDrawer();
      // keep focus inside open drawer
      const d = $("#drawer");
      if (e.key === "Tab" && d?.classList.contains("is-open")) {
        const f = $$("a, button", d); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    try { const th = localStorage.getItem("ma-theme"); if (th) document.documentElement.dataset.theme = th; } catch {}
    Motion.initSpotlight();
    this.route();
  },
};

document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => App.init()) : App.init();
