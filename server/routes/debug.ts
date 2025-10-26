import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { users, workerProfiles, posts } from "@shared/schema";

const router = Router();

router.get("/counts", async (req, res) => {
  try {
    const [
      allUsers,
      allWorkerProfiles,
      serviceListings,
      products,
      allPosts
    ] = await Promise.all([
      db.select().from(users),
      db.select().from(workerProfiles),
      storage.getAllListings(),
      storage.getAllProducts(),
      db.select().from(posts)
    ]);

    const counts = {
      users: allUsers.length,
      workers: allWorkerProfiles.length,
      services: serviceListings.length,
      products: products.length,
      posts: allPosts.length,
      timestamp: new Date().toISOString()
    };

    res.json(counts);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch counts",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/routes", async (req, res) => {
  try {
    const routes = [
      "/api/health",
      "/api/debug/counts",
      "/api/debug/routes",
      "/api/auth/register",
      "/api/auth/login",
      "/api/auth/logout",
      "/api/me",
      "/api/listings",
      "/api/categories",
      "/api/store/products",
      "/api/community/posts",
      "/api/community/comments",
      "/api/community/reactions",
      "/api/admin/services",
      "/api/admin/analytics",
      "/api/admin/community/reports",
      "/api/track/page-view",
      "/api/track/service-view",
      "/api/track/knowledge-view",
      "/api/profile/:userId",
      "/api/testimonials"
    ];

    res.json({
      routes,
      count: routes.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch routes",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
