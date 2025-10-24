import { Router } from "express";
import fs from "fs";
import path from "path";
import { getCache, putCache } from "../utils/cache";

const router = Router();
const filePath = path.join(process.cwd(), "server", "content", "testimonials.json");

router.get("/", (_req, res) => {
  const key = "content:testimonials";
  const hit = getCache(key);
  
  if (hit) {
    if (_req.headers["if-none-match"] === hit.etag) {
      return res.status(304).end();
    }
    res.setHeader("Cache-Control", "public, max-age=300");
    res.setHeader("ETag", hit.etag);
    return res.json(hit.body);
  }
  
  const raw = fs.readFileSync(filePath, "utf8");
  const body = JSON.parse(raw);
  const { etag } = putCache(key, body, 300000); // 5 minute cache
  
  res.setHeader("Cache-Control", "public, max-age=300");
  res.setHeader("ETag", etag);
  res.json(body);
});

export default router;
