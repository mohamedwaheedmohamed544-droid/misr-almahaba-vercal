/* =========================================================
   UI COMPONENTS — pure functions returning HTML strings.
   Each maps 1:1 to a future React/Next.js component.
   ========================================================= */
const UI = {
  /* <Media>: real image when available, branded illustration panel otherwise */
  media({ src, alt = "", icon: iconName = "hospital", cls = "", sm = false, avatar = false, eager = false, rv = false }) {
    const classes = ["media", sm && "media--sm", cls].filter(Boolean).join(" ");
    const rvAttr = rv ? ' data-rv="mask"' : "";
    const real = imgSrc(src);
    if (real) return `<figure class="${classes}"${rvAttr}><img src="${real}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></figure>`;
    return `<figure class="${classes}"${rvAttr} ${alt ? `role="img" aria-label="${esc(alt)}"` : 'aria-hidden="true"'}><div class="art ${avatar ? "art--avatar" : ""}"><i class="art-ring"></i><i class="art-ring"></i>${avatar ? "" : '<i class="art-dot"></i>'}<span class="art-glyph">${icon(iconName)}</span><span class="art-icon">${icon(avatar ? "user" : iconName)}</span></div></figure>`;
  },

  callBtn({ cls = "btn", label = t("callUs"), phone = SITE.phones[0], iconOnly = false } = {}) {
    return `<a class="${cls}" href="tel:${phone.value}" data-call="${phone.value}">${icon("phone")}${iconOnly ? `<span class="sr-only">${esc(label)}</span>` : label}</a>`;
  },

  logo: (size = "brand-logo") => `<img class="${size}" src="${SITE.logo()}" alt="" width="50" height="50">`,

  header() {
    const other = LANG === "ar" ? "en" : "ar";
    return `
    <a class="skip-link" href="#main" data-skip>${t("skip")}</a>
    <div class="progress" aria-hidden="true"><i></i></div>
    ${UI.announcement()}
    <header class="site-header">
      <div class="container header-bar">
        <a class="brand" href="${link("/")}" aria-label="${esc(SITE.name)} — ${t("home")}">${UI.logo()}<span class="brand-text"><b>${esc(SITE.name)}</b><small>${t("location")}</small></span></a>
        <nav class="nav" aria-label="${t("mainNav")}">${NAV.map((n) => `<a href="${link(n.path)}" data-nav="${n.path}">${t(n.key)}</a>`).join("")}</nav>
        <div class="header-actions">
          <a class="header-phone" href="tel:${SITE.phones[0].value}" data-call="${SITE.phones[0].value}" aria-label="${t("call")} ${SITE.phones[0].display}">${icon("phone")}<span class="num">${SITE.phones[0].display}</span></a>
          <button class="icon-btn lang-btn" type="button" data-lang="${other}" aria-label="${t("switchLangAria")}" lang="${other}">${icon("globe")}<span>${LANGS[other].short}</span></button>
          <a class="btn btn--sm" href="${link("/booking")}">${icon("calendar")}${t("book")}</a>
          <button class="icon-btn menu-btn" type="button" aria-label="${t("menuOpen")}" aria-expanded="false" aria-controls="drawer" data-menu>${icon("menu")}</button>
        </div>
      </div>
    </header>
    <div class="drawer" id="drawer">
      <div class="drawer-scrim" data-close></div>
      <div class="drawer-panel" role="dialog" aria-modal="true" aria-label="${t("mainNav")}">
        <div class="drawer-top"><a class="brand" href="${link("/")}">${UI.logo()}<span class="brand-text"><b>${esc(SITE.shortName)}</b></span></a><button class="icon-btn" type="button" data-close aria-label="${t("menuClose")}">${icon("close")}</button></div>
        <nav aria-label="${t("mainNav")}">${NAV.map((n) => `<a href="${link(n.path)}" data-nav="${n.path}">${t(n.key)}${icon("chev")}</a>`).join("")}</nav>
        <div class="drawer-foot">
          <a class="btn btn--block" href="${link("/booking")}">${icon("calendar")}${t("book")}</a>
          ${UI.callBtn({ cls: "btn btn--ghost btn--block", label: `<span class="num">${SITE.phones[0].display}</span>` })}
          <button class="btn btn--soft btn--block" type="button" data-lang="${other}" lang="${other}">${icon("globe")}${LANGS[other].label}</button>
        </div>
      </div>
    </div>`;
  },

  mobileBar() {
    return `<div class="mobile-bar" role="region" aria-label="${t("quickActions")}">
      ${UI.callBtn({ cls: "btn btn--call", label: t("callToBook") })}
      <a class="btn btn--ghost" href="${link("/booking")}">${icon("calendar")}${t("bookShort")}</a>
    </div>`;
  },

  footer() {
    const col = (title, items) => `<div class="footer-col"><h3>${title}</h3><ul>${items.map((i) => `<li><a href="${i.href}">${esc(i.label)}</a></li>`).join("")}</ul></div>`;
    return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="brand" href="${link("/")}">${UI.logo()}<span class="brand-text"><b>${esc(SITE.name)}</b><small>${esc(LANG === "ar" ? SITE.name.en : SITE.name.ar)}</small></span></a>
            <p class="slogan">${esc(SITE.slogan)}</p>
            <p>${esc(SITE.affiliation)}. ${t("footerAbout")}</p>
            <div class="socials">${UI.socials()}</div>
          </div>
          ${col(t("site"), NAV.slice(0, 5).map((n) => ({ href: link(n.path), label: t(n.key) })).concat([{ href: link("/booking"), label: t("book") }]))}
          ${col(t("departments"), DEPARTMENTS.slice(0, 6).map((d) => ({ href: link("/departments/" + d.slug), label: d.name })))}
          ${col(t("services"), SERVICES.slice(0, 6).map((s) => ({ href: link("/services/" + s.slug), label: s.name })))}
          <div class="footer-col">
            <h3>${t("contact")}</h3>
            <ul class="contact-lines">
              <li>${icon("pin")}<span>${esc(SITE.address.line)}${comma()}${esc(SITE.address.governorate)}</span></li>
              ${SITE.phones.map((p) => `<li>${icon("phone")}<a class="num" href="tel:${p.value}" data-call="${p.value}">${p.display}</a></li>`).join("")}
              ${isFilled(SITE.email) ? `<li>${icon("mail")}<a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></li>` : ""}
              <li>${icon("map")}<a href="${SITE.mapsUrl}" target="_blank" rel="noopener">${t("openMaps")}</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© <span class="num">${new Date().getFullYear()}</span> ${esc(SITE.name)}. ${t("rights")}</span>
          <span>${t("medDisclaimer")} · <button type="button" data-theme-toggle>${t("toggleTheme")}</button> · <button type="button" data-lang="${LANG === "ar" ? "en" : "ar"}">${t("switchLang")}</button></span>
        </div>
      </div>
    </footer>`;
  },

  socials() {
    const names = { facebook: "Facebook", messenger: "Messenger", instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", x: "X" };
    const ic = { facebook: "facebook", messenger: "mail", instagram: "image", youtube: "play", tiktok: "play", x: "external" };
    return Object.entries(SITE.social).filter(([, v]) => v).map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener" aria-label="${names[k] || k}" title="${names[k] || k}">${icon(ic[k] || "external")}</a>`).join("");
  },

  announcement() {
    const a = SITE.announcement;
    if (!a?.enabled || !isFilled(a.text)) return "";
    const inner = `${icon(a.style === "urgent" ? "pulse" : "info")}<span>${esc(a.text)}</span>${a.link ? icon("arrow") : ""}`;
    return `<div class="announce announce--${esc(a.style || "info")}" role="region" aria-label="${tr(L("إعلان", "Announcement"))}"><div class="container">${a.link ? `<a href="${esc(a.link)}">${inner}</a>` : `<p>${inner}</p>`}</div></div>`;
  },

  pageHero({ title, lead, crumbs = [], extra = "" }) {
    const trail = [{ href: link("/"), label: t("home") }, ...crumbs];
    return `<section class="page-hero"><div class="container load-seq">
      <nav aria-label="${t("breadcrumbs")}"><ol class="crumbs">${trail.map((c, i) => `<li>${i < trail.length - 1 ? `<a href="${c.href}">${esc(c.label)}</a>` : `<span aria-current="page">${esc(c.label)}</span>`}</li>`).join("")}</ol></nav>
      <h1 class="h1">${esc(title)}</h1>
      ${lead ? `<p class="lead">${esc(lead)}</p>` : ""}
      ${extra}
    </div></section>`;
  },

  demoBadge: () => `<span class="tbd">${t("demo")}</span>`,

  deptCard(d) {
    return `<article class="card" data-rv>
      <div class="card-body">
        <div class="icon-tile">${icon(d.icon)}</div>
        <h3 class="card-title"><a class="card-link" href="${link("/departments/" + d.slug)}">${esc(d.name)}</a></h3>
        <p class="card-text">${esc(d.summary)}</p>
        <div class="card-foot"><span class="chip">${d.bookable ? t("bookable") : t("walkIn")}</span><span class="link-arrow card-cta">${t("details")}${icon("arrow")}</span></div>
      </div>
    </article>`;
  },

  serviceCard(s) {
    const dept = s.dept ? bySlug.dept(s.dept) : null;
    const cat = SERVICE_CATEGORIES.find((c) => c.id === s.category);
    return `<article class="card" data-rv>
      <div class="card-body">
        <div class="icon-tile">${icon(s.icon)}</div>
        <h3 class="card-title"><a class="card-link" href="${link("/services/" + s.slug)}">${esc(s.name)}</a></h3>
        <p class="card-text">${esc(s.summary)}</p>
        <div class="card-foot"><span class="chip">${esc(dept ? dept.name : cat.label)}</span><span class="link-arrow card-cta">${t("learnMore")}${icon("arrow")}</span></div>
      </div>
    </article>`;
  },

  doctorCard(doc) {
    const dept = bySlug.dept(doc.dept);
    return `<article class="card doc-card" data-rv>
      ${UI.media({ src: doc.photo, avatar: true })}
      <div class="card-body">
        <span class="doc-spec">${esc(dept?.name)}</span>
        <h3 class="card-title"><a class="card-link" href="${link("/doctors/" + doc.id)}">${esc(doc.name)}</a></h3>
        <p class="card-text">${esc(doc.title)}</p>
        <div class="card-foot">${doc.demo ? UI.demoBadge() : "<span></span>"}<span class="link-arrow card-cta">${t("viewProfile")}${icon("arrow")}</span></div>
      </div>
    </article>`;
  },

  newsType: (n) => (n.type === "article" ? tr(L("مقال", "Article")) : t("newsLabel")),
  newsDate: (n) => `<time datetime="${n.date}">${n.dateLabel ? `<span class="num">${n.dateLabel}</span>` : fmtDate(n.date)}</time>`,

  newsCard(n) {
    return `<article class="card news-card" data-rv>
      ${UI.media({ src: n.image, alt: "", icon: n.type === "article" ? "stethoscope" : "image" })}
      <div class="card-body">
        <div class="news-meta"><span class="chip chip--primary">${UI.newsType(n)}</span>${UI.newsDate(n)}</div>
        <h3 class="card-title"><a class="card-link" href="${link("/news/" + n.slug)}">${esc(n.title)}</a></h3>
        <p class="card-text">${esc(n.excerpt)}</p>
        <div class="card-foot"><span class="muted" style="font-size:var(--fs-xs)">${isFilled(n.source.name) ? `${t("source")}: ${esc(n.source.name)}` : ""}</span><span class="link-arrow card-cta">${t("read")}${icon("arrow")}</span></div>
      </div>
    </article>`;
  },

  ctaBand() {
    return `<section class="section" style="padding-bottom:0"><div class="container"><div class="cta-band" data-rv>
      <i class="rings" aria-hidden="true"></i><i class="rings" aria-hidden="true"></i>
      <div style="position:relative"><h2>${esc(HOME.cta.title)}</h2><p>${esc(HOME.cta.text)}</p></div>
      <div class="cta-actions">${UI.callBtn({ cls: "btn", label: t("callToBook") })}<a class="btn btn--ghost" href="${link("/booking")}">${icon("calendar")}${t("book")}</a></div>
    </div></div></section>`;
  },

  empty: (msg, action = "") => `<div class="empty">${icon("search")}<p>${esc(msg)}</p>${action}</div>`,
};
