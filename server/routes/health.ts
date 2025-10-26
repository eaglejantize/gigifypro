import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const healthData = {
      ok: true,
      ts: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    };
    
    res.json(healthData);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Health check failed",
      ts: new Date().toISOString()
    });
  }
});

export default router;
