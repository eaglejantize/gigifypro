import { db } from "./db";
import { storage } from "./storage";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create service categories
    console.log("Creating categories...");
    const categories = [
      // Popular Categories
      { name: "Home Repair", description: "Expert handymen", icon: "wrench" },
      { name: "Personal Chef", description: "Meal preparation", icon: "chef-hat" },
      { name: "Fitness Training", description: "Get in shape", icon: "dumbbell" },
      { name: "House Cleaning", description: "Spotless homes", icon: "home" },

      // Home & Property
      { name: "Appliance Repair", description: "Fix appliances", icon: "wrench" },
      { name: "Electrical Services", description: "Licensed electricians", icon: "zap" },
      { name: "Plumbing", description: "Plumbing repairs and installation", icon: "droplet" },
      { name: "HVAC / Heating & Cooling", description: "Climate control experts", icon: "thermometer" },
      { name: "Painting & Decor", description: "Interior and exterior painting", icon: "paintbrush" },
      { name: "Roofing & Gutters", description: "Roof repair and maintenance", icon: "home" },
      { name: "Flooring & Tiling", description: "Floor installation and repair", icon: "square" },
      { name: "Landscaping & Yard Work", description: "Lawn care and gardening", icon: "tree-pine" },
      { name: "Pest Control", description: "Pest removal services", icon: "bug" },
      { name: "Pool Maintenance", description: "Pool cleaning and repair", icon: "waves" },
      { name: "Moving Help", description: "Packing and moving assistance", icon: "truck" },
      { name: "Furniture Assembly", description: "Assemble your furniture", icon: "package" },
      { name: "Smart Home Installation", description: "Install smart devices", icon: "home" },
      { name: "Carpet & Upholstery Cleaning", description: "Deep cleaning services", icon: "sparkles" },
      { name: "Interior Design", description: "Professional design services", icon: "palette" },

      // Personal & Wellness
      { name: "Massage Therapy", description: "Therapeutic massage", icon: "hand" },
      { name: "Hair Styling / Barber", description: "Hair cuts and styling", icon: "scissors" },
      { name: "Makeup Artist", description: "Professional makeup", icon: "sparkles" },
      { name: "Nail Technician", description: "Manicure and pedicure", icon: "hand" },
      { name: "Yoga Instruction", description: "Personal yoga sessions", icon: "activity" },
      { name: "Nutrition Coaching", description: "Diet and nutrition planning", icon: "apple" },
      { name: "Life Coaching", description: "Personal development", icon: "target" },

      // Automotive
      { name: "Car Detailing", description: "Professional car cleaning", icon: "car" },
      { name: "Mobile Mechanic", description: "On-site car repair", icon: "wrench" },
      { name: "Tire Service", description: "Tire replacement and repair", icon: "circle" },
      { name: "Car Wash / Wax", description: "Wash and wax services", icon: "droplet" },

      // Business & Technology
      { name: "Web Design", description: "Website creation", icon: "globe" },
      { name: "Graphic Design", description: "Logo and graphic design", icon: "palette" },
      { name: "Copywriting", description: "Professional writing", icon: "file-text" },
      { name: "Virtual Assistant", description: "Remote administrative help", icon: "user" },
      { name: "Bookkeeping & Taxes", description: "Financial services", icon: "calculator" },
      { name: "Social Media Management", description: "Social media marketing", icon: "share-2" },
      { name: "Photography / Videography", description: "Photo and video services", icon: "camera" },
      { name: "Computer Repair", description: "Fix computers and laptops", icon: "laptop" },
      { name: "IT Support", description: "Technical support", icon: "monitor" },

      // Education & Training
      { name: "Tutoring (K-12 / College)", description: "Academic tutoring", icon: "book" },
      { name: "Language Lessons", description: "Learn a new language", icon: "message-circle" },
      { name: "Music Lessons", description: "Instrument instruction", icon: "music" },
      { name: "Test Prep (SAT, GED, etc.)", description: "Test preparation", icon: "file-check" },
      { name: "Professional Development", description: "Career coaching", icon: "briefcase" },

      // Events & Entertainment
      { name: "DJ Services", description: "Event DJ and music", icon: "music" },
      { name: "Event Planner", description: "Plan your events", icon: "calendar" },
      { name: "Catering", description: "Food catering services", icon: "utensils" },
      { name: "Bartending", description: "Professional bartenders", icon: "glass-water" },
      { name: "Party Rentals", description: "Equipment rental", icon: "package" },
      { name: "Live Musicians", description: "Live music performance", icon: "music" },
      { name: "Balloon & Decor", description: "Party decorations", icon: "gift" },

      // Pet Services
      { name: "Dog Walking", description: "Walk your dog", icon: "dog" },
      { name: "Pet Grooming", description: "Pet washing and grooming", icon: "scissors" },
      { name: "Pet Sitting", description: "In-home pet care", icon: "home" },
      { name: "Pet Training", description: "Train your pet", icon: "zap" },

      // Transportation
      { name: "Rideshare / Driver", description: "Personal driver services", icon: "car" },
      { name: "Courier Delivery", description: "Package delivery", icon: "package" },
      { name: "Moving Truck Rental", description: "Rent moving trucks", icon: "truck" },

      // Other
      { name: "Errand Runner", description: "Run errands for you", icon: "map-pin" },
      { name: "Senior Care / Companionship", description: "Elder care services", icon: "heart" },
      { name: "Child Care / Babysitting", description: "Babysitting services", icon: "baby" },
      { name: "Laundry Service", description: "Wash and fold", icon: "shirt" },
      { name: "Custom Requests", description: "Other services", icon: "sparkles" },
    ];

    for (const category of categories) {
      try {
        await storage.createCategory(category);
      } catch (error: any) {
        // Skip if category already exists (duplicate key error)
        if (error.code !== "23505") {
          throw error;
        }
      }
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
