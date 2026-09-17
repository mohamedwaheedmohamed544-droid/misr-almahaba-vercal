/* Shared helpers for the GitHub OAuth flow used by the dashboard (Decap CMS).
   Required Vercel environment variables:
     GITHUB_CLIENT_ID      – from your GitHub OAuth App
     GITHUB_CLIENT_SECRET  – from your GitHub OAuth App
   Optional:
     OAUTH_ALLOWED_ORIGINS – extra comma-separated origins allowed to receive the token (e.g. a custom domain)
*/
const crypto = require("crypto");

const originOf = (req) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || (String(host).startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
};

const parseCookies = (req) => Object.fromEntries(String(req.headers.cookie || "").split(";").map((c) => c.trim().split("=")).filter((p) => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join("="))]));

const html = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
};

/* Page that hands the result back to the dashboard window using Decap's postMessage protocol */
const handoff = (res, { origin, status, payload }) => {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  const allowed = [origin, ...String(process.env.OAUTH_ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean)];
  return html(res, 200, `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تسجيل الدخول</title></head>
<body style="font-family:Tahoma,sans-serif;text-align:center;padding:3rem;color:#0D2236">
<p>${status === "success" ? "تم تسجيل الدخول… يمكنك إغلاق هذه النافذة." : "تعذّر تسجيل الدخول: " + String(payload.message || "").replace(/</g, "&lt;")}</p>
<script>
(function () {
  var allowed = ${JSON.stringify(allowed)};
  var message = ${JSON.stringify(message)};
  function receive(e) {
    if (allowed.indexOf(e.origin) === -1) return;
    window.opener && window.opener.postMessage(message, e.origin);
    window.removeEventListener("message", receive, false);
    setTimeout(function () { window.close(); }, 400);
  }
  window.addEventListener("message", receive, false);
  if (window.opener) window.opener.postMessage("authorizing:github", "*");
})();
</script></body></html>`);
};

module.exports = { crypto, originOf, parseCookies, html, handoff };
