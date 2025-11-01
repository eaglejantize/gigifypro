import { Router } from "express";
import { db } from "../db";
import { posts, comments, reactions, topics, reputations, reports } from "@shared/schema";
import { eq, desc, and, sql, isNull } from "drizzle-orm";
import { mdToSafeHtml } from "../utils/markdown";
import { hotScore } from "../utils/hot";

const router = Router();

// Auth guard
function needAuth(req: any, res: any, next: any) {
  const uid = (req.session as any)?.uid;
  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Create Post
router.post("/posts", needAuth, async (req, res) => {
  try {
    const { title, bodyMd, mediaUrl, hashtags = [], location, visibility = "NATIONAL", serviceKey, topicKey } = req.body || {};
    
    if (!title || !bodyMd) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const topicKeyValue = topicKey || "ideas";
    const topicRows = await db.select().from(topics).where(eq(topics.key, topicKeyValue)).limit(1);
    
    if (topicRows.length === 0) {
      return res.status(400).json({ error: "Invalid topic" });
    }

    const topic = topicRows[0];
    const bodyHtml = mdToSafeHtml(bodyMd);

    const [post] = await db.insert(posts).values({
      title,
      bodyMd,
      bodyHtml,
      mediaUrl: mediaUrl || null,
      hashtags: Array.isArray(hashtags) ? hashtags : [],
      location: location || null,
      visibility: visibility as "NATIONAL" | "LOCAL",
      serviceKey: serviceKey || null,
      topicId: topic.id,
      authorId: (req.session as any).uid,
    }).returning();

    res.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Get Post
router.get("/posts/:id", async (req, res) => {
  try {
    const postRows = await db
      .select({
        post: posts,
        author: {
          id: sql`${posts.authorId}`,
          name: sql`users.name`,
          email: sql`users.email`,
          avatar: sql`users.avatar`,
        }
      })
      .from(posts)
      .leftJoin(sql`users`, sql`users.id = ${posts.authorId}`)
      .where(eq(posts.id, req.params.id))
      .limit(1);

    if (postRows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Increment views
    await db.update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, req.params.id));

    const result = postRows[0];
    res.json({ ...result.post, author: result.author });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// List Posts (Feed)
router.get("/posts", async (req, res) => {
  try {
    const { mode = "latest", serviceKey, topicKey, visibility, location, cursor, take = "20" } = req.query;
    const takeNum = Math.min(50, Number(take) || 20);

    const conditions = [];

    if (serviceKey) {
      conditions.push(eq(posts.serviceKey, String(serviceKey)));
    }

    if (topicKey) {
      const topicRows = await db.select().from(topics).where(eq(topics.key, String(topicKey))).limit(1);
      if (topicRows.length > 0) {
        conditions.push(eq(posts.topicId, topicRows[0].id));
      }
    }

    if (visibility && (visibility === "NATIONAL" || visibility === "LOCAL")) {
      conditions.push(eq(posts.visibility, String(visibility) as "NATIONAL" | "LOCAL"));
    }

    if (location) {
      conditions.push(eq(posts.location, String(location)));
    }

    // Build base query with comment counts using LEFT JOIN and GROUP BY
    const commentCountSubquery = db
      .select({
        postId: comments.postId,
        count: sql<number>`count(*)::int`.as('comment_count'),
      })
      .from(comments)
      .groupBy(comments.postId)
      .as('comment_counts');

    const baseQuery = db
      .select({
        post: posts,
        replies: sql<number>`COALESCE(${commentCountSubquery.count}, 0)::int`.as('replies'),
      })
      .from(posts)
      .leftJoin(commentCountSubquery, eq(posts.id, commentCountSubquery.postId))
      .$dynamic();

    let query = baseQuery;

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    if (mode === "hot") {
      query = query.orderBy(desc(posts.score));
    } else {
      query = query.orderBy(desc(posts.createdAt));
    }

    const results = await query.limit(takeNum);
    
    // Transform results to include replies count with post data
    const postsWithCounts = results.map((row) => ({
      ...row.post,
      replies: row.replies || 0,
    }));
    
    res.json(postsWithCounts);
  } catch (error) {
    console.error("Error listing posts:", error);
    res.status(500).json({ error: "Failed to list posts" });
  }
});

// React to Post or Comment
router.post("/react", needAuth, async (req, res) => {
  try {
    const { targetType, targetId, kind } = req.body || {};

    if (!["post", "comment"].includes(targetType)) {
      return res.status(400).json({ error: "Invalid target type" });
    }

    const kindUpper = (kind || "LIKE").toUpperCase();
    if (!["LIKE", "HELPFUL", "INSIGHTFUL"].includes(kindUpper)) {
      return res.status(400).json({ error: "Invalid reaction kind" });
    }

    if (targetType === "post") {
      // Upsert reaction
      const existing = await db.select().from(reactions).where(
        and(
          eq(reactions.userId, (req.session as any).uid),
          eq(reactions.postId, targetId),
          eq(reactions.kind, kindUpper as any)
        )
      ).limit(1);

      if (existing.length === 0) {
        await db.insert(reactions).values({
          userId: (req.session as any).uid,
          postId: targetId,
          commentId: null,
          kind: kindUpper as any,
        });
      }

      // Update post score and author karma
      const postRows = await db.select().from(posts).where(eq(posts.id, targetId)).limit(1);
      if (postRows.length > 0) {
        const post = postRows[0];
        const postReactions = await db.select().from(reactions).where(eq(reactions.postId, targetId));
        
        const score = hotScore(postReactions, post.createdAt);

        await db.update(posts).set({ score }).where(eq(posts.id, targetId));

        // Update author karma
        const existingRep = await db.select().from(reputations).where(eq(reputations.userId, post.authorId)).limit(1);
        if (existingRep.length === 0) {
          await db.insert(reputations).values({ userId: post.authorId, karma: 1 });
        } else {
          await db.update(reputations)
            .set({ karma: sql`${reputations.karma} + 1` })
            .where(eq(reputations.userId, post.authorId));
        }
      }
    } else {
      // Comment reaction
      const existing = await db.select().from(reactions).where(
        and(
          eq(reactions.userId, (req.session as any).uid),
          eq(reactions.commentId, targetId),
          eq(reactions.kind, kindUpper as any)
        )
      ).limit(1);

      if (existing.length === 0) {
        await db.insert(reactions).values({
          userId: (req.session as any).uid,
          postId: null,
          commentId: targetId,
          kind: kindUpper as any,
        });
      }

      // Update comment author karma
      const commentRows = await db.select().from(comments).where(eq(comments.id, targetId)).limit(1);
      if (commentRows.length > 0) {
        const comment = commentRows[0];
        const existingRep = await db.select().from(reputations).where(eq(reputations.userId, comment.authorId)).limit(1);
        if (existingRep.length === 0) {
          await db.insert(reputations).values({ userId: comment.authorId, karma: 1 });
        } else {
          await db.update(reputations)
            .set({ karma: sql`${reputations.karma} + 1` })
            .where(eq(reputations.userId, comment.authorId));
        }
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Error creating reaction:", error);
    res.status(500).json({ error: "Failed to create reaction" });
  }
});

// Create Comment
router.post("/comments", needAuth, async (req, res) => {
  try {
    const { postId, parentId, bodyMd } = req.body || {};

    if (!postId || !bodyMd) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const bodyHtml = mdToSafeHtml(bodyMd);

    const [comment] = await db.insert(comments).values({
      postId,
      parentId: parentId || null,
      authorId: (req.session as any).uid,
      bodyMd,
      bodyHtml,
    }).returning();

    res.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// Get Comments for a Post (top-level only)
router.get("/posts/:id/comments", async (req, res) => {
  try {
    const commentRows = await db
      .select({
        comment: comments,
        author: {
          id: sql<string>`users.id`.as('author_id'),
          name: sql<string>`users.name`.as('author_name'),
          avatar: sql<string | null>`users.avatar`.as('author_avatar'),
        }
      })
      .from(comments)
      .leftJoin(sql`users`, sql`users.id = ${comments.authorId}`)
      .where(and(eq(comments.postId, req.params.id), isNull(comments.parentId)))
      .orderBy(comments.createdAt);

    const results = commentRows.map(row => ({
      ...row.comment,
      author: row.author
    }));

    res.json(results);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Get Replies for a Comment
router.get("/comments/:id/replies", async (req, res) => {
  try {
    const replyRows = await db
      .select({
        comment: comments,
        author: {
          id: sql<string>`users.id`.as('author_id'),
          name: sql<string>`users.name`.as('author_name'),
          avatar: sql<string | null>`users.avatar`.as('author_avatar'),
        }
      })
      .from(comments)
      .leftJoin(sql`users`, sql`users.id = ${comments.authorId}`)
      .where(eq(comments.parentId, req.params.id))
      .orderBy(comments.createdAt);

    const results = replyRows.map(row => ({
      ...row.comment,
      author: row.author
    }));

    res.json(results);
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({ error: "Failed to fetch replies" });
  }
});

// Report Content
router.post("/reports", needAuth, async (req, res) => {
  try {
    const { postId, commentId, reason } = req.body || {};

    if (!reason || (!postId && !commentId)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [report] = await db.insert(reports).values({
      reporterId: (req.session as any).uid,
      postId: postId || null,
      commentId: commentId || null,
      reason,
    }).returning();

    res.json(report);
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Failed to create report" });
  }
});

export default router;
