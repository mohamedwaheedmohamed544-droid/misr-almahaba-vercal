/* ================= DOCTORS / NEWS / CONTACT / 404 ================= */
const doctorCats = () => [{ id: "all", label: L("كل التخصصات", "All specialties") }, ...DEPARTMENTS.filter((d) => DOCTORS.some((x) => x.dept === d.slug)).map((d) => ({ id: d.slug, label: d.name }))];

const DoctorsPage = {
  meta: () => ({ title: L("دليل الأطباء", "Doctor Directory"), description: L("ابحث عن طبيبك في مستشفى مصر المحبة حسب الاسم أو التخصص.", "Find your doctor at Misr Al-Mahaba by name or specialty."), path: "/doctors" }),
  render() {
    return `${UI.pageHero({ title: L("دليل الأطباء", "Doctor Directory"), lead: L("ابحث بالاسم أو التخصص، واطّلع على مواعيد الطبيب، ثم اتصل بنا للحجز.", "Search by name or specialty, check the doctor’s hours, then call us to book."), crumbs: [{ label: t("doctors") }],
      extra: !DOCTORS.some((d) => d.demo) ? "" : `<div class="notice" style="max-width:720px">${icon("info")}<span>${tr(L("الملفات المعروضة <b>بيانات تجريبية</b> لتوضيح التجربة، وتُستبدل بقائمة الأطباء المعتمدة من إدارة المستشفى.", "Profiles shown are <b>sample data</b> to demonstrate the experience and will be replaced by the hospital’s approved roster."))}</span></div>` })}
    <section class="section" style="padding-top:var(--sp-6)"><div class="container" data-dir>
      ${directoryToolbar({ placeholder: L("ابحث باسم الطبيب أو التخصص", "Search by doctor or specialty"), categories: doctorCats(), label: L("ابحث في الأطباء", "Search doctors") })}
      <div class="grid grid-4" data-grid></div>
    </div></section>${UI.ctaBand()}`;
  },
  mount(root) { mountDirectory({ root: $("[data-dir]", root), items: DOCTORS, categories: doctorCats(), getCat: (d) => d.dept, getText: (d) => bothLangs(d.name) + bothLangs(d.title) + bothLangs(bySlug.dept(d.dept)?.name), renderCard: UI.doctorCard, noun: L("طبيب", "doctors") }); },
};

