import { db } from "../db";
import { topics } from "@shared/schema";
import { eq } from "drizzle-orm";

const topicsData = [
  { key: "ideas", name: "Ideas" },
  { key: "service-tips", name: "Service Tips" },
  { key: "show-tell", name: "Show & Tell" },
  { key: "neighborhood", name: "Neighborhood" }
];

async function seedTopics() {
  console.log("🌱 Seeding topics...");

  for (const topic of topicsData) {
    const existing = await db.select().from(topics).where(eq(topics.key, topic.key)).limit(1);
    
    if (existing.length === 0) {
      await db.insert(topics).values(topic);
      console.log(`✓ Created topic: ${topic.name}`);
    } else {
      console.log(`- Topic already exists: ${topic.name}`);
    }
  }

  console.log("✅ Topics seeding complete");
}

seedTopics()
  .catch((err) => {
    console.error("Error seeding topics:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
