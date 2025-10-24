import { Router } from "express";
import { z } from "zod";
import isAdmin from "../middleware/isAdmin";
import { readServiceInfo, writeServiceInfo } from "../content/serviceInfoStore";

const r = Router();
r.use(isAdmin);

// Validation schema for service info
const serviceInfoSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  summary: z.string(),
  expanded: z.string(),
  recommendedGear: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  badges: z.array(z.string()).default([]),
});

r.get("/", (_req, res) => {
  try {
    const services = readServiceInfo();
    res.json(services);
  } catch (error: any) {
    console.error("Error reading service info:", error);
    res.status(500).json({ error: "Failed to read service info" });
  }
});

r.post("/upsert", (req, res) => {
  try {
    // Validate request body
    const validatedData = serviceInfoSchema.parse(req.body);
    
    const all = readServiceInfo();
    const idx = all.findIndex((s: any) => s.key === validatedData.key);
    
    if (idx >= 0) {
      // Update existing service
      all[idx] = validatedData;
    } else {
      // Add new service
      all.push(validatedData);
    }
    
    writeServiceInfo(all);
    res.json({ ok: true, service: validatedData });
  } catch (error: any) {
    console.error("Error upserting service:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid service data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to save service" });
  }
});

r.post("/delete", (req, res) => {
  try {
    const { key } = req.body || {};
    if (!key) {
      return res.status(400).json({ error: "key required" });
    }
    
    const all = readServiceInfo();
    const filtered = all.filter((s: any) => s.key !== key);
    
    if (filtered.length === all.length) {
      return res.status(404).json({ error: "Service not found" });
    }
    
    writeServiceInfo(filtered);
    res.json({ ok: true, deletedKey: key });
  } catch (error: any) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

export default r;
