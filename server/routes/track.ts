import { Router } from "express";
import { db } from "../db";
import { analyticsEvents } from "@shared/schema";

const r = Router();

r.post("/cta-click", async (req, res) => {
  const { name, path } = req.body || {};
  const userId = (req.session as any)?.userId || null;
  
  console.log(`[CTA] click: ${name || "unknown"} from ${path || "-"}`);
  
  try {
    await db.insert(analyticsEvents).values({
      userId,
      kind: "cta_click",
      name,
      path,
      meta: JSON.stringify(req.body),
    });
  } catch (error) {
    console.error("Error tracking CTA click:", error);
  }
  
  res.json({ ok: true });
});

r.post("/page-view", async (req, res) => {
  const { path } = req.body || {};
  const userId = (req.session as any)?.userId || null;
  
  try {
    await db.insert(analyticsEvents).values({
      userId,
      kind: "page_view",
      path,
      meta: JSON.stringify(req.body),
    });
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
  
  res.json({ ok: true });
});

r.post("/service-view", async (req, res) => {
  const { key, path } = req.body || {};
  const userId = (req.session as any)?.userId || null;
  
  try {
    await db.insert(analyticsEvents).values({
      userId,
      kind: "service_view",
      name: key,
      path,
      meta: JSON.stringify(req.body),
    });
  } catch (error) {
    console.error("Error tracking service view:", error);
  }
  
  res.json({ ok: true });
});

r.post("/knowledge-view", async (req, res) => {
  const { slug, path } = req.body || {};
  const userId = (req.session as any)?.userId || null;
  
  try {
    await db.insert(analyticsEvents).values({
      userId,
      kind: "knowledge_view",
      name: slug,
      path,
      meta: JSON.stringify(req.body),
    });
  } catch (error) {
    console.error("Error tracking knowledge view:", error);
  }
  
  res.json({ ok: true });
});

export default r;
