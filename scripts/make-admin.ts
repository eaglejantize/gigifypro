#!/usr/bin/env tsx
/**
 * Script to promote a user to admin role
 * Usage: npx tsx scripts/make-admin.ts <email>
 * Example: npx tsx scripts/make-admin.ts admin@example.com
 */

import { storage } from "../server/storage";

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("❌ Error: Email required");
    console.log("Usage: npx tsx scripts/make-admin.ts <email>");
    console.log("Example: npx tsx scripts/make-admin.ts admin@example.com");
    process.exit(1);
  }

  try {
    // Find user by email
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found`);
      process.exit(1);
    }

    // Check if already admin
    if (user.role === "admin") {
      console.log(`✅ User "${email}" is already an admin`);
      process.exit(0);
    }

    // Update user role to admin
    await storage.updateUser(user.id, { role: "admin" });
    
    console.log(`✅ Successfully promoted "${email}" to admin role`);
    console.log(`User ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error promoting user:", error);
    process.exit(1);
  }
}

makeAdmin();
