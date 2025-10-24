import { Router } from "express";
import { db } from "../db";
import { analyticsEvents, users } from "@shared/schema";
import { sql, desc, count } from "drizzle-orm";
import isAdmin from "../middleware/isAdmin";

const router = Router();

// Require admin role for all analytics routes
router.use(isAdmin);

// GET /api/admin/analytics/summary
router.get("/summary", async (_req, res) => {
  try {
    // Total users
    const totalUsers = await db.select({ count: count() }).from(users);

    // Total events by kind
    const eventsByKind = await db
      .select({
        kind: analyticsEvents.kind,
        count: count(),
      })
      .from(analyticsEvents)
      .groupBy(analyticsEvents.kind);

    // Top services viewed
    const topServices = await db
      .select({
        service: analyticsEvents.name,
        views: count(),
      })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.kind} = 'service_view'`)
      .groupBy(analyticsEvents.name)
      .orderBy(desc(count()))
      .limit(10);

    // Top knowledge articles viewed
    const topArticles = await db
      .select({
        article: analyticsEvents.name,
        views: count(),
      })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.kind} = 'knowledge_view'`)
      .groupBy(analyticsEvents.name)
      .orderBy(desc(count()))
      .limit(10);

    // Top CTA clicks
    const topCtas = await db
      .select({
        cta: analyticsEvents.name,
        clicks: count(),
      })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.kind} = 'cta_click'`)
      .groupBy(analyticsEvents.name)
      .orderBy(desc(count()))
      .limit(10);

    // Recent page views (last 7 days)
    const recentPageViews = await db
      .select({
        date: sql<string>`DATE(${analyticsEvents.createdAt})`,
        views: count(),
      })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.kind} = 'page_view' AND ${analyticsEvents.createdAt} >= NOW() - INTERVAL '7 days'`)
      .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
      .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

    res.json({
      totalUsers: totalUsers[0]?.count || 0,
      eventsByKind: eventsByKind.map(e => ({ kind: e.kind, count: Number(e.count) })),
      topServices: topServices.map(s => ({ name: s.service || "unknown", views: Number(s.views) })),
      topArticles: topArticles.map(a => ({ name: a.article || "unknown", views: Number(a.views) })),
      topCtas: topCtas.map(c => ({ name: c.cta || "unknown", clicks: Number(c.clicks) })),
      recentPageViews: recentPageViews.map(pv => ({ date: pv.date, views: Number(pv.views) })),
    });
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
