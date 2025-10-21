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

    // Get all categories for reference
    const allCategories = await storage.getAllCategories();
    const findCategory = (name: string) => allCategories.find((c) => c.name === name);

    // Create demo client user
    console.log("Creating demo client user...");
    const clientPassword = await bcrypt.hash("password123", 10);
    let client;
    try {
      client = await storage.createUser({
        email: "client@demo.com",
        password: clientPassword,
        name: "Sarah Johnson",
        role: "user",
      });
    } catch (error: any) {
      if (error.code === "23505") {
        client = await storage.getUserByEmail("client@demo.com");
      } else {
        throw error;
      }
    }

    // Create multiple demo workers with listings
    console.log("Creating demo workers and listings...");
    
    const workers = [
      {
        email: "worker@demo.com",
        name: "John Smith",
        bio: "Professional handyman with 10+ years of experience. Specialized in home repairs, plumbing, and electrical work.",
        skills: ["Plumbing", "Electrical", "Carpentry", "Painting"],
        hourlyRate: "50.00",
        listings: [
          {
            category: "Home Repair",
            title: "Professional Home Repair Services",
            description: "I provide expert handyman services including plumbing, electrical work, carpentry, and general home repairs. With over 10 years of experience, I ensure quality workmanship and timely completion.",
            rate: "50.00",
            duration: 120,
          },
        ],
      },
      {
        email: "maria.lawn@demo.com",
        name: "Maria Garcia",
        bio: "Experienced lawn care specialist with a passion for creating beautiful outdoor spaces.",
        skills: ["Lawn Mowing", "Landscaping", "Tree Trimming", "Garden Design"],
        hourlyRate: "35.00",
        listings: [
          {
            category: "Lawn Care",
            title: "Professional Lawn Mowing & Maintenance",
            description: "Keep your lawn looking pristine with regular mowing, edging, and trimming services. I use professional equipment and provide weekly or bi-weekly services.",
            rate: "35.00",
            duration: 90,
          },
        ],
      },
      {
        email: "chef.mike@demo.com",
        name: "Mike Chen",
        bio: "Personal chef with 8 years of culinary experience. Specialized in meal prep and healthy eating plans.",
        skills: ["Meal Prep", "Cooking", "Nutrition Planning", "Catering"],
        hourlyRate: "45.00",
        listings: [
          {
            category: "Meal Prep",
            title: "Weekly Meal Prep Service",
            description: "Healthy, delicious meals prepared fresh for your week. Custom menus based on dietary preferences and restrictions. All ingredients included.",
            rate: "45.00",
            duration: 180,
          },
        ],
      },
      {
        email: "trainer.alex@demo.com",
        name: "Alex Rodriguez",
        bio: "Certified personal trainer helping clients achieve their fitness goals through customized workout plans.",
        skills: ["Personal Training", "Nutrition", "Weight Loss", "Strength Training"],
        hourlyRate: "55.00",
        listings: [
          {
            category: "Personal Training",
            title: "One-on-One Personal Training Sessions",
            description: "Customized fitness programs designed for your goals. Whether you want to lose weight, build muscle, or improve overall health, I'll create the perfect plan for you.",
            rate: "55.00",
            duration: 60,
          },
        ],
      },
      {
        email: "tutor.emma@demo.com",
        name: "Emma Wilson",
        bio: "Math tutor with a Master's degree in Mathematics. Helping students from middle school to college level.",
        skills: ["Math Tutoring", "Algebra", "Calculus", "Test Prep"],
        hourlyRate: "40.00",
        listings: [
          {
            category: "Math Tutoring",
            title: "Expert Math Tutoring - All Levels",
            description: "Struggling with math? I provide patient, effective tutoring for students of all levels. From basic algebra to advanced calculus, I'll help you understand and succeed.",
            rate: "40.00",
            duration: 60,
          },
        ],
      },
      {
        email: "cleaner.lisa@demo.com",
        name: "Lisa Thompson",
        bio: "Professional house cleaner with attention to detail and eco-friendly products.",
        skills: ["House Cleaning", "Deep Cleaning", "Move-in/out Cleaning"],
        hourlyRate: "30.00",
        listings: [
          {
            category: "House Cleaning",
            title: "Thorough House Cleaning Services",
            description: "Make your home sparkle with professional deep cleaning services. I use eco-friendly products and pay attention to every detail. Weekly, bi-weekly, or one-time cleaning available.",
            rate: "30.00",
            duration: 180,
          },
        ],
      },
      {
        email: "plumber.dave@demo.com",
        name: "Dave Martinez",
        bio: "Licensed plumber with 15 years of experience. Available for emergencies and scheduled repairs.",
        skills: ["Plumbing", "Pipe Repair", "Drain Cleaning", "Water Heater"],
        hourlyRate: "65.00",
        listings: [
          {
            category: "Plumbing",
            title: "Licensed Plumbing Services",
            description: "From leaky faucets to major pipe repairs, I handle all plumbing needs. Licensed, insured, and available for emergencies. Fair pricing and quality work guaranteed.",
            rate: "65.00",
            duration: 90,
          },
        ],
      },
      {
        email: "photographer.sarah@demo.com",
        name: "Sarah Kim",
        bio: "Professional photographer specializing in events, portraits, and product photography.",
        skills: ["Photography", "Event Photography", "Portraits", "Editing"],
        hourlyRate: "75.00",
        listings: [
          {
            category: "Photography",
            title: "Professional Event & Portrait Photography",
            description: "Capture your special moments with professional photography services. Weddings, family portraits, corporate events, and more. Includes editing and digital delivery.",
            rate: "75.00",
            duration: 120,
          },
        ],
      },
    ];

    for (const workerData of workers) {
      try {
        let worker;
        try {
          const workerPassword = await bcrypt.hash("password123", 10);
          worker = await storage.createUser({
            email: workerData.email,
            password: workerPassword,
            name: workerData.name,
            role: "worker",
          });
        } catch (error: any) {
          if (error.code === "23505") {
            worker = await storage.getUserByEmail(workerData.email);
          } else {
            throw error;
          }
        }

        if (!worker) continue;

        const workerProfile = await storage.createWorkerProfile({
          userId: worker.id,
          bio: workerData.bio,
          skills: workerData.skills,
          hourlyRate: workerData.hourlyRate,
          responseTimeMinutes: 15,
          verified: true,
        });

        for (const listingData of workerData.listings) {
          const category = findCategory(listingData.category);
          if (category) {
            await storage.createListing({
              workerId: workerProfile.id,
              categoryId: category.id,
              title: listingData.title,
              description: listingData.description,
              customRate: listingData.rate,
              duration: listingData.duration,
              active: true,
            });
          }
        }

        // Create some demo reviews for each worker
        if (client) {
          await storage.createReviewLike({
            workerId: workerProfile.id,
            clientId: client.id,
            rating: 5,
            comment: "Excellent service! Very professional and completed the job quickly.",
          });
        }
      } catch (error: any) {
        console.log(`Skipping worker ${workerData.email}: ${error.message}`);
      }
    }

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
