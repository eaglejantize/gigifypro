import { Router } from "express";
import { storage } from "../storage";

const r = Router();

r.get("/", async (req, res) => {
  const uid = (req.session as any)?.uid;
  if (!uid) return res.json(null);
  const u = await storage.getUser(uid);
  if (!u) return res.json(null);
  
  // Return only safe fields (no password)
  const { password: _, ...safeUser } = u;
  res.json(safeUser);
});

export default r;
