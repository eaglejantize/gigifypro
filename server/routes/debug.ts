import type { Express, Router as ExpressRouter } from "express";
import { Router } from "express";
import { storage } from "../storage";
const r: ExpressRouter = Router();

r.get("/debug/info", async (req, res) => {
  const routes = (req.app as any)?._router?.stack
    ?.filter((l: any) => l.route)
    ?.map((l: any) => Object.keys(l.route.methods).map(m => `${m.toUpperCase()} ${l.route.path}`))
    ?.flat() || [];
  
  res.json({
    env: {
      NODE_ENV: process.env.NODE_ENV || "development",
      DATABASE_URL: process.env.DATABASE_URL ? "configured" : "(missing)",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "configured" : "(missing)",
    },
    routeCount: routes.length,
    sampleRoutes: routes.slice(0, 20)
  });
});

r.get("/debug/counts", async (_req, res) => {
  const out: any = {};
  
  try {
    const users = await storage.getAllUsers();
    out.users = users.length;
  } catch (e) {
    out.users = -1;
  }
  
  try {
    const products = await storage.getAllProducts();
    out.products = products.length;
  } catch (e) {
    out.products = -1;
  }
  
  try {
    const listings = await storage.getAllListings();
    out.serviceListings = listings.length;
  } catch (e) {
    out.serviceListings = -1;
  }
  
  try {
    const articles = await storage.getAllArticles();
    out.knowledgeArticles = articles.length;
  } catch (e) {
    out.knowledgeArticles = -1;
  }
  
  try {
    const posts = await storage.getAllPosts();
    out.communityPosts = posts.length;
  } catch (e) {
    out.communityPosts = -1;
  }
  
  res.json(out);
});

export default r;