const DoctorProfilePage = {
  meta: ({ id }) => { const d = bySlug.doctor(id); return d && { title: d.name, description: d.title, path: "/doctors/" + id,
    jsonld: { "@context": "https://schema.org", "@type": "Physician", name: tr(d.name), medicalSpecialty: tr(bySlug.dept(d.dept)?.name), hospitalAffiliation: { "@type": "Hospital", name: tr(SITE.name) } } }; },
  render({ id }) {
    const d = bySlug.doctor(id); if (!d) return NotFoundPage.render();
    const dept = bySlug.dept(d.dept);
    const services = d.services.map(bySlug.service).filter(Boolean);
    return `${UI.pageHero({ title: d.name, crumbs: [{ href: link("/doctors"), label: t("doctors") }, { label: d.name }] })}
    <section class="section" style="padding-top:var(--sp-6)"><div class="container detail">
      <div class="profile">
        ${UI.media({ src: d.photo, avatar: true })}
        <div class="profile-head">
          <div class="tag-list"><a class="chip chip--primary" href="${link("/departments/" + dept.slug)}">${esc(dept.name)}</a>${d.demo ? UI.demoBadge() : ""}</div>
          <p class="lead">${esc(d.title)}</p>
          <div class="prose">
            <h2>${tr(L("نبذة", "About"))}</h2><p>${val(d.bio)}</p>
            <h2>${tr(L("المؤهلات", "Qualifications"))}</h2>${d.qualifications.length ? `<ul>${d.qualifications.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>` : `<p>${val("")}</p>`}
            <h2>${tr(L("الخدمات التي يقدمها", "Services"))}</h2>
            <div class="tag-list">${services.map((s) => `<a class="chip" href="${link("/services/" + s.slug)}">${esc(s.name)}</a>`).join("")}</div>
            <h2>${tr(L("أوقات العمل", "Clinic hours"))}</h2>
            <div style="overflow-x:auto"><table class="hours"><thead><tr><th scope="col">${tr(L("اليوم", "Day"))}</th><th scope="col">${tr(L("من", "From"))}</th><th scope="col">${tr(L("إلى", "To"))}</th></tr></thead>
              <tbody>${d.schedule.map((s) => `<tr><td>${esc(DAY_NAMES[s.day])}</td><td class="num">${fmtTime(s.from)}</td><td class="num">${fmtTime(s.to)}</td></tr>`).join("")}</tbody></table></div>
          </div>
        </div>
      </div>
      <aside class="aside">
        <div class="aside-card">
          <h3>${tr(L("احجز مع الطبيب", "Book with this doctor"))}</h3>
          <p class="muted" style="font-size:var(--fs-sm)">${t("bookHereText")}</p>
          ${UI.callBtn({ cls: "btn btn--block", label: t("callToBook") })}
          <a class="btn btn--ghost btn--block" href="${link("/booking")}?dept=${d.dept}&doctor=${d.id}">${icon("calendar")}${tr(L("اختر موعدًا مفضلًا", "Pick a preferred time"))}</a>
        </div>
      </aside>
    </div></section>`;
  },
};

const NewsPage = {
  meta: () => ({ title: L("الأخبار", "News"), description: L("آخر أخبار مستشفى مصر المحبة من المصادر الصحفية.", "The latest Misr Al-Mahaba Hospital news from the press."), path: "/news" }),
  render() {
    return `${UI.pageHero({ title: L("الأخبار والمقالات", "News & Articles"), lead: L("أخبار المستشفى الموثقة بمصادرها، ومساحة لمقالات التوعية الصحية.", "Hospital news with its original sources, and a space for health-awareness articles."), crumbs: [{ label: t("news") }] })}
    <section class="section" style="padding-top:var(--sp-6)"><div class="container">
      <div class="grid grid-3">${NEWS.filter((n) => n.type !== "article").map(UI.newsCard).join("")}</div>
      <div class="section-head" style="margin-top:var(--sp-8)"><div><h2 class="h2">${tr(L("مقالات التوعية الصحية", "Health awareness articles"))}</h2><p class="muted">${tr(L("تُنشر المقالات بعد مراجعتها واعتمادها من الفريق الطبي.", "Articles are published after review and approval by the medical team."))}</p></div></div>
      ${NEWS.some((n) => n.type === "article") ? `<div class="grid grid-3">${NEWS.filter((n) => n.type === "article").map(UI.newsCard).join("")}</div>` : UI.empty(tr(L("لا توجد مقالات منشورة بعد. تابع صفحتنا على فيسبوك لآخر المستجدات.", "No articles published yet. Follow our Facebook page for updates.")), SITE.social.facebook ? `<a class="btn btn--soft btn--sm" href="${SITE.social.facebook}" target="_blank" rel="noopener">${icon("facebook")}Facebook</a>` : "")}
    </div></section>`;
  },
};

const NewsDetailPage = {
  meta: ({ slug }) => { const n = bySlug.news(slug); return n && { title: n.title, description: n.excerpt, path: "/news/" + slug,
    jsonld: { "@context": "https://schema.org", "@type": "NewsArticle", headline: tr(n.title), datePublished: n.date, publisher: { "@type": "Organization", name: tr(SITE.name) } } }; },
  render({ slug }) {
    const i = NEWS.findIndex((x) => x.slug === slug); const n = NEWS[i]; if (!n) return NotFoundPage.render();
    const prev = NEWS[i - 1], next = NEWS[i + 1];
    return `${UI.pageHero({ title: n.title, crumbs: [{ href: link("/news"), label: t("news") }, { label: t("newsLabel") }],
      extra: `<div class="news-meta"><span class="chip chip--primary">${UI.newsType(n)}</span>${UI.newsDate(n)}${isFilled(n.source.name) ? `<span>${t("source")}: ${esc(n.source.name)}</span>` : ""}</div>` })}
    <section class="section" style="padding-top:var(--sp-5)"><div class="container"><article class="article">
      ${UI.media({ src: n.image, alt: n.title, eager: true })}
      <div class="prose" style="max-width:none">${n.body.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      ${n.source.url ? `<div class="source-box"><span>${tr(L("ملخص لخبر منشور في", "Summary of a story published by"))} «${esc(n.source.name)}»</span><a class="btn btn--soft btn--sm" href="${n.source.url}" target="_blank" rel="noopener">${tr(L("اقرأ المصدر الأصلي", "Read the original"))}${icon("external")}</a></div>` : ""}
      <nav class="article-nav" aria-label="${tr(L("أخبار أخرى", "More news"))}">
        ${prev ? `<a href="${link("/news/" + prev.slug)}"><small>${tr(L("الخبر السابق", "Previous"))}</small><b>${esc(prev.title)}</b></a>` : `<a href="${link("/news")}"><small>${t("back")}</small><b>${tr(L("كل الأخبار", "All news"))}</b></a>`}
        ${next ? `<a href="${link("/news/" + next.slug)}"><small>${tr(L("الخبر التالي", "Next"))}</small><b>${esc(next.title)}</b></a>` : `<a href="${link("/news")}"><small>${t("back")}</small><b>${tr(L("كل الأخبار", "All news"))}</b></a>`}
      </nav>
    </article></div></section>`;
  },
};

const ContactPage = {
  meta: () => ({ title: STR.contact, description: L("عنوان مستشفى مصر المحبة ببني مزار – المنيا وأرقام الاتصال.", "Misr Al-Mahaba Hospital address in Beni Mazar – Minya and phone numbers."), path: "/contact" }),
  render() {
    return `${UI.pageHero({ title: t("contact"), lead: L("اتصل بنا مباشرة للحجز والاستفسار، أو زُرنا في بني مزار.", "Call us directly to book or ask a question, or visit us in Beni Mazar."), crumbs: [{ label: t("contact") }] })}
    <section class="section" style="padding-top:var(--sp-6)"><div class="container contact-grid">
      <div class="contact-cards">
        <div class="contact-card" data-rv><div class="icon-tile">${icon("phone")}</div><div style="display:grid;gap:.5rem;flex:1">
          <b>${tr(L("الهاتف والحجز", "Phone & booking"))}</b>
          ${SITE.phones.map((p) => `<p><a class="num" href="tel:${p.value}" data-call="${p.value}" style="font-weight:600;color:var(--ink)">${p.display}</a> <span class="muted">· ${esc(p.label)}</span></p>`).join("")}
          ${UI.callBtn({ cls: "btn btn--block", label: t("callNow") })}
        </div></div>
        <div class="contact-card" data-rv><div class="icon-tile">${icon("pin")}</div><div><b>${tr(L("العنوان", "Address"))}</b><p>${esc(SITE.address.line)}${comma()}${esc(SITE.address.governorate)}${comma()}${esc(SITE.address.country)}</p><p style="margin-top:.4rem"><a class="link-arrow" href="${SITE.mapsUrl}" target="_blank" rel="noopener">${t("openMaps")}${icon("arrow")}</a></p></div></div>
        <div class="contact-card" data-rv><div class="icon-tile">${icon("clock")}</div><div><b>${tr(L("مواعيد العمل", "Opening hours"))}</b><p>${tr(L("الطوارئ", "Emergency"))}: ${val(SITE.hours.emergency)}</p><p>${tr(L("العيادات", "Clinics"))}: ${val(SITE.hours.clinics)}</p></div></div>
        <div class="contact-card" data-rv><div class="icon-tile">${icon("facebook")}</div><div><b>${tr(L("تابعنا وراسلنا", "Follow & message us"))}</b><div class="socials" style="margin-block:.4rem">${UI.socials()}</div>${SITE.whatsapp ? `<p><a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></p>` : ""}<p>${tr(L("البريد", "Email"))}: ${isFilled(SITE.email) ? `<a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>` : val("")}</p></div></div>
      </div>
      <a class="map-box" href="${SITE.mapsUrl}" target="_blank" rel="noopener" data-rv="mask" aria-label="${t("openMaps")}">
        <img src="${imgSrc(SITE.mapImage, 1000)}" alt="" loading="lazy">
        <span class="map-pin"><span><b>${esc(SITE.name)}</b><small>${esc(SITE.address.line)}</small></span><span class="btn btn--sm" style="--btn-bg:#fff;--btn-fg:var(--blue-900)">${icon("map")}${tr(L("الاتجاهات", "Directions"))}</span></span>
      </a>
    </div></section>`;
  },
};

const NotFoundPage = {
  meta: () => ({ title: L("الصفحة غير موجودة", "Page not found"), path: "/404" }),
  render() {
    return `<section class="section"><div class="container load-seq" style="display:grid;gap:var(--sp-5);justify-items:start;max-width:640px">
      <span class="eyebrow">404</span><h1 class="h1">${t("notFound")}</h1>
      <p class="lead">${t("notFoundText")}</p>
      <div class="hero-actions"><a class="btn" href="${link("/")}">${t("home")}</a>${UI.callBtn({ cls: "btn btn--ghost", label: t("callToBook") })}</div>
    </div></section>`;
  },
};
