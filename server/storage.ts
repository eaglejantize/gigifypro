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
}

export const storage = new DatabaseStorage();
