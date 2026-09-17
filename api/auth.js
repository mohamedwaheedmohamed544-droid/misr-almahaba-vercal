/* Step 1 — the dashboard opens /api/auth in a popup; we redirect to GitHub's consent screen. */
const { crypto, originOf, handoff } = require("./_oauth");

module.exports = (req, res) => {
  const origin = originOf(req);
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || !process.env.GITHUB_CLIENT_SECRET) {
    return handoff(res, { origin, status: "error", payload: { message: "لم يتم ضبط GITHUB_CLIENT_ID و GITHUB_CLIENT_SECRET في إعدادات Vercel" } });
  }
  const url = new URL(req.url, origin);
  const scope = url.searchParams.get("scope") || "repo,user";
  const state = crypto.randomBytes(24).toString("hex");
  const redirectUri = `${origin}/api/callback`;
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", scope);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("allow_signup", "false");

  res.statusCode = 302;
  res.setHeader("Set-Cookie", `cms_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Location", authorize.toString());
  res.end();
};
