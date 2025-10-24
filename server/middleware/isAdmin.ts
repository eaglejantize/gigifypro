import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export default async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const uid = (req.session as any)?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });
    const user = await storage.getUser(uid);
    if (!user || user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    (req as any).user = user;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Admin check failed" });
  }
}
