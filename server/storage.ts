import {
  users,
  workerProfiles,
  serviceCategories,
  serviceListings,
  jobRequests,
  bookings,
  reviewLikes,
  messages,
  notifications,
  products,
  productVariants,
  orders,
  orderItems,
  knowledgeArticles,
  badges,
  userBadges,
  trainingProgress,
  type User,
  type InsertUser,
  type WorkerProfile,
  type InsertWorkerProfile,
  type ServiceCategory,
  type InsertServiceCategory,
  type ServiceListing,
  type InsertServiceListing,
  type JobRequest,
  type InsertJobRequest,
  type Booking,
  type InsertBooking,
  type ReviewLike,
  type InsertReviewLike,
  type Message,
  type InsertMessage,
  type Notification,
  type InsertNotification,
  type Product,
  type InsertProduct,
  type ProductVariant,
  type InsertProductVariant,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type KnowledgeArticle,
  type InsertKnowledgeArticle,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type InsertUserBadge,
  type TrainingProgress,
  type InsertTrainingProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Worker Profiles
  getWorkerProfile(userId: string): Promise<WorkerProfile | undefined>;
  getWorkerProfileById(id: string): Promise<WorkerProfile | undefined>;
  createWorkerProfile(profile: InsertWorkerProfile): Promise<WorkerProfile>;
  updateWorkerProfile(id: string, profile: Partial<InsertWorkerProfile>): Promise<WorkerProfile>;
  
  // Service Categories
  getAllCategories(): Promise<ServiceCategory[]>;
  createCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  
  // Service Listings
  getListingById(id: string): Promise<ServiceListing | undefined>;
  getListingsByWorker(workerId: string): Promise<ServiceListing[]>;
  getAllListings(): Promise<ServiceListing[]>;
  createListing(listing: InsertServiceListing): Promise<ServiceListing>;
  updateListing(id: string, listing: Partial<InsertServiceListing>): Promise<ServiceListing>;
  
  // Job Requests
  getJobRequestById(id: string): Promise<JobRequest | undefined>;
  getJobRequestsByClient(clientId: string): Promise<JobRequest[]>;
  createJobRequest(jobRequest: InsertJobRequest): Promise<JobRequest>;
  
  // Bookings
  getBookingById(id: string): Promise<Booking | undefined>;
  getBookingsByClient(clientId: string): Promise<Booking[]>;
  getBookingsByWorker(workerId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking>;
  
  // Review Likes
  getReviewsByWorker(workerId: string): Promise<ReviewLike[]>;
  createReviewLike(review: InsertReviewLike): Promise<ReviewLike>;
  
  // Messages
  getMessagesByBooking(bookingId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Notifications
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  
  // Store: Products
  getAllProducts(): Promise<(Product & { variants: ProductVariant[] })[]>;
  getProductBySlug(slug: string): Promise<(Product & { variants: ProductVariant[] }) | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  
  // Store: Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order & { items: OrderItem[] }>;
  getOrderById(id: string): Promise<(Order & { items: OrderItem[] }) | undefined>;
  getOrdersByUser(userId: string): Promise<(Order & { items: OrderItem[] })[]>;
  
  // Knowledge Hub: Articles
  getAllArticles(): Promise<KnowledgeArticle[]>;
  getArticlesBySection(section: string): Promise<KnowledgeArticle[]>;
  getArticleBySlug(slug: string): Promise<KnowledgeArticle | undefined>;
  createArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle>;
  
  // Knowledge Hub: Badges
  getAllBadges(): Promise<Badge[]>;
  getBadgeByType(type: string): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // Knowledge Hub: User Badges
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  
  // Knowledge Hub: Training Progress
  getUserProgress(userId: string): Promise<TrainingProgress[]>;
  getArticleProgress(userId: string, articleId: string): Promise<TrainingProgress | undefined>;
  markArticleComplete(userId: string, articleId: string): Promise<TrainingProgress>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Worker Profiles
  async getWorkerProfile(userId: string): Promise<WorkerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(workerProfiles)
      .where(eq(workerProfiles.userId, userId));
    return profile || undefined;
  }

  async getWorkerProfileById(id: string): Promise<WorkerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(workerProfiles)
      .where(eq(workerProfiles.id, id));
    return profile || undefined;
  }

  async createWorkerProfile(insertProfile: InsertWorkerProfile): Promise<WorkerProfile> {
    const [profile] = await db
      .insert(workerProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async updateWorkerProfile(
    id: string,
    profile: Partial<InsertWorkerProfile>
  ): Promise<WorkerProfile> {
    const [updated] = await db
      .update(workerProfiles)
      .set(profile)
      .where(eq(workerProfiles.id, id))
      .returning();
    return updated;
  }

  // Service Categories
  async getAllCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories).orderBy(serviceCategories.name);
  }

  async createCategory(insertCategory: InsertServiceCategory): Promise<ServiceCategory> {
    const [category] = await db
      .insert(serviceCategories)
      .values(insertCategory)
      .returning();
    return category;
  }

  // Service Listings
  async getListingById(id: string): Promise<ServiceListing | undefined> {
    const [listing] = await db
      .select()
      .from(serviceListings)
      .where(eq(serviceListings.id, id));
    return listing || undefined;
  }

  async getListingsByWorker(workerId: string): Promise<ServiceListing[]> {
    return await db
      .select()
      .from(serviceListings)
      .where(eq(serviceListings.workerId, workerId));
  }

  async getAllListings(): Promise<ServiceListing[]> {
    return await db
      .select()
      .from(serviceListings)
      .where(eq(serviceListings.active, true))
      .orderBy(desc(serviceListings.createdAt));
  }

  async createListing(insertListing: InsertServiceListing): Promise<ServiceListing> {
    const [listing] = await db
      .insert(serviceListings)
      .values(insertListing)
      .returning();
    return listing;
  }

  async updateListing(
    id: string,
    listing: Partial<InsertServiceListing>
  ): Promise<ServiceListing> {
    const [updated] = await db
      .update(serviceListings)
      .set({ ...listing, updatedAt: new Date() })
      .where(eq(serviceListings.id, id))
      .returning();
    return updated;
  }

  // Job Requests
  async getJobRequestById(id: string): Promise<JobRequest | undefined> {
    const [jobRequest] = await db
      .select()
      .from(jobRequests)
      .where(eq(jobRequests.id, id));
    return jobRequest || undefined;
  }

  async getJobRequestsByClient(clientId: string): Promise<JobRequest[]> {
    return await db
      .select()
      .from(jobRequests)
      .where(eq(jobRequests.clientId, clientId))
      .orderBy(desc(jobRequests.createdAt));
  }

  async createJobRequest(insertJobRequest: InsertJobRequest): Promise<JobRequest> {
    const [jobRequest] = await db
      .insert(jobRequests)
      .values(insertJobRequest)
      .returning();
    return jobRequest;
  }

  // Bookings
  async getBookingById(id: string): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByClient(clientId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.clientId, clientId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByWorker(workerId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.workerId, workerId))
      .orderBy(desc(bookings.createdAt));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updated] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  // Review Likes
  async getReviewsByWorker(workerId: string): Promise<ReviewLike[]> {
    return await db
      .select()
      .from(reviewLikes)
      .where(eq(reviewLikes.workerId, workerId))
      .orderBy(desc(reviewLikes.createdAt));
  }

  async createReviewLike(insertReview: InsertReviewLike): Promise<ReviewLike> {
    const [review] = await db
      .insert(reviewLikes)
      .values(insertReview)
      .returning();
    return review;
  }

  // Messages
  async getMessagesByBooking(bookingId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.bookingId, bookingId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Notifications
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  // Store: Products
  async getAllProducts(): Promise<(Product & { variants: ProductVariant[] })[]> {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.active, true))
      .orderBy(desc(products.createdAt));
    
    const productsWithVariants = await Promise.all(
      result.map(async (product) => {
        const variants = await db
          .select()
          .from(productVariants)
          .where(and(
            eq(productVariants.productId, product.id),
            eq(productVariants.active, true)
          ))
          .orderBy(productVariants.name);
        return { ...product, variants };
      })
    );
    
    return productsWithVariants;
  }

  async getProductBySlug(slug: string): Promise<(Product & { variants: ProductVariant[] }) | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug));
    
    if (!product) return undefined;
    
    const variants = await db
      .select()
      .from(productVariants)
      .where(and(
        eq(productVariants.productId, product.id),
        eq(productVariants.active, true)
      ))
      .orderBy(productVariants.name);
    
    return { ...product, variants };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async createProductVariant(insertVariant: InsertProductVariant): Promise<ProductVariant> {
    const [variant] = await db.insert(productVariants).values(insertVariant).returning();
    return variant;
  }

  // Store: Orders
  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order & { items: OrderItem[] }> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    
    const createdItems = await db
      .insert(orderItems)
      .values(items.map(item => ({ ...item, orderId: order.id })))
      .returning();
    
    return { ...order, items: createdItems };
  }

  async getOrderById(id: string): Promise<(Order & { items: OrderItem[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...order, items };
  }

  async getOrdersByUser(userId: string): Promise<(Order & { items: OrderItem[] })[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );
    
    return ordersWithItems;
  }

  // Knowledge Hub: Articles
  async getAllArticles(): Promise<KnowledgeArticle[]> {
    return await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.published, true))
      .orderBy(knowledgeArticles.section, knowledgeArticles.order);
  }

  async getArticlesBySection(section: string): Promise<KnowledgeArticle[]> {
    return await db
      .select()
      .from(knowledgeArticles)
      .where(and(
        eq(knowledgeArticles.section, section as any),
        eq(knowledgeArticles.published, true)
      ))
      .orderBy(knowledgeArticles.order);
  }

  async getArticleBySlug(slug: string): Promise<KnowledgeArticle | undefined> {
    const [article] = await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.slug, slug));
    return article || undefined;
  }

  async createArticle(insertArticle: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const [article] = await db
      .insert(knowledgeArticles)
      .values(insertArticle)
      .returning();
    return article;
  }

  // Knowledge Hub: Badges
  async getAllBadges(): Promise<Badge[]> {
    return await db
      .select()
      .from(badges)
      .orderBy(badges.order);
  }

  async getBadgeByType(type: string): Promise<Badge | undefined> {
    const [badge] = await db
      .select()
      .from(badges)
      .where(eq(badges.type, type as any));
    return badge || undefined;
  }

  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const [badge] = await db
      .insert(badges)
      .values(insertBadge)
      .returning();
    return badge;
  }

  // Knowledge Hub: User Badges
  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    const result = await db
      .select({
        id: userBadges.id,
        userId: userBadges.userId,
        badgeId: userBadges.badgeId,
        earnedAt: userBadges.earnedAt,
        badge: badges,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
    
    return result as (UserBadge & { badge: Badge })[];
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const [userBadge] = await db
      .insert(userBadges)
      .values({ userId, badgeId })
      .returning();
    return userBadge;
  }

  // Knowledge Hub: Training Progress
  async getUserProgress(userId: string): Promise<TrainingProgress[]> {
    return await db
      .select()
      .from(trainingProgress)
      .where(eq(trainingProgress.userId, userId))
      .orderBy(desc(trainingProgress.createdAt));
  }

  async getArticleProgress(userId: string, articleId: string): Promise<TrainingProgress | undefined> {
    const [progress] = await db
      .select()
      .from(trainingProgress)
      .where(and(
        eq(trainingProgress.userId, userId),
        eq(trainingProgress.articleId, articleId)
      ));
    return progress || undefined;
  }

  async markArticleComplete(userId: string, articleId: string): Promise<TrainingProgress> {
    // Check if progress exists
    const existing = await this.getArticleProgress(userId, articleId);
    
    if (existing) {
      // Update existing progress
      const [updated] = await db
        .update(trainingProgress)
        .set({ completed: true, completedAt: new Date() })
        .where(eq(trainingProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new progress entry
      const [created] = await db
        .insert(trainingProgress)
        .values({
          userId,
          articleId,
          completed: true,
          completedAt: new Date(),
        })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
