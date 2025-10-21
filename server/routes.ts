import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { z } from "zod";
import Stripe from "stripe";

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
  categoryId: z.string(),
  title: z.string(),
  description: z.string(),
  budget: z.string(),
  duration: z.number(),
  location: z.string(),
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

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
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

  // Listing endpoints
  app.get("/api/listings", async (req, res) => {
    try {
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
          
          return {
            ...listing,
            worker: workerProfile ? {
              ...workerProfile,
              user: user ? { name: user.name, avatar: user.avatar } : null
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

      const job = await storage.createJobRequest({
        clientId,
        title: data.title,
        duration: data.duration,
        description: data.description,
        categoryId: data.categoryId,
        budget: data.budget,
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

  const httpServer = createServer(app);
  return httpServer;
}
