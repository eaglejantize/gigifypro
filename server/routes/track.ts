import { Router } from "express";

const r = Router();

r.post("/cta-click", (req, res) => {
  const { name, path } = req.body || {};
  console.log(`[CTA] click: ${name || "unknown"} from ${path || "-"}`);
  res.json({ ok: true });
});

export default r;
