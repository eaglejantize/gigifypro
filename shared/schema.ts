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
