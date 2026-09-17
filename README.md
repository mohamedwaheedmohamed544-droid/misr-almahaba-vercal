# مستشفى مصر المحبة — Misr Al-Mahaba Hospital (نسخة Vercel)

موقع ثنائي اللغة (العربية افتراضيًا + الإنجليزية) مع **لوحة تحكم كاملة** لإدارة المحتوى على `/admin`.

- **الموقع**: HTML + CSS + JavaScript بدون مكتبات، يُبنى في `dist/`.
- **لوحة التحكم**: [Decap CMS](https://decapcms.org) بواجهة عربية — كل حفظ = Commit على GitHub ← Vercel ينشر تلقائيًا. تسجيل الدخول بحساب GitHub عبر دوال Vercel داخل `api/` (بدون أي خدمة خارجية).
- **الحماية**: فحص تلقائي للمحتوى قبل كل نشر (Vercel + GitHub Actions). أي خطأ يوقف النشر والموقع الحالي يبقى كما هو.

---

## ما الذي يمكن التحكم فيه من اللوحة؟

| القسم | إضافة | تعديل | حذف/إخفاء |
|---|:-:|:-:|:-:|
| الأطباء (الاسم، اللقب، الصورة، القسم، المؤهلات، الخدمات، **مواعيد العمل**) | ✅ | ✅ | ✅ |
| الأقسام الطبية (الوصف، ماذا نقدم، لمن يناسب، الصورة، الأيقونة، متاح للحجز) | ✅ | ✅ | ✅ |
| الخدمات الطبية | ✅ | ✅ | ✅ |
| الأخبار والمقالات التوعوية | ✅ | ✅ | ✅ |
| الصفحة الرئيسية (العنوان، الصورة، الأقسام المميزة، لماذا نحن، دعوة الحجز) | — | ✅ | — |
| عن المستشفى (القصة، المحطات، الرؤية، الرسالة، القيم) | ✅ | ✅ | ✅ |
| المرافق | ✅ | ✅ | ✅ |
| الهوية: الاسم، الشعار، اللوجو، أيقونة المتصفح، وصف SEO | — | ✅ | — |
| **شريط إعلان** أعلى الموقع (تشغيل/إيقاف) | — | ✅ | — |
| التواصل: الهواتف، واتساب، البريد، العنوان، المواعيد، الخريطة، السوشيال | ✅ | ✅ | ✅ |
| أرقام المستشفى (العدادات) | ✅ | ✅ | ✅ |
| فئات الأقسام والخدمات | ✅ | ✅ | ✅ |
| الصور (رفع وحذف) | ✅ | — | ✅ |

دليل الاستخدام للمحررين موجود داخل اللوحة: `/admin/guide.html`

---

## الإعداد لأول مرة (مرة واحدة فقط)

### 1) اكتب اسم المستودع
افتح `admin/config.js` وعدّل السطر في أوله:
```js
const GITHUB_REPO = "اسم-حسابك/misr-almahaba";
```
> لو تركته فارغًا يكتشفه البناء تلقائيًا من Vercel، ويظهر في سجل البناء `✔ dashboard repo: ...`.

### 2) ارفع المشروع على GitHub
```bash
git init
git add .
git commit -m "Misr Al-Mahaba website + CMS (Vercel)"
git branch -M main
git remote add origin https://github.com/USERNAME/misr-almahaba.git
git push -u origin main
```
أو من موقع GitHub: **Add file ← Upload files** واسحب **محتويات** الفولدر (ومنها الفولدرات المخفية `.github`).

### 3) انشره على Vercel
1. ادخل [vercel.com](https://vercel.com) بحساب GitHub ← **Add New… ← Project**.
2. اختر المستودع ← **Import**.
3. **Framework Preset**: `Other` — الباقي يُقرأ تلقائيًا من `vercel.json` (Build: `npm run build` · Output: `dist`).
4. **Deploy** ← هتاخد رابط زي `misr-almahaba.vercel.app`.

### 4) فعّل تسجيل الدخول للوحة التحكم
**أ. أنشئ OAuth App على GitHub**
1. GitHub ← صورتك ← **Settings ← Developer settings ← OAuth Apps ← New OAuth App**
2. املأ:
   - **Application name**: `Misr Al-Mahaba CMS`
   - **Homepage URL**: `https://misr-almahaba.vercel.app` (رابط موقعك)
   - **Authorization callback URL**: `https://misr-almahaba.vercel.app/api/callback`
3. **Register application** ← انسخ **Client ID** ← **Generate a new client secret** وانسخه.

**ب. أضف القيم في Vercel**
المشروع ← **Settings ← Environment Variables** ← أضف (لبيئة Production):

| Name | Value |
|---|---|
| `GITHUB_CLIENT_ID` | الـ Client ID |
| `GITHUB_CLIENT_SECRET` | الـ Client Secret |

ثم **Deployments ← آخر نشر ← ⋯ ← Redeploy** (المتغيرات الجديدة لا تعمل إلا بعد إعادة النشر).

### 5) ادخل على اللوحة
افتح `https://misr-almahaba.vercel.app/admin/` ← **الدخول بحساب GitHub** ← وافق على الصلاحيات ← ابدأ التعديل.

### 6) أضف فريق التحرير
GitHub ← المستودع ← **Settings ← Collaborators ← Add people**.

### لو ربطت دومين خاص (مثل misralmahaba.com)
- Vercel ← Settings ← **Domains** ← أضف الدومين.
- عدّل **Homepage URL** و**Authorization callback URL** في OAuth App إلى الدومين الجديد: `https://misralmahaba.com/api/callback`
- أضف متغير `SITE_URL` = `https://misralmahaba.com` في Vercel ثم Redeploy (لروابط SEO).
- ادخل على اللوحة من الدومين الجديد فقط.

### متغيرات اختيارية
| Name | الفائدة |
|---|---|
| `CMS_REPO` | اسم المستودع لو لم يُكتشف تلقائيًا |
| `CMS_BRANCH` | فرع غير `main` |
| `SITE_URL` | الدومين الأساسي للموقع |
| `VERCEL_IMAGES` = `1` | تفعيل ضغط الصور وتحويلها WebP/AVIF عبر Vercel (يُحتسب من حصة الصور في خطتك) |
| `OAUTH_ALLOWED_ORIGINS` | دومينات إضافية مسموح لها باستلام تسجيل الدخول |

---

## التشغيل والتعديل على جهازك
```bash
npm run build      # فحص المحتوى + بناء dist/
npm run validate   # فحص المحتوى فقط
npm run dev        # بناء وتشغيل الموقع على http://localhost:5173
npm run cms        # (في نافذة ثانية) تشغيل اللوحة محليًا بدون GitHub ← http://localhost:5173/admin/
```
يحتاج Node.js 18 أو أحدث.

---

## هيكل المشروع
```
content/              ← كل محتوى الموقع (تديره لوحة التحكم)
  settings/           general · contact · stats · categories
  pages/              home · about · facilities
  departments/*.json  services/*.json  doctors/*.json  news/*.json
  uploads/            الصور
admin/                ← لوحة التحكم
  index.html          تحميل Decap CMS + الواجهة العربية
  config.js           تعريف كل الحقول والأقسام
  locale-ar.js        ترجمة الواجهة للعربية
  guide.html          دليل المحررين
scripts/
  content.mjs         تحميل وفحص المحتوى
  validate.mjs        أمر الفحص
src/                  ← كود الموقع (styles · utils · data · components · pages · main.js)
build.mjs             بناء الموقع
vercel.json           إعدادات Vercel (البناء، الهيدرز، الروابط، الصور)
api/                  تسجيل الدخول بحساب GitHub (auth.js · callback.js)
.github/workflows/    فحص تلقائي مع كل تعديل
docs/README.md        تحليل المحتوى والـ Design System
```

## ملاحظات تقنية
- **الصور**: تُقدَّم كما هي افتراضيًا. فعّل `VERCEL_IMAGES=1` لضغطها وتصغيرها تلقائيًا عبر Vercel Image Optimization.
- **تسجيل الدخول**: `api/auth.js` يحوّل إلى GitHub، و`api/callback.js` يبدّل الكود بالتوكن على السيرفر (الـ Secret لا يصل للمتصفح أبدًا) مع حماية `state`.
- **SEO**: `sitemap.xml` و`robots.txt` يُولَّدان تلقائيًا من المحتوى المنشور مع روابط العربية والإنجليزية.
- **إضافة حقل جديد**: عرّفه في `admin/config.js`، ثم استخدمه في صفحة الموقع المناسبة داخل `src/pages`.
- **لوحة التحكم معزولة**: `/admin` مستبعدة من محركات البحث.
