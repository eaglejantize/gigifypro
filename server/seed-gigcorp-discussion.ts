import { db } from "./db";
import { users, posts, comments, topics } from "@shared/schema";
import { eq } from "drizzle-orm";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

async function seedGigCorpDiscussion() {
  console.log("🔥 Seeding G-Square with GigCorp community discussion...\n");

  // Helper to convert markdown to HTML
  const mdToHtml = (md: string): string => {
    const rawHtml = marked.parse(md, { async: false }) as string;
    return DOMPurify.sanitize(rawHtml);
  };

  // 1. Ensure community topic exists
  console.log("📋 Checking topics...");
  let communityTopic = await db.query.topics.findFirst({
    where: eq(topics.key, "community"),
  });

  if (!communityTopic) {
    const [topic] = await db.insert(topics).values({
      key: "community",
      name: "Community",
    }).returning();
    communityTopic = topic;
    console.log("  ✓ Created 'Community' topic");
  } else {
    console.log("  ✓ Topic 'Community' already exists");
  }

  // 2. Create users for the discussion
  console.log("\n👥 Creating discussion participants...");
  
  const userProfiles = [
    { username: "TeamGigify", fullName: "Team Gigify", email: "team@gigifypro.com" },
    { username: "ChefDee", fullName: "Chef Dee", email: "chef.dee@example.com" },
    { username: "FixItFred", fullName: "Fred the Fixer", email: "fred@example.com" },
    { username: "TechTasha", fullName: "Tasha Tech", email: "tasha@example.com" },
    { username: "SkepticalSam", fullName: "Sam the Skeptic", email: "sam@example.com" },
    { username: "JoyTheCleaner", fullName: "Joy Clean", email: "joy@example.com" },
    { username: "TrainerTom", fullName: "Tom Trainer", email: "tom@example.com" },
    { username: "PhotoPhil", fullName: "Phil Photography", email: "phil@example.com" },
    { username: "NannyNia", fullName: "Nia Nanny", email: "nia@example.com" },
    { username: "ArtByLuna", fullName: "Luna Artist", email: "luna@example.com" },
    { username: "DeliveryDan", fullName: "Dan Delivery", email: "dan@example.com" },
    { username: "HandyHannah", fullName: "Hannah Handy", email: "hannah@example.com" },
    { username: "DataDave", fullName: "Dave Data", email: "dave@example.com" },
    { username: "GreenThumbGary", fullName: "Gary Green", email: "gary@example.com" },
    { username: "SupportSue", fullName: "Sue Support", email: "sue@example.com" },
    { username: "Admin-Maya", fullName: "Maya Admin", email: "maya@gigifypro.com" },
    { username: "Moderator-Leo", fullName: "Leo Moderator", email: "leo@gigifypro.com" },
  ];

  const userMap = new Map<string, string>();

  for (const profile of userProfiles) {
    let user = await db.query.users.findFirst({
      where: eq(users.email, profile.email),
    });

    if (!user) {
      const [newUser] = await db.insert(users).values({
        name: profile.fullName,
        email: profile.email,
        password: "hashed_password_placeholder",
        role: profile.username.includes("Admin") || profile.username.includes("Moderator") ? "admin" : "user",
      }).returning();
      user = newUser;
      console.log(`  ✓ Created user: ${profile.username}`);
    } else {
      console.log(`  ✓ User ${profile.username} already exists`);
    }

    userMap.set(profile.username, user.id);
  }

  // 3. Create the main GigCorp post
  console.log("\n📝 Creating main GigCorp post...");
  
  const teamGigifyId = userMap.get("TeamGigify")!;
  
  // Random date within past 7 days
  const daysAgo = Math.floor(Math.random() * 7);
  const postDate = new Date();
  postDate.setDate(postDate.getDate() - daysAgo);

  const postContent = `Hey GigifyFam!

Ever notice how some jobs need *more than one pair of hands*? Imagine five verified gigers—say a chef, decorator, photographer, driver, and cleaner—joining forces as one "GigCorp."

Each keeps their own independence, but together they handle big events, corporate gigs, or property contracts.  
Revenue splits automatically, every member keeps badges and reputation.

We're calling this next evolution of the platform the **GigCorp Initiative** — where small teams form big opportunities.

Would you join one? What kind of team would you build?`;

  const [gigcorpPost] = await db.insert(posts).values({
    authorId: teamGigifyId,
    topicId: communityTopic.id,
    title: "What if GigifyPros teamed up? Introducing the idea of the GigCorp",
    bodyMd: postContent,
    bodyHtml: mdToHtml(postContent),
    hashtags: ["community", "gigcorp", "collaboration"],
    visibility: "NATIONAL",
    score: 45,
    views: 287,
    createdAt: postDate,
  }).returning();

  console.log(`  ✓ Created post: "${gigcorpPost.title}"`);
  console.log(`  ✓ Post ID: ${gigcorpPost.id}`);

  // 4. Create 18 comments
  console.log("\n💬 Creating comments...");

  const commentData = [
    {
      username: "ChefDee",
      text: "I'd totally form a Meal-Prep × Event Team! Picture us rolling up with matching aprons and our own playlist",
      minutesAfter: 15,
    },
    {
      username: "FixItFred",
      text: "As a handyman I already pair up with a cleaner and a lawn guy. We jokingly call ourselves the Home Avengers 😂",
      minutesAfter: 22,
    },
    {
      username: "TechTasha",
      text: "Could GigCorps work online too? Like designers + copywriters teaming up for product launches?",
      minutesAfter: 45,
    },
    {
      username: "SkepticalSam",
      text: "Sounds great until someone ghosts halfway through the project. How will accountability work?",
      minutesAfter: 67,
    },
    {
      username: "TeamGigify",
      text: "Good point Sam — GigCorp dashboards will track tasks and auto-release payments only when all milestones hit ✅",
      minutesAfter: 73,
    },
    {
      username: "JoyTheCleaner",
      text: "I love it. I always wanted to take on office cleaning contracts but needed more people. Count me in!",
      minutesAfter: 95,
    },
    {
      username: "TrainerTom",
      text: "Gym + meal prep + massage = wellness GigCorp. Clients would love bundled service discounts.",
      minutesAfter: 120,
    },
    {
      username: "PhotoPhil",
      text: "Already imagining our team photos with the G-Pro jackets 📸",
      minutesAfter: 145,
    },
    {
      username: "NannyNia",
      text: "If childcare GigCorps become a thing, please make sure background checks stay mandatory. Safety first.",
      minutesAfter: 180,
    },
    {
      username: "ArtByLuna",
      text: "Artists could team up too! Custom murals + furniture refurbish + decor staging = dream house vibes.",
      minutesAfter: 210,
    },
    {
      username: "DeliveryDan",
      text: "Who's building the Transport GigCorp? Airport runs, food delivery, courier gigs… we could dominate a city.",
      minutesAfter: 245,
    },
    {
      username: "HandyHannah",
      text: "My last job took 3 days solo. With a GigCorp, it'd be 1 day + pizza break.",
      minutesAfter: 280,
    },
    {
      username: "DataDave",
      text: "Real talk: this model could evolve into micro-franchises. GigifyPro becomes a platform for business ownership.",
      minutesAfter: 315,
    },
    {
      username: "GreenThumbGary",
      text: "I'd start the Lawn & Landscaping Corp — bring your own mower, get Gigified together 🌱",
      minutesAfter: 350,
    },
    {
      username: "SupportSue",
      text: "It's inspiring watching everyone brainstorm. This community is the reason I joined. Let's make it happen!",
      minutesAfter: 390,
    },
    {
      username: "ChefDee",
      text: "@SkepticalSam don't worry, you'll be the official project manager 😂",
      minutesAfter: 420,
    },
    {
      username: "Admin-Maya",
      text: "Reminder: anyone interested in beta-testing GigCorp features can DM @TeamGigify to join the pilot list 🙌",
      minutesAfter: 480,
    },
    {
      username: "Moderator-Leo",
      text: "Thread locked for now to compile feedback — love the ideas, folks! Next community meetup topic: *'From Solo to Team'.*",
      minutesAfter: 540,
    },
  ];

  let commentCount = 0;
  for (const commentInfo of commentData) {
    const authorId = userMap.get(commentInfo.username);
    if (!authorId) {
      console.log(`  ⚠ Skipping comment from ${commentInfo.username} - user not found`);
      continue;
    }

    const commentDate = new Date(postDate.getTime() + commentInfo.minutesAfter * 60 * 1000);
    const score = Math.floor(Math.random() * 15) + 2; // Random score 2-16

    await db.insert(comments).values({
      postId: gigcorpPost.id,
      authorId: authorId,
      bodyMd: commentInfo.text,
      bodyHtml: mdToHtml(commentInfo.text),
      score: score,
      createdAt: commentDate,
      updatedAt: commentDate,
    });

    commentCount++;
    console.log(`  ✓ Comment ${commentCount}/18 by ${commentInfo.username}`);
  }

  console.log("\n✅ G-Square seeded with GigCorp community story");
  console.log(`   Post ID: ${gigcorpPost.id}`);
  console.log(`   Comments inserted: ${commentCount}`);
}

seedGigCorpDiscussion()
  .then(() => {
    console.log("\n🎉 Seed complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
