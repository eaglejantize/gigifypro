import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "worker", "admin"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "requested",
  "accepted",
  "in_progress",
  "completed",
  "cancelled"
]);
export const productCategoryEnum = pgEnum("product_category", ["shirt", "hat", "car_sign", "gear"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "cancelled"]);
export const knowledgeSectionEnum = pgEnum("knowledge_section", [
  "getting_started",
  "safety_compliance",
  "skill_builder",
  "customer_service",
  "local_law",
  "insurance_financial"
]);
export const badgeTypeEnum = pgEnum("badge_type", [
  "verified_identity",
  "business_ready",
  "safety_verified",
  "ambassador",
  "lawncare_basics",
  "culinary_safety",
  "shopper_pro",
  "handy_essentials",
  "companion_care"
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Worker profiles
export const workerProfiles = pgTable("worker_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  skills: text("skills").array().notNull().default(sql`ARRAY[]::text[]`),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull().default("25.00"),
  responseTimeMinutes: integer("response_time_minutes").default(60),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Service categories
export const serviceCategories = pgTable("service_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Service listings
export const serviceListings = pgTable("service_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workerId: varchar("worker_id").notNull().references(() => workerProfiles.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").notNull().references(() => serviceCategories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  customRate: decimal("custom_rate", { precision: 10, scale: 2 }),
  duration: integer("duration").notNull(),
  images: text("images").array().default(sql`ARRAY[]::text[]`),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Job requests
export const jobRequests = pgTable("job_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").notNull().references(() => serviceCategories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  location: text("location").notNull(),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Bookings
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workerProfiles.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id").references(() => serviceListings.id),
  jobRequestId: varchar("job_request_id").references(() => jobRequests.id),
  status: bookingStatusEnum("status").notNull().default("requested"),
  quotedTotal: decimal("quoted_total", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  location: text("location").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Reviews and likes
export const reviewLikes = pgTable("review_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workerProfiles.id, { onDelete: "cascade" }),
  clientId: varchar("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull().default(5),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  read: boolean("read").notNull().default(false),
  link: text("link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Store: Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  category: productCategoryEnum("category").notNull(),
  priceCents: integer("price_cents").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Store: Product Variants
export const productVariants = pgTable("product_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  sku: text("sku").notNull().unique(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Store: Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  totalCents: integer("total_cents").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  stripePiId: text("stripe_pi_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Store: Order Items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id),
  variantId: varchar("variant_id").references(() => productVariants.id),
  name: text("name").notNull(),
  variantName: text("variant_name"),
  qty: integer("qty").notNull(),
  unitCents: integer("unit_cents").notNull(),
  lineCents: integer("line_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Knowledge Hub: Articles
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  section: knowledgeSectionEnum("section").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  icon: text("icon"),
  readTimeMinutes: integer("read_time_minutes").notNull().default(5),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Knowledge Hub: Badges
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: badgeTypeEnum("type").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull().default("#3b82f6"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Knowledge Hub: User Badges (earned badges)
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: varchar("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

// Knowledge Hub: Training Progress
export const trainingProgress = pgTable("training_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  articleId: varchar("article_id").notNull().references(() => knowledgeArticles.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Analytics: Events
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  kind: text("kind").notNull(), // page_view, service_view, knowledge_view, cta_click
  name: text("name"), // service key, article slug, CTA name
  path: text("path"),
  meta: text("meta"), // JSON string
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  workerProfile: one(workerProfiles, {
    fields: [users.id],
    references: [workerProfiles.userId],
  }),
  jobRequests: many(jobRequests),
  clientBookings: many(bookings, { relationName: "clientBookings" }),
  sentMessages: many(messages),
  notifications: many(notifications),
  reviewsGiven: many(reviewLikes),
  badges: many(userBadges),
  trainingProgress: many(trainingProgress),
}));

export const workerProfilesRelations = relations(workerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [workerProfiles.userId],
    references: [users.id],
  }),
  listings: many(serviceListings),
  bookings: many(bookings),
  reviews: many(reviewLikes),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  listings: many(serviceListings),
  jobRequests: many(jobRequests),
}));

export const serviceListingsRelations = relations(serviceListings, ({ one, many }) => ({
  worker: one(workerProfiles, {
    fields: [serviceListings.workerId],
    references: [workerProfiles.id],
  }),
  category: one(serviceCategories, {
    fields: [serviceListings.categoryId],
    references: [serviceCategories.id],
  }),
  bookings: many(bookings),
}));

export const jobRequestsRelations = relations(jobRequests, ({ one, many }) => ({
  client: one(users, {
    fields: [jobRequests.clientId],
    references: [users.id],
  }),
  category: one(serviceCategories, {
    fields: [jobRequests.categoryId],
    references: [serviceCategories.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  client: one(users, {
    fields: [bookings.clientId],
    references: [users.id],
  }),
  worker: one(workerProfiles, {
    fields: [bookings.workerId],
    references: [workerProfiles.id],
  }),
  listing: one(serviceListings, {
    fields: [bookings.listingId],
    references: [serviceListings.id],
  }),
  jobRequest: one(jobRequests, {
    fields: [bookings.jobRequestId],
    references: [jobRequests.id],
  }),
  messages: many(messages),
  review: one(reviewLikes),
}));

export const reviewLikesRelations = relations(reviewLikes, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviewLikes.bookingId],
    references: [bookings.id],
  }),
  worker: one(workerProfiles, {
    fields: [reviewLikes.workerId],
    references: [workerProfiles.id],
  }),
  client: one(users, {
    fields: [reviewLikes.clientId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  booking: one(bookings, {
    fields: [messages.bookingId],
    references: [bookings.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
  orderItems: many(orderItems),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const knowledgeArticlesRelations = relations(knowledgeArticles, ({ many }) => ({
  progress: many(trainingProgress),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const trainingProgressRelations = relations(trainingProgress, ({ one }) => ({
  user: one(users, {
    fields: [trainingProgress.userId],
    references: [users.id],
  }),
  article: one(knowledgeArticles, {
    fields: [trainingProgress.articleId],
    references: [knowledgeArticles.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWorkerProfileSchema = createInsertSchema(workerProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
  createdAt: true,
});

export const insertServiceListingSchema = createInsertSchema(serviceListings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobRequestSchema = createInsertSchema(jobRequests).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewLikeSchema = createInsertSchema(reviewLikes).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertProductVariantSchema = createInsertSchema(productVariants).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertTrainingProgressSchema = createInsertSchema(trainingProgress).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WorkerProfile = typeof workerProfiles.$inferSelect;
export type InsertWorkerProfile = z.infer<typeof insertWorkerProfileSchema>;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;

export type ServiceListing = typeof serviceListings.$inferSelect;
export type InsertServiceListing = z.infer<typeof insertServiceListingSchema>;

export type JobRequest = typeof jobRequests.$inferSelect;
export type InsertJobRequest = z.infer<typeof insertJobRequestSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type ReviewLike = typeof reviewLikes.$inferSelect;
export type InsertReviewLike = z.infer<typeof insertReviewLikeSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertKnowledgeArticle = z.infer<typeof insertKnowledgeArticleSchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

export type TrainingProgress = typeof trainingProgress.$inferSelect;
export type InsertTrainingProgress = z.infer<typeof insertTrainingProgressSchema>;
