/* ================= BOOKING — 4 steps, final step is a direct phone call ================= */
const BookingPage = {
  meta: () => ({ title: L("حجز موعد", "Book an appointment"), description: L("احجز موعدك في مستشفى مصر المحبة: اختر التخصص والطبيب والموعد المفضل ثم اتصل بنا للتأكيد.", "Book at Misr Al-Mahaba: choose a specialty, doctor and preferred time, then call us to confirm."), path: "/booking" }),
  STEPS: [L("التخصص", "Specialty"), L("الطبيب", "Doctor"), L("الموعد المفضل", "Preferred time"), L("اتصل للحجز", "Call to book")],

  render() {
    return `${UI.pageHero({ title: t("book"), lead: L("ثلاث اختيارات سريعة، ثم مكالمة واحدة لتأكيد موعدك مع فريق الحجز.", "Three quick choices, then one call to confirm your appointment with our booking team."), crumbs: [{ label: STR.booking }] })}
    <section class="section" style="padding-top:var(--sp-6)"><div class="container booking" data-booking>
      <div>
        <ol class="stepper" aria-label="${tr(L("خطوات الحجز", "Booking steps"))}" data-stepper></ol>
        <div class="panel" data-panel></div>
      </div>
      <aside class="aside">
        <div class="aside-card" data-summary aria-live="polite"></div>
        <div class="aside-card summary-extra"><h3>${tr(L("تعرف ما تريد؟", "Already know what you need?"))}</h3>${UI.callBtn({ cls: "btn btn--ghost btn--block", label: `<span class="num">${SITE.phones[0].display}</span>` })}
        <p class="muted" style="font-size:var(--fs-xs)">${tr(L("في الحالات الطارئة توجّه إلى قسم الطوارئ مباشرة.", "In an emergency, go straight to the emergency department."))}</p></div>
      </aside>
    </div></section>`;
  },

  async mount(root) {
    const box = $("[data-booking]", root);
    const panel = $("[data-panel]", box), stepper = $("[data-stepper]", box), summary = $("[data-summary]", box);
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const S = { step: 0, dept: null, doctor: null, date: null, time: null };
    const depts = await Api.getBookableDepartments();
    if (params.get("dept")) { S.dept = depts.find((d) => d.slug === params.get("dept")) || null; if (S.dept) S.step = 1; }
    if (S.dept && params.get("doctor")) { S.doctor = (await Api.getDoctors(S.dept.slug)).find((d) => d.id === params.get("doctor")) || null; if (S.doctor) S.step = 2; }

    const canNext = () => [!!S.dept, !!S.doctor || !DOCTORS.some((d) => d.dept === S.dept?.slug), true][S.step];
    const dateLabel = (iso) => fmtDate(iso, { weekday: "long", day: "numeric", month: "long" });

    const drawStepper = () => {
      stepper.innerHTML = this.STEPS.map((l, i) => `<li class="${i < S.step ? "is-done" : i === S.step ? "is-current" : ""}" ${i === S.step ? 'aria-current="step"' : ""}><span>${new Intl.NumberFormat(loc()).format(i + 1)}. ${esc(l)}</span></li>`).join("");
    };
    const drawSummary = () => {
      const row = (k, v) => `<div><dt>${esc(k)}</dt><dd>${v || '<span class="muted">—</span>'}</dd></div>`;
      summary.innerHTML = `<h3>${tr(L("ملخص طلبك", "Your request"))}</h3><dl class="kv">
        ${row(t("specialty"), S.dept && esc(S.dept.name))}
        ${row(STR.doctors, S.doctor && esc(S.doctor.name))}
        ${row(L("اليوم", "Day"), S.date && dateLabel(S.date))}
        ${row(L("الوقت", "Time"), S.time && `<span class="num">${fmtTime(S.time)}</span>`)}
      </dl>`;
    };
    const nav = (nextLabel = t("next")) => `<div class="panel-nav">
      ${S.step > 0 ? `<button type="button" class="btn btn--ghost" data-prev>${icon("back")}${t("prev")}</button>` : "<span></span>"}
      ${S.step < 3 ? `<button type="button" class="btn" data-next ${canNext() ? "" : "disabled"}>${nextLabel}${icon("arrow")}</button>` : ""}
    </div>`;
    const head = (title, sub) => `<h2 class="panel-title" tabindex="-1" data-focus>${esc(title)}</h2><p class="panel-sub">${esc(sub)}</p>`;
    const requestText = () => {
      const parts = [tr(L("أرغب في حجز موعد", "I’d like to book an appointment"))];
      if (S.dept) parts.push(tr(L("في قسم ", "in ")) + tr(S.dept.name));
      if (S.doctor && !S.doctor.demo) parts.push(tr(L("مع ", "with ")) + tr(S.doctor.name));
      if (S.date) parts.push(tr(L("يوم ", "on ")) + dateLabel(S.date));
      if (S.time) parts.push(tr(L("الساعة ", "at ")) + fmtTime(S.time));
      return parts.join(LANG === "ar" ? " " : " ") + ".";
    };

    const views = {
      0: () => `${head(L("اختر التخصص", "Choose a specialty"), L("حدد القسم الذي تريد الحجز فيه.", "Select the department you’d like to book with."))}
        <div class="choice-grid" role="radiogroup" aria-label="${t("specialty")}">${depts.map((d) => `<button type="button" role="radio" class="choice" data-dept="${d.slug}" aria-checked="${S.dept?.slug === d.slug}"><span class="icon-tile">${icon(d.icon)}</span><span><b>${esc(d.name)}</b><small>${esc(d.offers[0])}</small></span></button>`).join("")}</div>${nav()}`,
      1: async () => {
        const docs = await Api.getDoctors(S.dept.slug);
        return `${head(L("اختر الطبيب", "Choose a doctor"), L(`الأطباء المتاحون في ${S.dept.name.ar}.`, `Doctors available in ${S.dept.name.en}.`))}
        ${docs.some((d) => d.demo) ? `<div class="notice" style="margin-bottom:var(--sp-4)">${icon("info")}<span>${tr(L("بعض الأطباء المعروضين بيانات تجريبية لحين اعتماد القائمة الرسمية.", "Some doctors shown are sample data until the official roster is approved."))}</span></div>` : ""}
        ${docs.length ? "" : UI.empty(tr(L("لا يوجد أطباء مسجلون لهذا التخصص حاليًا — اتصل بنا وسنساعدك.", "No doctors listed for this specialty yet — call us and we’ll help.")))}<div class="choice-grid" role="radiogroup" aria-label="${esc(STR.doctors)}">${docs.map((d) => `<button type="button" role="radio" class="choice" data-doctor="${d.id}" aria-checked="${S.doctor?.id === d.id}">${UI.media({ src: d.photo, sm: true, avatar: true })}<span><b>${esc(d.name)}</b><small>${esc(d.title)} · ${d.schedule.map((s) => tr(DAY_NAMES[s.day])).join(LANG === "ar" ? "، " : ", ")}</small></span></button>`).join("")}</div>${nav()}`;
      },
      2: () => {
        const days = Api.workingDays(S.doctor); const today = new Date(); const list = [];
        for (let i = 1; i <= 21; i++) { const d = new Date(today); d.setDate(today.getDate() + i); list.push(d); }
        const slots = S.date ? Api.getSlots(S.doctor, S.date) : [];
        const grp = (label, f) => { const s = slots.filter(f); return s.length ? `<div class="slots-group"><h3>${esc(label)}</h3><div class="slots" role="radiogroup" aria-label="${esc(label)}">${s.map((x) => `<button type="button" role="radio" class="slot" data-time="${x}" aria-checked="${S.time === x}"><span class="num">${fmtTime(x)}</span></button>`).join("")}</div></div>` : ""; };
        return `${head(L("اختر موعدك المفضل", "Pick a preferred time"), L("اختياري — يساعد فريق الحجز على إيجاد أقرب موعد مناسب لك. الأيام الباهتة لا يعمل فيها الطبيب.", "Optional — it helps the booking team find the closest suitable slot. Faded days are outside the doctor’s hours."))}
        <div class="dates" role="radiogroup" aria-label="${esc(L("اليوم", "Day"))}">${list.map((d) => { const iso = toISO(d); const on = days.has(d.getDay()); return `<button type="button" role="radio" class="date-btn" data-date="${iso}" aria-checked="${S.date === iso}" ${on ? "" : "disabled"} aria-label="${dateLabel(iso)}"><small>${esc(DAY_NAMES[d.getDay()])}</small><b>${new Intl.NumberFormat(loc()).format(d.getDate())}</b><small>${new Intl.DateTimeFormat(loc(), { month: "short" }).format(d)}</small></button>`; }).join("")}</div>
        <div data-slots>${S.date ? grp(L("الفترة الصباحية", "Morning"), (x) => +x.slice(0, 2) < 12) + grp(L("الفترة المسائية", "Evening"), (x) => +x.slice(0, 2) >= 12) : ""}</div>
        ${nav(S.date ? t("next") : tr(L("تخطَّ واتصل مباشرة", "Skip & call now")))}`;
      },
      3: () => `${head(L("اتصل بنا لتأكيد الحجز", "Call us to confirm your booking"), L("فريق الحجز سيؤكد لك الموعد المتاح فورًا خلال المكالمة.", "Our booking team will confirm an available slot during the call."))}
        <div class="call-step">
          <div class="call-hero">
            <span class="call-pulse">${icon("phone")}</span>
            <a class="call-number num" href="tel:${SITE.phones[0].value}" data-call="${SITE.phones[0].value}">${SITE.phones[0].display}</a>
            ${UI.callBtn({ cls: "btn btn--lg btn--call", label: t("callToBook") })}
            <p class="muted" style="font-size:var(--fs-xs)">${t("otherLines")}: ${SITE.phones.slice(1).map((p) => `<a class="num" href="tel:${p.value}" data-call="${p.value}">${p.display}</a>`).join(" · ")}</p>
          </div>
          <div>
            <p style="font-weight:600;margin-bottom:.5rem">${tr(L("قل لموظف الحجز:", "Tell the booking team:"))}</p>
            <p class="script" data-script>${esc(requestText())}</p>
            <button type="button" class="btn btn--ghost btn--sm" style="margin-top:.75rem" data-copy-script>${icon("copy")}${t("copyText")}</button>
          </div>
        </div>
        <div class="panel-nav"><button type="button" class="btn btn--ghost" data-prev>${icon("back")}${t("prev")}</button><button type="button" class="btn btn--soft" data-restart>${tr(L("ابدأ من جديد", "Start over"))}</button></div>`,
    };

    let lastStep = S.step;
    const draw = async (focus = false) => {
      drawStepper(); drawSummary();
      const html = await views[S.step]();
      panel.innerHTML = `<div class="step-anim ${S.step < lastStep ? "back" : ""}">${html}</div>`;
      lastStep = S.step;
      if (focus) { $("[data-focus]", panel)?.focus({ preventScroll: true }); const top = box.getBoundingClientRect().top; if (top < 0 || top > window.innerHeight * 0.6) box.scrollIntoView({ behavior: Motion.reduced() ? "auto" : "smooth", block: "start" }); }
    };
    const refresh = () => { const b = $("[data-next]", panel); if (b) { b.disabled = !canNext(); } drawSummary(); };
    const select = (attr, v) => $$(`[${attr}]`, panel).forEach((el) => el.setAttribute("aria-checked", String(el.getAttribute(attr) === v)));

    panel.addEventListener("click", async (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.dept) { if (S.dept?.slug !== b.dataset.dept) Object.assign(S, { doctor: null, date: null, time: null }); S.dept = depts.find((d) => d.slug === b.dataset.dept); select("data-dept", b.dataset.dept); refresh(); }
      else if (b.dataset.doctor) { const docs = await Api.getDoctors(S.dept.slug); if (S.doctor?.id !== b.dataset.doctor) Object.assign(S, { date: null, time: null }); S.doctor = docs.find((d) => d.id === b.dataset.doctor); select("data-doctor", b.dataset.doctor); refresh(); }
      else if (b.dataset.date) { if (S.date !== b.dataset.date) S.time = null; S.date = b.dataset.date; const y = window.scrollY; await draw(); window.scrollTo(0, y); $(`[data-date="${S.date}"]`, panel)?.focus({ preventScroll: true }); }
      else if (b.dataset.time) { S.time = b.dataset.time; select("data-time", b.dataset.time); refresh(); }
      else if ("prev" in b.dataset) { S.step--; draw(true); }
      else if ("next" in b.dataset) { S.step++; draw(true); }
      else if ("restart" in b.dataset) { Object.assign(S, { step: 0, dept: null, doctor: null, date: null, time: null }); draw(true); }
      else if ("copyScript" in b.dataset) { copyText(requestText(), "copiedText"); }
    });
    panel.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      const group = e.target.closest('[role="radiogroup"]'); if (!group) return;
      const items = $$('[role="radio"]:not([disabled])', group); const i = items.indexOf(e.target); if (i < 0) return;
      e.preventDefault();
      const forwardKey = LANG === "ar" ? "ArrowLeft" : "ArrowRight";
      const fwd = e.key === forwardKey || e.key === "ArrowDown";
      items[(i + (fwd ? 1 : -1) + items.length) % items.length].focus();
    });
    draw();
  },
};
