import { Link } from "wouter";
import Avatar from "./Avatar";
import { Eye, MessageCircle, Heart, Share2, Globe, MapPin, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Post = {
  id: string;
  title: string;
  bodyMd?: string;
  mediaUrl?: string | null;
  hashtags?: string[];
  location?: string | null;
  visibility: "NATIONAL" | "LOCAL";
  views: number;
  replies: number;
  score: number;
  serviceKey?: string | null;
  createdAt: string;
};

export default function PostCard({ post }: { post: Post }) {
  const hasImage = !!post.mediaUrl;
  const excerpt = post.bodyMd ? post.bodyMd.substring(0, 200) + (post.bodyMd.length > 200 ? "..." : "") : "";

  return (
    <article className="gp-card p-5" data-testid={`card-post-${post.id}`}>
      <header className="flex items-start gap-3">
        <Avatar name="Giger" />
        <div className="flex-1 min-w-0">
          <Link href={`/community/post/${post.id}`}>
            <h3 className="gp-title hover:text-primary transition-colors cursor-pointer">
              {post.title}
            </h3>
          </Link>
          <div className="gp-meta flex items-center gap-2 mt-1 flex-wrap">
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            {post.visibility === "LOCAL" ? (
              <Badge variant="outline" className="gap-1 text-xs">
                <MapPin className="w-3 h-3" />
                Local
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-xs">
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
          </div>
        </div>
      </header>

      {hasImage && (
        <Link href={`/community/post/${post.id}`}>
          <div className="mt-4 gp-img cursor-pointer">
            <img
              src={post.mediaUrl!}
              alt=""
              className="w-full h-auto max-h-96 object-cover"
              loading="lazy"
              data-testid="post-card-image"
            />
          </div>
        </Link>
      )}

      {excerpt && (
        <p className="gp-body mt-3 line-clamp-3">{excerpt}</p>
      )}

      {post.hashtags && post.hashtags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.hashtags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="gp-pill text-xs gap-1">
              <Hash className="w-3 h-3" />
              {tag.replace('#', '')}
            </span>
          ))}
        </div>
      )}

      {post.serviceKey && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            #{post.serviceKey}
          </Badge>
        </div>
      )}

      <footer className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-4 gp-meta">
          <span className="flex items-center gap-1" data-testid={`text-views-${post.id}`}>
            <Eye className="w-4 h-4" />
            {post.views}
          </span>
          <span className="flex items-center gap-1" data-testid={`text-replies-${post.id}`}>
            <MessageCircle className="w-4 h-4" />
            {post.replies}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/community/post/${post.id}`}>
            <button className="gp-icon" data-testid={`button-reply-${post.id}`}>
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </Link>
          <button
            className="gp-icon"
            onClick={() => navigator.share?.({ title: post.title, url: `/community/post/${post.id}` })}
            data-testid={`button-share-${post.id}`}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button className="gp-icon" data-testid={`button-like-${post.id}`}>
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </article>
  );
}
