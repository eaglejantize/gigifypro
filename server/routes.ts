import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { z } from "zod";
import Stripe from "stripe";
import { readServiceInfo } from "./content/serviceInfoStore";
import meRouter from "./routes/me";
import adminServiceInfoRouter from "./routes/admin.serviceInfo";
import adminAnalyticsRouter from "./routes/admin.analytics";
import adminCommunityRouter from "./routes/admin.community";
import trackRouter from "./routes/track";
import profileRouter from "./routes/profile";
import testimonialsRouter from "./routes/testimonials";
import communityRouter from "./routes/community";
import gigscoreRouter from "./routes/gigscore";
import { getCache, putCache } from "./utils/cache";

// Stripe setup - from javascript_stripe integration
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-09-30.clover" })
  : null;

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(["user", "worker"]).default("user"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const workerProfileSchema = z.object({
  bio: z.string().optional(),
  skills: z.array(z.string()),
  hourlyRate: z.string(),
});

const listingSchema = z.object({
  categoryId: z.string(),
  title: z.string(),
  description: z.string(),
  customRate: z.string().optional(),
  duration: z.number(),
});

const jobRequestSchema = z.object({
  categoryId: z.string().optional(),
  serviceKey: z.string().min(1, "Service is required"),
  profileId: z.string().min(1, "Giger selection is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  budget: z.string().optional(),
  quotedPrice: z.number().positive("Quoted price must be positive"),
  pricingModel: z.enum(["hourly", "fixed", "custom"]),
  duration: z.number().optional(),
  location: z.string().min(1, "Location is required"),
  scheduledFor: z.string().optional(),
});

const bookingSchema = z.object({
  workerId: z.string(),
  listingId: z.string().optional(),
  jobRequestId: z.string().optional(),
  quotedTotal: z.string(),
  duration: z.number(),
  scheduledFor: z.string(),
  location: z.string(),
  notes: z.string().optional(),
});

const reviewLikeSchema = z.object({
  bookingId: z.string().optional(),
  workerId: z.string(),
  rating: z.number().min(1).max(5).default(5),
  comment: z.string().optional(),
});

const messageSchema = z.object({
  bookingId: z.string(),
  content: z.string(),
});

const checkoutIntentSchema = z.object({
  items: z.array(z.object({
    slug: z.string(),
    variantId: z.string().optional(),
    qty: z.number().min(1),
  })),
  email: z.string().email(),
});

const checkoutConfirmSchema = z.object({
  items: z.array(z.object({
    slug: z.string(),
    variantId: z.string().optional(),
    qty: z.number().min(1),
  })),
  email: z.string().email(),
  clientSecret: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user exists
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.createUser({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      });

      // Create worker profile if role is worker
      if (data.role === "worker") {
        await storage.createWorkerProfile({
          userId: user.id,
          skills: [],
          hourlyRate: "25.00",
        });
      }

      // Set session
      (req.session as any).uid = user.id;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("[LOGIN] Request received:", { email: req.body?.email });
      const data = loginSchema.parse(req.body);
      console.log("[LOGIN] Schema validated, looking up user...");

      // Find user
      const user = await storage.getUserByEmail(data.email);
      console.log("[LOGIN] User lookup complete:", user ? "found" : "not found");
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req.session as any).uid = user.id;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("[LOGIN] Error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // User endpoints
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Worker profile endpoints
  app.get("/api/workers/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getWorkerProfile(req.params.userId);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/workers/profile", async (req, res) => {
    try {
      const data = workerProfileSchema.parse(req.body);
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      // Check if profile exists
      const existing = await storage.getWorkerProfile(userId);
      if (existing) {
        const updated = await storage.updateWorkerProfile(existing.id, data);
        return res.json(updated);
      }

      const profile = await storage.createWorkerProfile({
        userId,
        ...data,
      });
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Category endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Services endpoint (for profile setup)
  app.get("/api/services", async (_req, res) => {
    try {
      const serviceInfo = await readServiceInfo();
      res.json(serviceInfo);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Listing endpoints
  app.get("/api/listings", async (req, res) => {
    try {
      const { calculateWorkerGigScore } = await import("./utils/gigScoreAlgorithm");
      const listings = await storage.getAllListings();
      
      // Enrich listings with worker data
      const enrichedListings = await Promise.all(
        listings.map(async (listing) => {
          const workerProfile = await storage.getWorkerProfileById(listing.workerId);
          const reviews = await storage.getReviewsByWorker(listing.workerId);
          
          let user = null;
          if (workerProfile) {
            user = await storage.getUser(workerProfile.userId);
          }
          
          const likeCount = reviews.filter(r => !r.rating || r.rating === 5).length;
          const ratings = reviews.filter(r => r.rating).map(r => r.rating as number);
          const avgRating = ratings.length > 0 
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
            : 0;
          
          const gigScore = workerProfile ? calculateWorkerGigScore({
            avgRating,
            reviewCount: ratings.length,
            completedJobs: workerProfile.completedJobs || 0,
            responseTimeMinutes: workerProfile.responseTimeMinutes,
            cancelledJobs: workerProfile.cancelledJobs || 0,
            repeatClients: workerProfile.repeatClients || 0,
          }) : 0;
          
          return {
            ...listing,
            worker: workerProfile ? {
              ...workerProfile,
              user: user ? { name: user.name, avatar: user.avatar } : null,
              gigScore,
            } : null,
            likeCount,
            avgRating,
            reviewCount: ratings.length,
          };
        })
      );
      
      res.json(enrichedListings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListingById(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.json(listing);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/workers/:id/listings", async (req, res) => {
    try {
      const listings = await storage.getListingsByWorker(req.params.id);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/listings", async (req, res) => {
    try {
      const data = listingSchema.parse(req.body);
      const { workerId } = req.body;

      if (!workerId) {
        return res.status(400).json({ message: "Worker ID required" });
      }

      const listing = await storage.createListing({
        workerId,
        ...data,
      });
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Job request endpoints
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJobRequestById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobRequestsByClient(req.params.id);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const data = jobRequestSchema.parse(req.body);
      const { clientId } = req.body;

      if (!clientId) {
        return res.status(400).json({ message: "Client ID required" });
      }

      // Convert quoted price from cents to decimal budget
      const budget = (data.quotedPrice / 100).toFixed(2);

      const job = await storage.createJobRequest({
        clientId,
        title: data.title,
        duration: data.duration,
        description: data.description || "",
        categoryId: data.categoryId,
        serviceKey: data.serviceKey,
        profileId: data.profileId,
        budget,
        pricingModel: data.pricingModel,
        location: data.location,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      });
      res.json(job);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Booking endpoints
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/bookings/client", async (req, res) => {
    try {
      const bookings = await storage.getBookingsByClient(req.params.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/workers/:id/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookingsByWorker(req.params.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const data = bookingSchema.parse(req.body);
      const { clientId } = req.body;

      if (!clientId) {
        return res.status(400).json({ message: "Client ID required" });
      }

      const booking = await storage.createBooking({
        clientId,
        duration: data.duration,
        location: data.location,
        scheduledFor: new Date(data.scheduledFor),
        workerId: data.workerId,
        quotedTotal: data.quotedTotal,
        listingId: data.listingId,
        jobRequestId: data.jobRequestId,
        notes: data.notes,
      });
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/bookings/:id/accept", async (req, res) => {
    try {
      const booking = await storage.updateBooking(req.params.id, { status: "accepted" });
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/bookings/:id/start", async (req, res) => {
    try {
      const booking = await storage.updateBooking(req.params.id, { status: "in_progress" });
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/bookings/:id/complete", async (req, res) => {
    try {
      const booking = await storage.updateBooking(req.params.id, { status: "completed" });
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/bookings/:id/cancel", async (req, res) => {
    try {
      const booking = await storage.updateBooking(req.params.id, { status: "cancelled" });
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Review/Like endpoints
  app.get("/api/workers/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByWorker(req.params.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const data = reviewLikeSchema.parse(req.body);
      const { clientId } = req.body;

      if (!clientId) {
        return res.status(400).json({ message: "Client ID required" });
      }

      const review = await storage.createReviewLike({
        clientId,
        ...data,
      });
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Message/Chat endpoints
  app.get("/api/bookings/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByBooking(req.params.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const data = messageSchema.parse(req.body);
      const { senderId } = req.body;

      if (!senderId) {
        return res.status(400).json({ message: "Sender ID required" });
      }

      const message = await storage.createMessage({
        senderId,
        ...data,
      });
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payment endpoints (Stripe integration stub)
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured" });
      }

      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Notification endpoints
  app.get("/api/users/:id/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.params.id);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Store: Product endpoints
  app.get("/api/store/products", async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/store/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Store: Checkout endpoints
  app.post("/api/checkout/intent", async (req, res) => {
    try {
      // Require authentication for checkout
      const userId = (req as any).session?.uid;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required for checkout" });
      }

      const data = checkoutIntentSchema.parse(req.body);
      let totalCents = 0;

      for (const item of data.items) {
        const product = await storage.getProductBySlug(item.slug);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.slug} not found` });
        }

        let unitPrice = product.priceCents;
        if (item.variantId) {
          const variant = product.variants.find(v => v.id === item.variantId);
          if (variant) {
            unitPrice = variant.priceCents;
          }
        }
        totalCents += unitPrice * item.qty;
      }

      // Create Stripe payment intent (stub if Stripe not configured)
      let clientSecret = "pi_test_" + Math.random().toString(36).slice(2);
      
      if (stripe) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalCents,
          currency: "usd",
          metadata: { email: data.email },
        });
        clientSecret = paymentIntent.client_secret || clientSecret;
      }

      res.json({ clientSecret, totalCents });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/checkout/confirm", async (req, res) => {
    try {
      // Require authentication for checkout
      const userId = (req as any).session?.uid;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required for checkout" });
      }

      // Validate request body
      const data = checkoutConfirmSchema.parse(req.body);
      
      let totalCents = 0;
      const orderItemsData: any[] = [];

      for (const item of data.items) {
        const product = await storage.getProductBySlug(item.slug);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.slug} not found` });
        }

        let unitPrice = product.priceCents;
        let variantName: string | null = null;
        if (item.variantId) {
          const variant = product.variants.find(v => v.id === item.variantId);
          if (variant) {
            unitPrice = variant.priceCents;
            variantName = variant.name;
          }
        }

        const qty = item.qty || 1;
        const lineTotal = unitPrice * qty;
        totalCents += lineTotal;

        orderItemsData.push({
          productId: product.id,
          variantId: item.variantId || null,
          name: product.name,
          variantName,
          qty,
          unitCents: unitPrice,
          lineCents: lineTotal,
        });
      }

      // Create order
      const order = await storage.createOrder(
        {
          userId,
          email: data.email,
          totalCents,
          status: "paid",
          stripePiId: data.clientSecret,
        },
        orderItemsData
      );

      res.json({ ok: true, orderId: order.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Knowledge Hub: Articles
  app.get("/api/knowledge/articles", async (req, res) => {
    try {
      const cacheKey = "articles:list";
      const cached = getCache(cacheKey);
      
      // Check If-None-Match header
      if (cached && req.headers["if-none-match"] === cached.etag) {
        return res.status(304).end();
      }
      
      // Use cached body if available
      if (cached) {
        res.setHeader("Cache-Control", "public, max-age=60");
        res.setHeader("ETag", cached.etag);
        res.setHeader("Content-Type", "application/json");
        return res.json(cached.body);
      }
      
      // Generate fresh data
      const articles = await storage.getAllArticles();
      
      // Cache for 60 seconds (60000 ms)
      const { etag } = putCache(cacheKey, articles, 60000);
      
      res.setHeader("Cache-Control", "public, max-age=60");
      res.setHeader("ETag", etag);
      res.setHeader("Content-Type", "application/json");
      res.json(articles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/knowledge/articles/:slug", async (req, res) => {
    try {
      const cacheKey = `articles:item:${req.params.slug}`;
      const cached = getCache(cacheKey);
      
      // Check If-None-Match header
      if (cached && req.headers["if-none-match"] === cached.etag) {
        return res.status(304).end();
      }
      
      // Use cached body if available
      if (cached) {
        res.setHeader("Cache-Control", "public, max-age=300");
        res.setHeader("ETag", cached.etag);
        res.setHeader("Content-Type", "application/json");
        return res.json(cached.body);
      }
      
      // Generate fresh data
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Cache for 5 minutes (300000 ms)
      const { etag } = putCache(cacheKey, article, 300000);
      
      res.setHeader("Cache-Control", "public, max-age=300");
      res.setHeader("ETag", etag);
      res.setHeader("Content-Type", "application/json");
      res.json(article);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/knowledge/sections/:section", async (req, res) => {
    try {
      const articles = await storage.getArticlesBySection(req.params.section);
      res.json(articles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Knowledge Hub: Badges
  app.get("/api/knowledge/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/knowledge/my-badges", async (req, res) => {
    try {
      const userId = (req as any).session?.uid;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Knowledge Hub: Progress
  app.get("/api/knowledge/my-progress", async (req, res) => {
    try {
      const userId = (req as any).session?.uid;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/knowledge/complete/:articleId", async (req, res) => {
    try {
      const userId = (req as any).session?.uid;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const progress = await storage.markArticleComplete(userId, req.params.articleId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Service Info: File-based tooltips/popover content (JSON storage)
  app.get("/api/knowledge/services", (req, res) => {
    try {
      const cacheKey = "services:list";
      const cached = getCache(cacheKey);
      
      // Check If-None-Match header
      if (cached && req.headers["if-none-match"] === cached.etag) {
        return res.status(304).end();
      }
      
      // Use cached body if available
      if (cached) {
        res.setHeader("Cache-Control", "public, max-age=300");
        res.setHeader("ETag", cached.etag);
        res.setHeader("Content-Type", "application/json");
        return res.json(cached.body);
      }
      
      // Generate fresh data
      const all = readServiceInfo();
      const summary = all.map((s: any) => ({ 
        key: s.key, 
        label: s.label, 
        summary: s.summary,
        category: s.category,
        badges: s.badges || [] 
      }));
      
      // Cache for 5 minutes (300000 ms)
      const { etag } = putCache(cacheKey, summary, 300000);
      
      res.setHeader("Cache-Control", "public, max-age=300");
      res.setHeader("ETag", etag);
      res.setHeader("Content-Type", "application/json");
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/knowledge/services/:key", (req, res) => {
    try {
      const cacheKey = `services:item:${req.params.key}`;
      const cached = getCache(cacheKey);
      
      // Check If-None-Match header
      if (cached && req.headers["if-none-match"] === cached.etag) {
        return res.status(304).end();
      }
      
      // Use cached body if available
      if (cached) {
        res.setHeader("Cache-Control", "public, max-age=600");
        res.setHeader("ETag", cached.etag);
        res.setHeader("Content-Type", "application/json");
        return res.json(cached.body);
      }
      
      // Generate fresh data
      const all = readServiceInfo();
      const found = all.find((s: any) => s.key === req.params.key);
      if (!found) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Cache for 10 minutes (600000 ms)
      const { etag } = putCache(cacheKey, found, 600000);
      
      res.setHeader("Cache-Control", "public, max-age=600");
      res.setHeader("ETag", etag);
      res.setHeader("Content-Type", "application/json");
      res.json(found);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Current user / ME route
  app.use("/api/me", meRouter);

  // Profile routes
  app.use("/api/profile", profileRouter);

  // Admin routes
  app.use("/api/admin/service-info", adminServiceInfoRouter);
  app.use("/api/admin/analytics", adminAnalyticsRouter);

  // Tracking routes
  app.use("/api/track", trackRouter);

  // Testimonials route
  app.use("/api/testimonials", testimonialsRouter);

  // Community routes
  app.use("/api/community", communityRouter);
  app.use("/api/admin/community", adminCommunityRouter);

  // GigScore routes
  app.use("/api/gigscore", gigscoreRouter);

  const httpServer = createServer(app);
  return httpServer;
}
