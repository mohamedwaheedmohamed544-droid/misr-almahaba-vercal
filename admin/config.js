/* =========================================================
   لوحة التحكم — إعدادات Decap CMS
   كل حقل هنا يطابق ملفًا في /content. أي حفظ من اللوحة = Commit على GitHub
   ثم يعيد Vercel بناء الموقع تلقائيًا (والبناء يتوقف إذا كان المحتوى به خطأ).
   ========================================================= */

/* ▼▼▼ اكتب هنا اسم المستودع على GitHub بالشكل: اسم-الحساب/اسم-المستودع ▼▼▼
   مثال:  mohamed-waheed/misr-almahaba
   (لو تركته فارغًا يحاول البناء اكتشافه تلقائيًا من Vercel) */
const GITHUB_REPO = "";
/* ▲▲▲ ─────────────────────────────────────────────────────────── ▲▲▲ */

(() => {
  /* ---------- Reusable field builders ---------- */
  const bi = (label, name, { required = true, hint, text = false } = {}) => ({
    label, name, widget: "object", collapsed: false, required, hint,
    fields: [
      { label: "العربية", name: "ar", widget: text ? "text" : "string", required },
      { label: "English", name: "en", widget: text ? "text" : "string", required: false },
    ],
  });
  const biList = (label, name, { text = false, hint } = {}) => ({
    label, name, widget: "list", required: false, hint, summary: "{{fields.ar}}", label_singular: "عنصر",
    fields: [
      { label: "العربية", name: "ar", widget: text ? "text" : "string" },
      { label: "English", name: "en", widget: text ? "text" : "string", required: false },
    ],
  });
  const image = (label, name, hint = "JPG أو PNG أو WebP — يفضل عرض 1600px وحجم أقل من 1MB") => ({ label, name, widget: "image", required: false, hint, choose_url: false });
  const order = { label: "الترتيب", name: "order", widget: "number", value_type: "int", default: 99, hint: "الأصغر يظهر أولًا" };
  const published = { label: "منشور على الموقع", name: "published", widget: "boolean", default: true, hint: "أوقفه لإخفاء العنصر بدون حذفه" };
  const slug = (label = "المعرّف في الرابط (slug)") => ({ label, name: "slug", widget: "string", pattern: ["^[a-z0-9]+(?:-[a-z0-9]+)*$", "حروف إنجليزية صغيرة وأرقام وشرطة (-) فقط، مثل: cardiology"], hint: "يظهر في رابط الصفحة. لا تغيّره بعد النشر حتى لا تتعطل الروابط القديمة." });
  const ICONS = ["hospital", "pulse", "heart", "drop", "scalpel", "baby", "stethoscope", "motion", "tooth", "flask", "scan", "brain", "spine", "shield", "tablet", "badge", "grid", "pin", "phone", "calendar", "user", "users", "clock", "mail", "info", "map", "image", "globe"];
  const icon = { label: "الأيقونة", name: "icon", widget: "select", options: ICONS, default: "hospital" };
  const DAYS = [["الأحد", "0"], ["الاثنين", "1"], ["الثلاثاء", "2"], ["الأربعاء", "3"], ["الخميس", "4"], ["الجمعة", "5"], ["السبت", "6"]].map(([label, value]) => ({ label, value }));
  const TIME = ["^([01]\\d|2[0-3]):[0-5]\\d$", "اكتب الوقت بنظام 24 ساعة مثل 09:00 أو 17:30"];
  const noPreview = { preview: false };
  const catOptions = (list) => ({ label: "الفئات", name: list, widget: "list", label_singular: "فئة", summary: "{{fields.label.ar}} ({{fields.id}})",
    fields: [{ label: "المعرّف", name: "id", widget: "string", pattern: ["^[a-z0-9-]+$", "حروف إنجليزية صغيرة فقط"] }, bi("الاسم", "label")] });
  const catRelation = (list) => ({ label: "الفئة", name: "category", widget: "relation", collection: "settings", file: "categories", value_field: `${list}.*.id`, search_fields: [`${list}.*.label.ar`], display_fields: [`${list}.*.label.ar`], hint: "لإضافة فئة جديدة: الإعدادات ← فئات الأقسام والخدمات" });
  const deptRelation = (name, label, multiple = false, required = true) => ({ label, name, widget: "relation", collection: "departments", value_field: "slug", search_fields: ["name.ar", "name.en", "slug"], display_fields: ["name.ar"], multiple, required });
  const svcRelation = (name, label) => ({ label, name, widget: "relation", collection: "services", value_field: "slug", search_fields: ["name.ar", "name.en", "slug"], display_fields: ["name.ar"], multiple: true, required: false });

  window.MA_CMS_CONFIG = {
    load_config_file: false,
    locale: "ar",
    backend: {
      name: "github",
      repo: GITHUB_REPO,
      branch: "__BRANCH__",
      // تسجيل الدخول عبر دوال Vercel في /api (auth + callback) — base_url يُضبط تلقائيًا في admin/index.html
      base_url: "",
      auth_endpoint: "api/auth",
      commit_messages: {
        create: "إضافة {{collection}}: {{slug}}",
        update: "تعديل {{collection}}: {{slug}}",
        delete: "حذف {{collection}}: {{slug}}",
        uploadMedia: "رفع صورة: {{path}}",
        deleteMedia: "حذف صورة: {{path}}",
        openAuthoring: "{{message}}",
      },
    },
    local_backend: true,
    publish_mode: "editorial_workflow",
    site_url: "__SITE_URL__",
    display_url: "__SITE_URL__",
    logo_url: "/uploads/logo-256.webp",
    media_folder: "content/uploads",
    public_folder: "/uploads",
    slug: { encoding: "ascii", clean_accents: true, sanitize_replacement: "-" },
    collections: [
      /* ================= الأطباء ================= */
      {
        name: "doctors", label: "الأطباء", label_singular: "طبيب", folder: "content/doctors", format: "json", extension: "json",
        create: true, delete: true, identifier_field: "id", slug: "{{id}}", editor: noPreview,
        summary: "{{name.ar}} — {{dept}}", sortable_fields: ["order", "id"],
        view_filters: [{ label: "بيانات تجريبية", field: "sample", pattern: true }, { label: "مخفي", field: "published", pattern: false }],
        description: "إضافة وتعديل وحذف الأطباء، صورهم، تخصصاتهم ومواعيد العمل.",
        fields: [
          { label: "المعرّف (id)", name: "id", widget: "string", pattern: ["^[a-z0-9]+(?:-[a-z0-9]+)*$", "حروف إنجليزية صغيرة وأرقام وشرطة فقط، مثل: dr-ahmed-ali"], hint: "يظهر في رابط صفحة الطبيب. مثال: dr-ahmed-ali" },
          published,
          { label: "بيانات تجريبية؟", name: "sample", widget: "boolean", default: false, hint: "فعّلها فقط للسجلات التوضيحية — تظهر شارة «بيانات تجريبية» على الموقع" },
          order,
          image("صورة الطبيب", "photo", "صورة مربعة واضحة للوجه، يفضل 800×800"),
          bi("اسم الطبيب", "name"),
          bi("اللقب / الدرجة", "title", { hint: "مثال: استشاري جراحة العظام" }),
          deptRelation("dept", "القسم / التخصص"),
          bi("نبذة", "bio", { text: true, required: false }),
          biList("المؤهلات والخبرات", "qualifications"),
          svcRelation("services", "الخدمات التي يقدمها"),
          {
            label: "مواعيد العمل", name: "schedule", widget: "list", label_singular: "موعد", required: false,
            summary: "{{fields.day}} : {{fields.from}} → {{fields.to}}",
            fields: [
              { label: "اليوم", name: "day", widget: "select", options: DAYS },
              { label: "من", name: "from", widget: "string", pattern: TIME, hint: "مثال 10:00" },
              { label: "إلى", name: "to", widget: "string", pattern: TIME, hint: "مثال 14:00" },
            ],
          },
        ],
      },

      /* ================= الأقسام ================= */
      {
        name: "departments", label: "الأقسام الطبية", label_singular: "قسم", folder: "content/departments", format: "json", extension: "json",
        create: true, delete: true, identifier_field: "slug", slug: "{{slug}}", editor: noPreview, summary: "{{name.ar}}", sortable_fields: ["order", "slug"],
        description: "الأقسام والتخصصات التي تظهر في الموقع ونظام الحجز.",
        fields: [
          slug(), published, order, icon,
          catRelation("departments"),
          { label: "متاح للحجز", name: "bookable", widget: "boolean", default: true, hint: "يظهر القسم في خطوات الحجز" },
          image("صورة القسم", "image"),
          bi("اسم القسم", "name"),
          bi("وصف مختصر (يظهر في البطاقة)", "summary", { text: true }),
          bi("مقدمة صفحة القسم", "intro", { text: true, required: false }),
          biList("ماذا نقدم؟", "offers"),
          biList("لمن يناسب؟", "forWhom"),
          svcRelation("services", "خدمات مرتبطة"),
          bi("ملاحظة تظهر للمرضى (اختياري)", "note", { text: true, required: false }),
        ],
      },

      /* ================= الخدمات ================= */
      {
        name: "services", label: "الخدمات الطبية", label_singular: "خدمة", folder: "content/services", format: "json", extension: "json",
        create: true, delete: true, identifier_field: "slug", slug: "{{slug}}", editor: noPreview, summary: "{{name.ar}}", sortable_fields: ["order", "slug"],
        fields: [
          slug(), published, order, icon,
          catRelation("services"),
          { ...deptRelation("dept", "القسم المرتبط (اختياري)"), required: false },
          { label: "متاحة للحجز", name: "bookable", widget: "boolean", default: true },
          image("صورة الخدمة", "image"),
          bi("اسم الخدمة", "name"),
          bi("وصف مختصر", "summary", { text: true }),
          biList("ماذا نقدم؟", "offers"),
          biList("لمن يناسب؟", "forWhom"),
          bi("ملاحظة (اختياري)", "note", { text: true, required: false }),
        ],
      },

      /* ================= الأخبار والمقالات ================= */
      {
        name: "news", label: "الأخبار والمقالات", label_singular: "خبر / مقال", folder: "content/news", format: "json", extension: "json",
        create: true, delete: true, identifier_field: "slug", slug: "{{slug}}", editor: noPreview, summary: "{{date}} — {{title.ar}}", sortable_fields: ["date", "slug"],
        view_groups: [{ label: "النوع", field: "type" }],
        fields: [
          slug(), published,
          { label: "النوع", name: "type", widget: "select", default: "news", options: [{ label: "خبر", value: "news" }, { label: "مقال توعوي", value: "article" }] },
          { label: "التاريخ", name: "date", widget: "datetime", format: "YYYY-MM-DD", date_format: "YYYY-MM-DD", time_format: false, picker_utc: true },
          { label: "تاريخ مختصر بديل (اختياري)", name: "dateLabel", widget: "string", required: false, hint: "مثال: 2020 — يظهر بدل التاريخ الكامل" },
          image("صورة الخبر", "image"),
          bi("العنوان", "title"),
          bi("ملخص قصير", "excerpt", { text: true, required: false }),
          biList("نص الخبر (فقرات)", "body", { text: true, hint: "كل عنصر = فقرة" }),
          { label: "المصدر (اختياري)", name: "source", widget: "object", required: false, collapsed: true,
            fields: [bi("اسم المصدر", "name", { required: false }), { label: "رابط المصدر", name: "url", widget: "string", required: false, pattern: ["^(https?://.+)?$", "يجب أن يبدأ الرابط بـ https://"] }] },
        ],
      },

      /* ================= الصفحات ================= */
      {
        name: "pages", label: "الصفحات", label_singular: "صفحة", editor: noPreview,
        files: [
          {
            name: "home", label: "الصفحة الرئيسية", file: "content/pages/home.json",
            fields: [
              { label: "الواجهة (Hero)", name: "hero", widget: "object", collapsed: false, fields: [
                bi("سطر صغير أعلى العنوان (اختياري)", "eyebrow", { required: false }),
                bi("العنوان — السطر الأول", "line1"),
                bi("العنوان — بداية السطر الثاني", "line2"),
                bi("الكلمة المميزة باللون", "highlight"),
                bi("الوصف", "lead", { text: true }),
                image("الصورة الرئيسية", "image", "صورة عرضية للمبنى أو الفريق، يفضل 1600×1100"),
                bi("عنوان بطاقة الاعتماد", "badgeTitle", { required: false }),
                bi("نص بطاقة الاعتماد", "badgeText", { required: false }),
                biList("نقاط الثقة أسفل الأزرار", "trust"),
              ] },
              { label: "قسم «عن المستشفى»", name: "about", widget: "object", collapsed: true, fields: [
                bi("العنوان", "title"), bi("النص", "text", { text: true }), image("الصورة", "image"),
                { label: "النقاط", name: "pillars", widget: "list", label_singular: "نقطة", summary: "{{fields.q.ar}}", fields: [bi("السؤال", "q"), bi("العنوان", "title"), bi("النص", "text", { text: true })] },
              ] },
              { ...deptRelation("featuredDepartments", "الأقسام المميزة في الرئيسية", true), hint: "اختر الأقسام بالترتيب" },
              { label: "عدد الأطباء المعروضين", name: "doctorsCount", widget: "number", value_type: "int", min: 0, max: 12, default: 4 },
              { label: "عدد الأخبار المعروضة", name: "newsCount", widget: "number", value_type: "int", min: 0, max: 9, default: 3 },
              { label: "لماذا مصر المحبة؟", name: "why", widget: "list", label_singular: "ميزة", summary: "{{fields.title.ar}}", fields: [
                icon, { label: "بطاقة كبيرة مميزة", name: "feature", widget: "boolean", default: false }, bi("شارة صغيرة (للبطاقة الكبيرة)", "chip", { required: false }), bi("العنوان", "title"), bi("النص", "text", { text: true }),
              ] },
              { label: "دعوة الحجز أسفل الصفحات", name: "cta", widget: "object", collapsed: true, fields: [bi("العنوان", "title"), bi("النص", "text", { text: true })] },
            ],
          },
          {
            name: "about", label: "عن المستشفى", file: "content/pages/about.json",
            fields: [
              { label: "القصة", name: "story", widget: "object", collapsed: false, fields: [bi("العنوان", "title"), image("الصورة", "image"), biList("الفقرات", "paragraphs", { text: true })] },
              { label: "المحطات الزمنية", name: "timeline", widget: "list", label_singular: "محطة", summary: "{{fields.date.ar}} — {{fields.title.ar}}", fields: [bi("التاريخ", "date"), bi("الحدث", "title")] },
              bi("الرؤية", "vision", { text: true, required: false }),
              bi("الرسالة", "mission", { text: true, required: false }),
              { label: "القيم", name: "values", widget: "list", required: false, label_singular: "قيمة", summary: "{{fields.title.ar}}", fields: [bi("القيمة", "title"), bi("الشرح", "text", { text: true, required: false })] },
            ],
          },
          {
            name: "facilities", label: "المرافق والوحدات", file: "content/pages/facilities.json",
            fields: [{ label: "المرافق", name: "items", widget: "list", label_singular: "مرفق", summary: "{{fields.title.ar}}", fields: [
              { label: "المعرّف", name: "id", widget: "string", pattern: ["^[a-z0-9-]+$", "حروف إنجليزية صغيرة فقط"] }, icon, image("الصورة", "image"),
              bi("العنوان", "title"), bi("الوصف", "text", { text: true }),
              { label: "رابط «المزيد»", name: "link", widget: "string", required: false, hint: "مسار داخل الموقع مثل /departments/dialysis" },
            ] }],
          },
        ],
      },

      /* ================= الإعدادات ================= */
      {
        name: "settings", label: "الإعدادات", label_singular: "إعداد", editor: noPreview,
        files: [
          {
            name: "general", label: "الهوية والإعلان والـ SEO", file: "content/settings/general.json",
            fields: [
              bi("اسم المستشفى", "name"), bi("الاسم المختصر", "shortName"), bi("الشعار (Slogan)", "slogan"), bi("التبعية / نبذة سطر واحد", "affiliation", { text: true }),
              image("اللوجو", "logo", "PNG أو WebP بخلفية شفافة أو بيضاء، مربع 512×512"),
              image("أيقونة المتصفح (Favicon)", "favicon", "مربع صغير 96×96"),
              { label: "رابط الموقع (اختياري)", name: "siteUrl", widget: "string", required: false, hint: "يُملأ تلقائيًا من Vercel. اكتبه فقط عند ربط دومين خاص، مثل https://misralmahaba.com" },
              bi("وصف الموقع لمحركات البحث", "seoDescription", { text: true }),
              { label: "شريط إعلان أعلى الموقع", name: "announcement", widget: "object", collapsed: true, fields: [
                { label: "مفعّل", name: "enabled", widget: "boolean", default: false },
                { label: "النمط", name: "style", widget: "select", default: "info", options: [{ label: "معلومة (أزرق)", value: "info" }, { label: "هام / عاجل (برتقالي)", value: "urgent" }, { label: "نجاح (أخضر)", value: "success" }] },
                bi("نص الإعلان", "text", { required: false }),
                { label: "رابط (اختياري)", name: "link", widget: "string", required: false, hint: "مثل #/news/... أو رابط خارجي" },
              ] },
            ],
          },
          {
            name: "contact", label: "التواصل والعنوان والمواعيد", file: "content/settings/contact.json",
            fields: [
              { label: "العنوان", name: "address", widget: "object", collapsed: false, fields: [bi("العنوان التفصيلي", "line"), bi("المدينة", "city"), bi("المحافظة", "governorate"), bi("الدولة", "country")] },
              { label: "أرقام الهاتف", name: "phones", widget: "list", label_singular: "رقم", summary: "{{fields.display}}", hint: "الرقم الأول هو الرقم الرئيسي لأزرار الاتصال", fields: [
                bi("الوصف", "label"),
                { label: "الرقم للاتصال", name: "number", widget: "string", hint: "مثال: 0863840801 أو +20863840801" },
                { label: "طريقة العرض", name: "display", widget: "string", required: false, hint: "مثال: 086 384 0801" },
              ] },
              { label: "واتساب (اختياري)", name: "whatsapp", widget: "string", required: false, hint: "مثال: 01012345678" },
              { label: "البريد الإلكتروني", name: "email", widget: "string", required: false, pattern: ["^([^@\\s]+@[^@\\s]+\\.[^@\\s]+)?$", "بريد إلكتروني غير صالح"] },
              { label: "مواعيد العمل", name: "hours", widget: "object", collapsed: false, fields: [bi("الطوارئ", "emergency", { required: false }), bi("العيادات الخارجية", "clinics", { required: false })] },
              { label: "رابط خرائط Google", name: "mapsUrl", widget: "string" },
              image("صورة بطاقة الخريطة", "mapImage"),
              { label: "حسابات التواصل الاجتماعي", name: "social", widget: "object", collapsed: true, fields: ["facebook", "messenger", "instagram", "youtube", "tiktok", "x"].map((n) => ({ label: n, name: n, widget: "string", required: false })) },
            ],
          },
          {
            name: "stats", label: "أرقام المستشفى", file: "content/settings/stats.json",
            fields: [
              { label: "إظهار الأرقام", name: "enabled", widget: "boolean", default: true },
              bi("ملاحظة المصدر/التاريخ", "asOf", { required: false }),
              { label: "رابط المصدر", name: "source", widget: "string", required: false },
              { label: "الأرقام", name: "items", widget: "list", label_singular: "رقم", summary: "{{fields.prefix}}{{fields.number}} {{fields.label.ar}}", fields: [
                { label: "الرقم", name: "number", widget: "number", value_type: "int" }, { label: "رمز قبل الرقم (اختياري)", name: "prefix", widget: "string", required: false, hint: "مثل ~ أو +" }, bi("الوصف", "label"),
              ] },
            ],
          },
          {
            name: "categories", label: "فئات الأقسام والخدمات", file: "content/settings/categories.json",
            fields: [catOptions("departments"), catOptions("services")].map((f, i) => ({ ...f, label: i ? "فئات الخدمات" : "فئات الأقسام" })),
          },
        ],
      },
    ],
  };
})();
