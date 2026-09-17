/* ================= HOME ================= */
const HomePage = {
  meta: () => ({ path: "/" }),
  render() {
    const H = HOME;
    const featured = (H.featuredDepartments || []).map(bySlug.dept).filter(Boolean);
    const quick = [
      { href: link("/booking"), icon: "calendar", t: L("احجز موعدًا", "Book a visit"), s: L("اختر الطبيب ثم اتصل للتأكيد", "Pick a doctor, then call to confirm"), primary: true },
      { href: link("/doctors"), icon: "users", t: L("الأطباء", "Doctors"), s: L("دليل الأطباء والتخصصات", "Doctor directory") },
      { href: link("/departments"), icon: "grid", t: L("الأقسام الطبية", "Departments"), s: L("من الطوارئ إلى العيادات", "From emergency to clinics") },
      { href: link("/services"), icon: "flask", t: L("الخدمات", "Services"), s: L("أشعة، مختبر، تأهيل", "Imaging, lab, rehab") },
      { call: true, icon: "phone", t: L("اتصل بنا", "Call us"), s: L(SITE.phones[0].display, SITE.phones[0].display) },
    ];
    const steps = [
      { icon: "search", t: L("اكتشف الخدمة", "Find the service"), p: L("تصفح الأقسام والخدمات المتاحة", "Browse departments and services"), href: link("/services") },
      { icon: "grid", t: L("اختر التخصص", "Choose a specialty"), p: L("حدد القسم المناسب لحالتك", "Pick the right department"), href: link("/departments") },
      { icon: "user", t: L("تعرّف على الطبيب", "Meet your doctor"), p: L("اطلع على ملف الطبيب ومواعيده", "See the doctor’s profile and hours"), href: link("/doctors") },
      { icon: "phone", t: L("اتصل واحجز", "Call to book"), p: L("حدد موعدك المفضل واتصل بنا للتأكيد", "Choose a time and call us to confirm"), href: link("/booking") },
      { icon: "heart", t: L("احصل على الرعاية", "Receive care"), p: L("استقبال منظم ومتابعة بعد الزيارة", "Organized reception and follow-up"), href: link("/contact") },
    ];
    const heroTitle = `<span class="line"><span>${esc(H.hero.line1)}</span></span> <span class="line"><span>${esc(H.hero.line2)} <em>${esc(H.hero.highlight)}</em></span></span>`;
    return `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-bg" aria-hidden="true"><i></i><i></i></div>
      <div class="container hero-grid">
        <div class="hero-copy load-seq">
          <span class="eyebrow">${isFilled(H.hero.eyebrow) ? esc(H.hero.eyebrow) : `${esc(SITE.name)} · ${esc(SITE.address.city)}`}</span>
          <h1 class="hero-title" id="hero-title">${heroTitle}</h1>
          <p class="lead">${esc(H.hero.lead)}</p>
          <div class="hero-actions">
            ${UI.callBtn({ cls: "btn btn--lg", label: t("callToBook") })}
            <a class="btn btn--ghost btn--lg" href="${link("/services")}">${tr(L("استكشف خدماتنا", "Explore our services"))}${icon("arrow")}</a>
          </div>
          <div class="hero-trust">
            ${(H.hero.trust || []).filter(isFilled).map((x, i) => `<span>${icon(i ? "shield" : "badge")}${esc(x)}</span>`).join("")}
          </div>
        </div>
        <div class="hero-visual">
          <span class="hero-outline" aria-hidden="true"></span>
          <div class="hero-frame">
            <img src="${imgSrc(H.hero.image, 1400)}" alt="${esc(SITE.name)}" fetchpriority="high" decoding="async">
            <span class="hero-caption">${icon("pin")}${esc(SITE.address.city)}${comma()}${esc(SITE.address.governorate)}</span>
          </div>
          <div class="float-card float-card--logo" aria-hidden="true"><img src="${SITE.logo()}" alt=""></div>
          <div class="float-card float-card--badge">
            <div class="icon-tile">${icon("badge")}</div>
            <div><b>${esc(H.hero.badgeTitle)}</b><small>${esc(H.hero.badgeText)}</small></div>
          </div>
        </div>
      </div>
    </section>

    <section class="quick" aria-label="${t("quickActions")}">
      <div class="container"><div class="quick-list">
        ${quick.map((q) => {
          const inner = `<span class="icon-tile">${icon(q.icon)}</span><span><b>${tr(q.t)}</b><small class="${q.call ? "num" : ""}">${tr(q.s)}</small></span>`;
          return q.call ? `<a class="quick-item" href="tel:${SITE.phones[0].value}" data-call="${SITE.phones[0].value}">${inner}</a>` : `<a class="quick-item ${q.primary ? "quick-item--primary" : ""}" href="${q.href}">${inner}</a>`;
        }).join("")}
      </div></div>
    </section>

    ${STATS ? `    <section class="section" aria-labelledby="stats-h" style="padding-bottom:0">
      <div class="container">
        <h2 class="sr-only" id="stats-h">${tr(L("المستشفى بالأرقام", "The hospital in numbers"))}</h2>
        <div class="stats" data-rv>
          ${STATS.items.map((s) => `<div class="stat"><b data-count="${s.n}" data-prefix="${s.prefix || ""}">${s.prefix || ""}${new Intl.NumberFormat(loc()).format(s.n)}</b><small>${esc(s.label)}</small></div>`).join("")}
        </div>
        <p class="stats-note">${esc(STATS.asOf)}${STATS.source ? ` · <a href="${STATS.source}" target="_blank" rel="noopener">${t("source")}</a>` : ""}</p>
      </div>
    </section>
    ` : ""}

    <section class="section" aria-labelledby="about-h">
      <div class="container split">
        <div class="split-media">
          ${UI.media({ src: H.about.image, alt: SITE.name, rv: true })}
          <figure class="media" style="background:#fff;display:grid;place-items:center" data-rv><img src="${SITE.logo()}" alt="${esc(SITE.name)}" style="width:80%;height:auto;object-fit:contain"></figure>
        </div>
        <div class="split-copy">
          <span class="eyebrow">${t("about")}</span>
          <h2 class="h2" id="about-h">${esc(H.about.title)}</h2>
          <p class="lead" style="font-size:var(--fs-md)">${esc(H.about.text)}</p>
          <div class="pillars">
            ${(H.about.pillars || []).map((p) => `<div class="pillar"><span class="q">${esc(p.q)}</span><b>${esc(p.title)}</b><p>${esc(p.text)}</p></div>`).join("")}
          </div>
          <a class="link-arrow" href="${link("/about")}">${tr(L("تعرّف على المستشفى", "About the hospital"))}${icon("arrow")}</a>
        </div>
      </div>
    </section>

    <section class="section section--tint" aria-labelledby="dept-h">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">${tr(L("التخصصات والأقسام", "Specialties & departments"))}</span><h2 class="h2" id="dept-h">${tr(L("كل ما تحتاجه من رعاية في مكان واحد", "All the care you need, in one place"))}</h2></div>
          <a class="btn btn--ghost" href="${link("/departments")}">${tr(L("كل الأقسام", "All departments"))}${icon("arrow")}</a>
        </div>
        <div class="grid grid-3">${featured.map(UI.deptCard).join("")}</div>
      </div>
    </section>

    <section class="section" aria-labelledby="doc-h">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">${t("doctors")}</span><h2 class="h2" id="doc-h">${tr(L("تعرّف على طبيبك قبل زيارتك", "Meet your doctor before your visit"))}</h2>${DOCTORS.some((d) => d.demo) ? `<p class="muted">${tr(L("ملفات الأطباء نماذج توضيحية إلى حين اعتماد القائمة الرسمية.", "Doctor profiles are samples until the official roster is approved."))}</p>` : ""}</div>
          <a class="btn btn--ghost" href="${link("/doctors")}">${tr(L("دليل الأطباء", "Doctor directory"))}${icon("arrow")}</a>
        </div>
        <div class="grid grid-4">${DOCTORS.slice(0, H.doctorsCount || 4).map(UI.doctorCard).join("")}</div>
      </div>
    </section>

    <section class="section section--tint" aria-labelledby="why-h">
      <div class="container">
        <div class="section-head"><div><span class="eyebrow">${tr(L("لماذا مصر المحبة؟", "Why Misr Al-Mahaba?"))}</span><h2 class="h2" id="why-h">${tr(L("ثقة يمكن التحقق منها", "Trust you can verify"))}</h2></div></div>
        <div class="why">
          ${WHY.map((w) => w.feature
            ? `<div class="why-item why-item--feature" data-rv><img class="why-logo" src="${SITE.logo()}" alt=""><span class="chip">${esc(w.chip)}</span><h3>${esc(w.title)}</h3><p>${esc(w.text)}</p></div>`
            : `<div class="why-item" data-rv><div class="icon-tile">${icon(w.icon)}</div><h3>${esc(w.title)}</h3><p>${esc(w.text)}</p></div>`).join("")}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="journey-h">
      <div class="container">
        <div class="section-head"><div><span class="eyebrow">${tr(L("رحلة المريض", "Patient journey"))}</span><h2 class="h2" id="journey-h">${tr(L("من أول نقرة حتى تلقي الرعاية", "From first click to receiving care"))}</h2></div></div>
        <div class="journey" role="list">
          <span class="journey-track" aria-hidden="true"><i></i></span>
          ${steps.map((s) => `<div class="step" role="listitem"><span class="step-dot">${icon(s.icon)}</span><b>${tr(s.t)}</b><p>${tr(s.p)}</p><a href="${s.href}" aria-label="${esc(s.t)}"></a></div>`).join("")}
        </div>
      </div>
    </section>

    <section class="section section--tint" aria-labelledby="news-h">
      <div class="container">
        <div class="section-head"><div><span class="eyebrow">${t("news")}</span><h2 class="h2" id="news-h">${tr(L("آخر أخبار المستشفى", "Latest hospital news"))}</h2></div><a class="btn btn--ghost" href="${link("/news")}">${tr(L("كل الأخبار", "All news"))}${icon("arrow")}</a></div>
        <div class="grid grid-3">${NEWS.slice(0, H.newsCount || 3).map(UI.newsCard).join("")}</div>
      </div>
    </section>

    ${UI.ctaBand()}`;
  },
};
