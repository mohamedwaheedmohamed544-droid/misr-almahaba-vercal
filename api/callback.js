/* Step 2 — GitHub redirects back here with ?code&state; we exchange the code for a token
   (server-side, so the client secret never reaches the browser) and pass it to the dashboard. */
const { originOf, parseCookies, handoff } = require("./_oauth");

module.exports = async (req, res) => {
  const origin = originOf(req);
  const url = new URL(req.url, origin);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = parseCookies(req).cms_oauth_state;
  res.setHeader("Set-Cookie", "cms_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0");

  if (url.searchParams.get("error")) return handoff(res, { origin, status: "error", payload: { message: url.searchParams.get("error_description") || url.searchParams.get("error") } });
  if (!code) return handoff(res, { origin, status: "error", payload: { message: "لم يتم استلام رمز التفويض من GitHub" } });
  if (!state || !expected || state !== expected) return handoff(res, { origin, status: "error", payload: { message: "انتهت صلاحية محاولة الدخول، حاول مرة أخرى" } });

  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "misr-almahaba-cms" },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code, redirect_uri: `${origin}/api/callback` }),
    });
    const data = await r.json();
    if (!data.access_token) return handoff(res, { origin, status: "error", payload: { message: data.error_description || data.error || "GitHub رفض الطلب" } });
    return handoff(res, { origin, status: "success", payload: { token: data.access_token, provider: "github" } });
  } catch (e) {
    return handoff(res, { origin, status: "error", payload: { message: "تعذّر الاتصال بـ GitHub: " + e.message } });
  }
};
