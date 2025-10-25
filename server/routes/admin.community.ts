import { Router } from "express";
import { db } from "../db";
import { reports, posts, comments } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import isAdmin from "../middleware/isAdmin";

const router = Router();
router.use(isAdmin);

// List Reports
router.get("/reports", async (req, res) => {
  try {
    const reportRows = await db
      .select()
      .from(reports)
      .where(eq(reports.status, "PENDING"))
      .orderBy(desc(reports.createdAt))
      .limit(100);

    res.json(reportRows);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Action a Report
router.post("/reports/action", async (req, res) => {
  try {
    const { id, action } = req.body || {};

    if (!id || !action) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update report status
    await db.update(reports)
      .set({ status: "REVIEWED" })
      .where(eq(reports.id, id));

    // Fetch the report to get postId/commentId
    const reportRows = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
    
    if (reportRows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    const report = reportRows[0];

    // Take action based on the action type
    if (action === "remove-post" && report.postId) {
      await db.delete(posts).where(eq(posts.id, report.postId));
    } else if (action === "remove-comment" && report.commentId) {
      await db.delete(comments).where(eq(comments.id, report.commentId));
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Error actioning report:", error);
    res.status(500).json({ error: "Failed to action report" });
  }
});

export default router;
