import { db } from "./db";
import { users, posts, comments, topics } from "@shared/schema";
import { eq } from "drizzle-orm";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

async function seedCommunityPack() {
  console.log("🔥 Seeding G-Square with Community Pack v1...\n");

  const mdToHtml = (md: string): string => {
    const rawHtml = marked.parse(md, { async: false }) as string;
    return DOMPurify.sanitize(rawHtml);
  };

  // Ensure community topic exists
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

  // Create additional community members
  console.log("\n👥 Creating community members...");
  
  const userProfiles = [
    { username: "FreelanceFrank", fullName: "Frank Freeman", email: "frank@example.com" },
    { username: "DesignDina", fullName: "Dina Designer", email: "dina@example.com" },
    { username: "CoachCam", fullName: "Cam Coach", email: "cam@example.com" },
    { username: "SmartBizSage", fullName: "Sage Business", email: "sage@example.com" },
    { username: "CoffeeCarla", fullName: "Carla Coffee", email: "carla@example.com" },
    { username: "TeaTimTom", fullName: "Tim Tea", email: "timtea@example.com" },
    { username: "ProductivePete", fullName: "Pete Productive", email: "pete@example.com" },
    { username: "LeaderboardLeo", fullName: "Leo Leader", email: "leo.leader@example.com" },
    { username: "BillableBarb", fullName: "Barb Billable", email: "barb@example.com" },
    { username: "CableChris", fullName: "Chris Cable", email: "chris@example.com" },
    { username: "SnackSara", fullName: "Sara Snack", email: "sara@example.com" },
    { username: "CatBossMike", fullName: "Mike Cat", email: "mike@example.com" },
    { username: "VanLifeVera", fullName: "Vera Van", email: "vera@example.com" },
    { username: "TourGuideToby", fullName: "Toby Tour", email: "toby@example.com" },
    { username: "MerchMegan", fullName: "Megan Merch", email: "megan@example.com" },
    { username: "SafetySteve", fullName: "Steve Safety", email: "steve@example.com" },
    { username: "TrustBadgeTina", fullName: "Tina Trust", email: "tina@example.com" },
    { username: "PrivacyPaul", fullName: "Paul Privacy", email: "paul@example.com" },
    { username: "FairRulesFiona", fullName: "Fiona Fair", email: "fiona@example.com" },
    { username: "MemeMaster", fullName: "Max Meme", email: "max@example.com" },
    { username: "ArtistAnna", fullName: "Anna Artist", email: "anna@example.com" },
    { username: "PricingPro", fullName: "Pat Pricing", email: "pat@example.com" },
    { username: "CreativeCarol", fullName: "Carol Creative", email: "carol@example.com" },
    { username: "MuralMurphy", fullName: "Murphy Mural", email: "murphy@example.com" },
    { username: "SquatsSally", fullName: "Sally Squats", email: "sally@example.com" },
    { username: "DonutDave", fullName: "Dave Donut", email: "dave.donut@example.com" },
    { username: "HumbleHank", fullName: "Hank Humble", email: "hank@example.com" },
    { username: "SponsorSam", fullName: "Sam Sponsor", email: "sam.sponsor@example.com" },
    { username: "SoloSid", fullName: "Sid Solo", email: "sid@example.com" },
    { username: "MightyMia", fullName: "Mia Mighty", email: "mia@example.com" },
    { username: "CorpContractCarl", fullName: "Carl Contract", email: "carl@example.com" },
    { username: "PlaybookPenny", fullName: "Penny Playbook", email: "penny@example.com" },
    { username: "TigerTerry", fullName: "Terry Tiger", email: "terry@example.com" },
    { username: "RnBRita", fullName: "Rita RnB", email: "rita@example.com" },
    { username: "ClassicalClay", fullName: "Clay Classical", email: "clay@example.com" },
    { username: "SpotifySpencer", fullName: "Spencer Spotify", email: "spencer@example.com" },
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
        role: "user",
      }).returning();
      user = newUser;
      userMap.set(profile.username, user.id);
      console.log(`  ✓ Created user: ${profile.username}`);
    } else {
      userMap.set(profile.username, user.id);
      console.log(`  ✓ User ${profile.username} already exists`);
    }
  }

  // Helper to get specific timestamp N days ago (with some random hours/minutes)
  const getDaysAgoTimestamp = (daysAgo: number) => {
    const now = new Date();
    const randomHours = Math.floor(Math.random() * 12);  // 0-12 hours variation
    const randomMinutes = Math.floor(Math.random() * 60);
    const millisAgo = (daysAgo * 24 * 60 * 60 * 1000) + (randomHours * 60 * 60 * 1000) + (randomMinutes * 60 * 1000);
    return new Date(now.getTime() - millisAgo);
  };

  // Helper to add minutes to a date
  const addMinutes = (date: Date, minutes: number) => {
    return new Date(date.getTime() + (minutes * 60 * 1000));
  };

  console.log("\n📝 Creating community posts...\n");

  let totalPosts = 0;
  let totalComments = 0;
  const exampleComments: string[] = [];

  // POST 2: Coffee Mystery
  const coffeePostTime = getDaysAgoTimestamp(12);
  const coffeeMarkdown = `Every freelancer I know claims to drink "just one cup" a day...  
but somehow we all own industrial coffee machines

How many cups keep you Gigified?`;

  const [coffeePost] = await db.insert(posts).values({
    authorId: userMap.get("FreelanceFrank")!,
    topicId: communityTopic.id,
    title: "The Great Coffee Mystery",
    mediaUrl: "/public/images/posts/coffee_meme.jpg",
    bodyMd: coffeeMarkdown,
    bodyHtml: mdToHtml(coffeeMarkdown),
    createdAt: coffeePostTime,
  }).returning();

  totalPosts++;
  console.log(`  ✓ Created post: "${coffeePost.title}"`);

  const coffeeComments = [
    { author: "CoffeeCarla", text: "Two cups minimum or I forget my login password." },
    { author: "TeaTimTom", text: "I switched to tea. Productivity tanked but my zen increased" },
    { author: "ProductivePete", text: "Coffee is our unofficial sponsor." },
    { author: "LeaderboardLeo", text: "Gigify needs a 'Coffee Consumed' leaderboard." },
    { author: "BillableBarb", text: "Can confirm, caffeine is billable time." },
  ];

  let commentTime = addMinutes(coffeePostTime, 15);
  for (const comment of coffeeComments) {
    await db.insert(comments).values({
      postId: coffeePost.id,
      authorId: userMap.get(comment.author)!,
      bodyMd: comment.text,
      bodyHtml: mdToHtml(comment.text),
      createdAt: commentTime,
    });
    commentTime = addMinutes(commentTime, Math.floor(Math.random() * 25) + 5);
    totalComments++;
    if (exampleComments.length < 3) exampleComments.push(comment.text);
  }

  // POST 3: Workspace Showcase
  const workspacePostTime = getDaysAgoTimestamp(10);
  const workspaceMarkdown = `We spend half our lives in our workspace — home offices, vans, kitchens, garages.  
Drop a pic or describe your setup. Messy desks welcome!`;

  const [workspacePost] = await db.insert(posts).values({
    authorId: userMap.get("DesignDina")!,
    topicId: communityTopic.id,
    title: "Show us your Workspace!",
    mediaUrl: "/public/images/posts/workspace_collage.jpg",
    bodyMd: workspaceMarkdown,
    bodyHtml: mdToHtml(workspaceMarkdown),
    createdAt: workspacePostTime,
  }).returning();

  totalPosts++;
  console.log(`  ✓ Created post: "${workspacePost.title}"`);

  const workspaceComments = [
    { author: "CableChris", text: "Mine's 70% cables and 30% snacks." },
    { author: "CatBossMike", text: "My cat is the project manager." },
    { author: "VanLifeVera", text: "I built a folding desk inside my van, best decision ever." },
    { author: "TourGuideToby", text: "Workspace tour challenge when?" },
    { author: "MerchMegan", text: "GigifyPro office merch incoming?" },
  ];

  commentTime = addMinutes(workspacePostTime, 10);
  for (const comment of workspaceComments) {
    await db.insert(comments).values({
      postId: workspacePost.id,
      authorId: userMap.get(comment.author)!,
      bodyMd: comment.text,
      bodyHtml: mdToHtml(comment.text),
      createdAt: commentTime,
    });
    commentTime = addMinutes(commentTime, Math.floor(Math.random() * 25) + 5);
    totalComments++;
  }

  // POST 4: Background Checks
  const bgCheckPostTime = getDaysAgoTimestamp(8);
  const bgCheckMarkdown = `Some services require background checks, others don't.  
Do you think *everyone* should be verified, or just those entering homes?  
Let's talk safety vs. privacy.`;

  const [bgCheckPost] = await db.insert(posts).values({
    authorId: userMap.get("SafetySteve")!,
    topicId: communityTopic.id,
    title: "Background checks — worth the hassle?",
    mediaUrl: "/public/images/posts/trust_badge.png",
    bodyMd: bgCheckMarkdown,
    bodyHtml: mdToHtml(bgCheckMarkdown),
    createdAt: bgCheckPostTime,
  }).returning();

  totalPosts++;
  console.log(`  ✓ Created post: "${bgCheckPost.title}"`);

  const bgCheckComments = [
    { author: "TrustBadgeTina", text: "Clients feel safer when I show that badge." },
    { author: "SafetySteve", text: "It's a must for childcare and transport." },
    { author: "PrivacyPaul", text: "I'm fine with it as long as renewal isn't too expensive." },
    { author: "FairRulesFiona", text: "Feels fair — different rules for different gigs." },
    { author: "MemeMaster", text: "Background check memes when?" },
  ];

  commentTime = addMinutes(bgCheckPostTime, 20);
  for (const comment of bgCheckComments) {
    await db.insert(comments).values({
      postId: bgCheckPost.id,
      authorId: userMap.get(comment.author)!,
      bodyMd: comment.text,
      bodyHtml: mdToHtml(comment.text),
      createdAt: commentTime,
    });
    commentTime = addMinutes(commentTime, Math.floor(Math.random() * 25) + 5);
    totalComments++;
  }

  // POST 5: Art Pricing
  const artPostTime = getDaysAgoTimestamp(7);
  const artMarkdown = `Artists of G-Square — how do you price your work without undercutting yourself?  
Let's share tips and maybe cry together over art supply costs.`;

  const [artPost] = await db.insert(posts).values({
    authorId: userMap.get("ArtistAnna")!,
    topicId: communityTopic.id,
    title: "The Art of the Side Hustle",
    mediaUrl: "/public/images/posts/paintbrush.jpg",
    bodyMd: artMarkdown,
    bodyHtml: mdToHtml(artMarkdown),
    createdAt: artPostTime,
  }).returning();

  totalPosts++;
  console.log(`  ✓ Created post: "${artPost.title}"`);

  const artComments = [
    { author: "PricingPro", text: "Rule #1: never say 'it only took me an hour'" },
    { author: "ArtistAnna", text: "Charge for materials AND genius." },
    { author: "CreativeCarol", text: "Love seeing creatives here — we're not 'side' anything!" },
    { author: "MuralMurphy", text: "I trade custom murals for free coffee sometimes… worth it." },
  ];

  commentTime = addMinutes(artPostTime, 12);
  for (const comment of artComments) {
    await db.insert(comments).values({
      postId: artPost.id,
      authorId: userMap.get(comment.author)!,
      bodyMd: comment.text,
      bodyHtml: mdToHtml(comment.text),
      createdAt: commentTime,
    });
    commentTime = addMinutes(commentTime, Math.floor(Math.random() * 25) + 5);
    totalComments++;
  }

  // POST 6: Trainer Story
  const trainerPostTime = getDaysAgoTimestamp(5);
  const trainerMarkdown = `Trainers, what's your funniest 'client moment'?  
I once had a client show up with donuts for everyone… I respected it.`;

  const [trainerPost] = await db.insert(posts).values({
    authorId: userMap.get("CoachCam")!,
    topicId: communityTopic.id,
    title: "That awkward moment when a client joins your gym class late",
    mediaUrl: "/public/images/posts/late_client_meme.jpg",
    bodyMd: trainerMarkdown,
    bodyHtml: mdToHtml(trainerMarkdown),
    createdAt: trainerPostTime,
  }).returning();

  totalPosts++;
  console.log(`  ✓ Created post: "${trainerPost.title}"`);

  const trainerComments = [
    { author: "SquatsSally", text: "I'd reward that client with extra squats." },
    { author: "DonutDave", text: "Donuts = motivation fuel." },
    { author: "HumbleHank", text: "Late clients keep me humble" },
    { author: "SponsorSam", text: "GigifyPro should sponsor donut giveaways." },
  ];

  commentTime = addMinutes(trainerPostTime, 8);
  for (const comment of trainerComments) {
    await db.insert(comments).values({
      postId: trainerPost.id,
      authorId: userMap.get(comment.author)!,
      bodyMd: comment.text,
      bodyHtml: mdToHtml(comment.text),
      createdAt: commentTime,
    });
    commentTime = addMinutes(commentTime, Math.floor(Math.random() * 25) + 5);
    totalComments++;
  }

  // POST 7: Micro-Businesses
  const bizPostTime = getDaysAgoTimestamp(4);
  const bizMarkdown = `GigifyPros forming small collectives — GigCorps — might actually be the blueprint for the next economy.  
Imagine verified groups bidding on city contracts or corporate service packages.  
Small teams, big impact.`;

  const [bizPost] = await db.insert(posts).values({
    authorId: userMap.get("SmartBizSage")!,
    topicId: communityTopic.id,
    title: "Micro-Businesses: The Future of Work",
    bodyMd: bizMarkdown,
    bodyHtml: mdToHtml(bizMarkdown),
    createdAt: bizPostTime,
  }).returning();

  totalPosts++;
  console.log(`  ✓ Created post: "${bizPost.title}"`);

  const bizComments = [
    { author: "SoloSid", text: "From solo gigs to franchise vibes!" },
    { author: "MightyMia", text: "Exactly — let's be small but mighty." },
    { author: "CorpContractCarl", text: "Corporate contracts scare me but excite me too." },
    { author: "PlaybookPenny", text: "GigifyPro could create the playbook for this." },
  ];

  commentTime = addMinutes(bizPostTime, 18);
  for (const comment of bizComments) {
    await db.insert(comments).values({
      postId: bizPost.id,
      authorId: userMap.get(comment.author)!,
      bodyMd: comment.text,
      bodyHtml: mdToHtml(comment.text),
      createdAt: commentTime,
    });
    commentTime = addMinutes(commentTime, Math.floor(Math.random() * 25) + 5);
    totalComments++;
  }

  // POST 8: Work Music
  const musicPostTime = getDaysAgoTimestamp(2);
  const musicMarkdown = `We all have that ONE track that gets us moving — what's yours?`;

  const [musicPost] = await db.insert(posts).values({
    authorId: userMap.get("SpotifySpencer")!,
    topicId: communityTopic.id,
    title: "What's the one song that powers you through work?",
    mediaUrl: "/public/images/posts/work_playlist.jpg",
    bodyMd: musicMarkdown,
    bodyHtml: mdToHtml(musicMarkdown),
    createdAt: musicPostTime,
  }).returning();

  totalPosts++;
  console.log(`  ✓ Created post: "${musicPost.title}"`);

  const musicComments = [
    { author: "TigerTerry", text: "Eye of the Tiger. Forever." },
    { author: "RnBRita", text: "Cleaning playlist: 90s R&B only." },
    { author: "ClassicalClay", text: "Depends on the gig — classical for folding laundry, trap for mopping." },
    { author: "SpotifySpencer", text: "Someone please make an official GigifyPro Spotify playlist!" },
  ];

  commentTime = addMinutes(musicPostTime, 5);
  for (const comment of musicComments) {
    await db.insert(comments).values({
      postId: musicPost.id,
      authorId: userMap.get(comment.author)!,
      bodyMd: comment.text,
      bodyHtml: mdToHtml(comment.text),
      createdAt: commentTime,
    });
    commentTime = addMinutes(commentTime, Math.floor(Math.random() * 25) + 5);
    totalComments++;
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log(`✅ Number of posts created: ${totalPosts}`);
  console.log(`✅ Total comments inserted: ${totalComments}`);
  console.log(`\n📌 Example from first post ("${coffeePost.title}"):`);
  exampleComments.forEach((text, idx) => {
    console.log(`   ${idx + 1}. "${text}"`);
  });
  console.log("\n✅ G-Square seeded with Community Pack v1");
  console.log("=".repeat(60) + "\n");
}

// Run the seed
seedCommunityPack()
  .then(() => {
    console.log("🎉 Community Pack seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error seeding community pack:", error);
    process.exit(1);
  });
