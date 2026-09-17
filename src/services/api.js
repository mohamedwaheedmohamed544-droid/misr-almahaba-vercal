/* =========================================================
   DATA SERVICE LAYER
   UI code only talks to `Api`. Today it reads local data modules.
   To connect a CMS / hospital system, set API_CONFIG.mode = "remote".
   Booking currently finishes with a phone call (hospital decision);
   an online request endpoint can be added later without UI rework.
   ========================================================= */
const API_CONFIG = { mode: "mock", baseUrl: "", timeoutMs: 10000 };
/* Remote contract (future)
   GET /departments?bookable=1  → Department[]
   GET /doctors?dept=slug       → Doctor[]
   GET /availability?doctor=id&date=YYYY-MM-DD → { slots: [{ time, available }] }
*/
const Api = (() => {
  async function remote(path) {
    const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), API_CONFIG.timeoutMs);
    try { const r = await fetch(API_CONFIG.baseUrl + path, { signal: ctrl.signal }); if (!r.ok) throw new Error("HTTP " + r.status); return await r.json(); }
    finally { clearTimeout(tm); }
  }
  const toMin = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const toTime = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  return {
    async getBookableDepartments() { return API_CONFIG.mode === "remote" ? remote("/departments?bookable=1") : DEPARTMENTS.filter((d) => d.bookable); },
    async getDoctors(dept) { return API_CONFIG.mode === "remote" ? remote("/doctors" + (dept ? "?dept=" + dept : "")) : dept ? DOCTORS.filter((d) => d.dept === dept) : DOCTORS; },
    workingDays: (doc) => new Set((doc?.schedule || []).map((s) => s.day)),
    /* Preferred-time options inside the doctor's clinic hours (final availability is confirmed by phone) */
    getSlots(doc, iso) {
      const day = new Date(iso + "T00:00:00").getDay(); const out = [];
      doc.schedule.filter((s) => s.day === day).forEach((b) => { for (let m = toMin(b.from); m < toMin(b.to); m += 30) out.push(toTime(m)); });
      return out;
    },
  };
})();
