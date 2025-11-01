import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import MarkdownEditor from "@/components/MarkdownEditor";
import ReactionBar from "@/components/ReactionBar";
import { useState } from "react";
import { apiGet } from "@/lib/api";
import { Eye, MessageSquare, Calendar, Globe, MapPin, Hash, Reply } from "lucide-react";

type Post = {
  id: string;
  title: string;
  bodyHtml: string;
  serviceKey: string | null;
  mediaUrl: string | null;
  hashtags: string[];
  location: string | null;
  visibility: "NATIONAL" | "LOCAL";
  score: number;
  views: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

type Comment = {
  id: string;
  bodyHtml: string;
  score: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

// Component to display a single comment with its replies
function CommentWithReplies({ 
  comment, 
  postId, 
  depth = 0 
}: { 
  comment: Comment; 
  postId: string; 
  depth?: number;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);
  const [replyMd, setReplyMd] = useState("");
  const [showReplies, setShowReplies] = useState(true);

  // Fetch replies for this comment
  const { data: replies } = useQuery<Comment[]>({
    queryKey: ["/api/community/comments", comment.id, "replies"],
    queryFn: () => apiGet(`/api/community/comments/${comment.id}/replies`),
  });

  const addReplyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/community/comments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          postId, 
          parentId: comment.id, 
          bodyMd: replyMd 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add reply");
      }

      return response.json();
    },
    onSuccess: () => {
      setReplyMd("");
      setIsReplying(false);
      queryClient.invalidateQueries({ queryKey: ["/api/community/comments", comment.id, "replies"] });
      toast({
        title: "Reply added!",
        description: "Your reply has been posted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add reply",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const maxDepth = 4; // Limit nesting depth
  const canReply = depth < maxDepth;
  const indentClass = depth > 0 ? "ml-6 pl-4 border-l-2 border-border" : "";

  return (
    <div className={indentClass}>
      <Card data-testid={`card-comment-${comment.id}`}>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="font-semibold text-sm" data-testid={`text-comment-author-${comment.id}`}>
              {comment.author?.name || 'Anonymous'}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: comment.bodyHtml }}
          />
          <div className="flex items-center gap-2">
            <ReactionBar targetType="comment" targetId={comment.id} />
            {canReply && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="gap-1"
                data-testid={`button-reply-${comment.id}`}
              >
                <Reply className="w-3 h-3" />
                Reply
              </Button>
            )}
            {replies && replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs"
                data-testid={`button-toggle-replies-${comment.id}`}
              >
                {showReplies ? "Hide" : "Show"} {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="pt-4 space-y-3 border-t" data-testid={`form-reply-${comment.id}`}>
              <MarkdownEditor
                value={replyMd}
                onChange={setReplyMd}
                placeholder="Write your reply..."
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => addReplyMutation.mutate()}
                  disabled={!replyMd.trim() || addReplyMutation.isPending}
                  size="sm"
                  data-testid={`button-submit-reply-${comment.id}`}
                >
                  {addReplyMutation.isPending ? "Posting..." : "Post Reply"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyMd("");
                  }}
                  data-testid={`button-cancel-reply-${comment.id}`}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nested Replies */}
      {showReplies && replies && replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <CommentWithReplies 
              key={reply.id} 
              comment={reply} 
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostDetail() {
  const [, params] = useRoute("/community/post/:id");
  const postId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentMd, setCommentMd] = useState("");

  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ["/api/community/posts", postId],
    queryFn: () => apiGet(`/api/community/posts/${postId}`),
    enabled: !!postId,
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["/api/community/posts", postId, "comments"],
    queryFn: () => apiGet(`/api/community/posts/${postId}/comments`),
    enabled: !!postId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/community/comments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, bodyMd: commentMd }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add comment");
      }

      return response.json();
    },
    onSuccess: () => {
      setCommentMd("");
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", postId, "comments"] });
      toast({
        title: "Comment added!",
        description: "Your comment has been posted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Post not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Post */}
        <Card data-testid="card-post-detail">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2" data-testid="text-post-title">
                  {post.title}
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                  {post.visibility === "LOCAL" ? (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      Local
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Globe className="w-3 h-3" />
                      National
                    </Badge>
                  )}
                  {post.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {post.location}
                    </span>
                  )}
                  {post.serviceKey && (
                    <Badge variant="secondary" data-testid="badge-service-tag">
                      #{post.serviceKey}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.views} views
                  </span>
                  <span>Score: {post.score}</span>
                </CardDescription>
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.hashtags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs gap-1">
                        <Hash className="w-3 h-3" />
                        {tag.replace('#', '')}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {post.mediaUrl && (
              <div className="rounded-md overflow-hidden">
                <img 
                  src={post.mediaUrl} 
                  alt="Post media" 
                  className="w-full h-auto"
                  data-testid="post-media"
                />
              </div>
            )}
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
              data-testid="post-content"
            />
            <div className="pt-4 border-t">
              <ReactionBar targetType="post" targetId={post.id} />
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments ({comments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Comments */}
            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentWithReplies 
                    key={comment.id} 
                    comment={comment} 
                    postId={postId!}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}

            {/* Add Comment */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold">Add a Comment</h3>
              <MarkdownEditor
                value={commentMd}
                onChange={setCommentMd}
                placeholder="Share your thoughts or ask a question..."
              />
              <Button
                onClick={() => addCommentMutation.mutate()}
                disabled={!commentMd.trim() || addCommentMutation.isPending}
                data-testid="button-add-comment"
              >
                {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
