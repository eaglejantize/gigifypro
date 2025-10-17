import { db } from "./db";
import { storage } from "./storage";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create service categories
    console.log("Creating categories...");
    const categories = [
      {
        name: "Home Repair",
        description: "Handyman services, plumbing, electrical",
        icon: "wrench",
      },
      {
        name: "House Cleaning",
        description: "Professional cleaning services",
        icon: "home",
      },
      {
        name: "Personal Chef",
        description: "Meal preparation and catering",
        icon: "chef-hat",
      },
      {
        name: "Fitness Training",
        description: "Personal training and fitness coaching",
        icon: "dumbbell",
      },
      {
        name: "Lawn Care",
        description: "Lawn mowing and landscaping",
        icon: "scissors",
      },
      {
        name: "Childcare",
        description: "Babysitting and nanny services",
        icon: "baby",
      },
      {
        name: "Pet Care",
        description: "Dog walking and pet sitting",
        icon: "dog",
      },
      {
        name: "Tutoring",
        description: "Academic tutoring and lessons",
        icon: "book",
      },
    ];

    for (const category of categories) {
      await storage.createCategory(category);
    }

    // Create demo client user
    console.log("Creating demo client user...");
    const clientPassword = await bcrypt.hash("password123", 10);
    const client = await storage.createUser({
      email: "client@demo.com",
      password: clientPassword,
      name: "Sarah Johnson",
      role: "user",
    });

    // Create demo worker user
    console.log("Creating demo worker user...");
    const workerPassword = await bcrypt.hash("password123", 10);
    const worker = await storage.createUser({
      email: "worker@demo.com",
      password: workerPassword,
      name: "John Smith",
      role: "worker",
    });

    // Create worker profile
    console.log("Creating worker profile...");
    const workerProfile = await storage.createWorkerProfile({
      userId: worker.id,
      bio: "Professional handyman with 10+ years of experience. Specialized in home repairs, plumbing, and electrical work.",
      skills: ["Plumbing", "Electrical", "Carpentry", "Painting", "General Repairs"],
      hourlyRate: "50.00",
      responseTimeMinutes: 15,
      verified: true,
    });

    // Create a demo service listing
    console.log("Creating demo listing...");
    const homeRepairCategory = await storage.getAllCategories();
    const homeRepair = homeRepairCategory.find((c) => c.name === "Home Repair");

    if (homeRepair) {
      await storage.createListing({
        workerId: workerProfile.id,
        categoryId: homeRepair.id,
        title: "Professional Home Repair Services",
        description:
          "I provide expert handyman services including plumbing, electrical work, carpentry, and general home repairs. With over 10 years of experience, I ensure quality workmanship and timely completion.",
        customRate: "50.00",
        duration: 120,
        active: true,
      });
    }

    // Create some demo reviews
    console.log("Creating demo reviews...");
    await storage.createReviewLike({
      workerId: workerProfile.id,
      clientId: client.id,
      rating: 5,
      comment: "Excellent work! Very professional and completed the job quickly.",
    });

    await storage.createReviewLike({
      workerId: workerProfile.id,
      clientId: client.id,
      rating: 5,
      comment: "Fixed my plumbing issue perfectly. Highly recommend!",
    });

    console.log("✅ Database seeded successfully!");
    console.log("\n📝 Demo Credentials:");
    console.log("Client - Email: client@demo.com, Password: password123");
    console.log("Worker - Email: worker@demo.com, Password: password123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
