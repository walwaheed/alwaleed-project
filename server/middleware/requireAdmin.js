const supabase = require("../lib/supabase");

async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || data.user.email !== adminEmail) {
      return res.status(403).json({ error: "Not authorized" });
    }

    req.adminUser = data.user;
    next();
  } catch (err) {
    console.error("requireAdmin error:", err);
    res.status(500).json({ error: "Auth check failed" });
  }
}

module.exports = requireAdmin;
