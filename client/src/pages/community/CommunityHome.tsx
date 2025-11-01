import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Clock, Globe, MapPin, Hash, Send, Lightbulb, Users, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import PostCard from "@/components/gsquare/PostCard";
import ThemeToggle from "@/components/gsquare/ThemeToggle";

type Post = {
  id: string;
  title: string;
  bodyMd?: string;
  serviceKey: string | null;
  mediaUrl: string | null;
  hashtags: string[];
  location: string | null;
  visibility: "NATIONAL" | "LOCAL";
  score: number;
  views: number;
  replies: number;
  createdAt: string;
};

export default function CommunityHome() {
  const { toast } = useToast();
  const [mode, setMode] = useState<"latest" | "hot">("latest");
  const [topicKey, setTopicKey] = useState<string>("all");
  const [serviceKey, setServiceKey] = useState<string>("");
  const [visibility, setVisibility] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("");
  
  // Quick post state
  const [quickPostText, setQuickPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Clear location filter when switching away from LOCAL visibility
  useEffect(() => {
    if (visibility !== "LOCAL") {
      setLocationFilter("");
    }
  }, [visibility]);

  async function handleQuickPost() {
    if (!quickPostText.trim()) {
      toast({
        title: "Empty post",
        description: "Please write something to share",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickPostText.substring(0, 100),
          topicKey: "ideas",
          bodyMd: quickPostText,
          visibility: "NATIONAL",
          serviceKey: null,
          mediaUrl: null,
          hashtags: [],
          location: null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Posted!",
          description: "Your thought has been shared with G-Square",
        });
        setQuickPostText("");
        queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      } else {
        const error = await response.json();
        toast({
          title: "Failed to post",
          description: error.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  }

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/community/posts", mode, topicKey, serviceKey, visibility, locationFilter],
    queryFn: () => {
      const params = new URLSearchParams({ mode });
      if (topicKey && topicKey !== "all") params.append("topicKey", topicKey);
      if (serviceKey) params.append("serviceKey", serviceKey);
      if (visibility && visibility !== "all") params.append("visibility", visibility);
      if (locationFilter) params.append("location", locationFilter);
      return apiGet(`/api/community/posts?${params}`);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header with Theme Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-community-title">
              G-Square
            </h1>
            <p className="text-muted-foreground text-sm">
              Your digital town square—share ideas, connect locally, and grow together
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed - Left Column */}
          <div className="lg:col-span-8 space-y-4">
            {/* Quick Post Card */}
            <div className="gp-card p-5">
              <div className="space-y-3">
                <Textarea
                  placeholder="What's on your mind? Share your thoughts with G-Square..."
                  value={quickPostText}
                  onChange={(e) => setQuickPostText(e.target.value)}
                  className="min-h-[100px] resize-none border-0 focus-visible:ring-0 text-base"
                  data-testid="textarea-quick-post"
                />
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                  <Link href="/community/new">
                    <Button variant="ghost" size="sm" data-testid="button-advanced-post">
                      <Plus className="w-4 h-4 mr-2" />
                      Advanced
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleQuickPost} 
                    disabled={isPosting || !quickPostText.trim()}
                    data-testid="button-quick-post"
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isPosting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="gp-card p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                  <SelectTrigger data-testid="select-feed-mode" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Latest
                      </div>
                    </SelectItem>
                    <SelectItem value="hot">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Hot
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger data-testid="select-visibility" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="NATIONAL">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        National
                      </div>
                    </SelectItem>
                    <SelectItem value="LOCAL">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Local
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={topicKey} onValueChange={setTopicKey}>
                  <SelectTrigger data-testid="select-topic" className="h-9">
                    <SelectValue placeholder="All Topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    <SelectItem value="ideas">Ideas</SelectItem>
                    <SelectItem value="service-tips">Service Tips</SelectItem>
                    <SelectItem value="show-tell">Show & Tell</SelectItem>
                    <SelectItem value="neighborhood">Neighborhood</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Service tag..."
                  value={serviceKey}
                  onChange={(e) => setServiceKey(e.target.value)}
                  data-testid="input-service-filter"
                  className="h-9"
                />
              </div>

              {visibility === "LOCAL" && (
                <div className="mt-3 pt-3 border-t border-border">
                  <Input
                    placeholder="Location (e.g., 90210 or Nashville, TN)"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    data-testid="input-location-filter"
                    className="h-9"
                  />
                </div>
              )}
            </div>

            {/* Posts Feed */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="gp-card p-5">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-20 w-full mt-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="gp-card p-12 text-center">
                <div className="max-w-md mx-auto space-y-3">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">No posts found. Be the first to start a discussion!</p>
                  <Link href="/community/new">
                    <Button className="mt-4" data-testid="button-create-first-post">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Post
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Trending Tags */}
            <div className="gp-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-base">Trending Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {["gigcorp", "community", "futureofwork", "wellness", "events", "art"].map((tag) => (
                  <a 
                    key={tag} 
                    href={`/community?tag=${tag}`} 
                    className="gp-pill hover-elevate"
                    data-testid={`link-tag-${tag}`}
                  >
                    #{tag}
                  </a>
                ))}
              </div>
            </div>

            {/* Top GigCorps */}
            <div className="gp-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-base">Top GigCorps</h3>
              </div>
              <ul className="space-y-3">
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5 flex-shrink-0">1</Badge>
                  <span>Home Avengers (Handyman + Cleaning + Lawn)</span>
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5 flex-shrink-0">2</Badge>
                  <span>Event Squad (Chef + Decor + Photo)</span>
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5 flex-shrink-0">3</Badge>
                  <span>Wellness Crew (Trainer + Massage)</span>
                </li>
              </ul>
            </div>

            {/* Tip of the Week */}
            <div className="gp-card p-5 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-base">Tip of the Week</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Add photos to posts—image posts get 3× more replies and engagement from the community.
              </p>
            </div>

            {/* Quick Links */}
            <div className="gp-card p-5">
              <h3 className="font-semibold text-base mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/community/new">
                  <Button variant="ghost" size="sm" className="w-full justify-start" data-testid="link-create-post">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Post
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="ghost" size="sm" className="w-full justify-start" data-testid="link-browse-services">
                    <Hash className="w-4 h-4 mr-2" />
                    Browse Services
                  </Button>
                </Link>
                <Link href="/knowledge">
                  <Button variant="ghost" size="sm" className="w-full justify-start" data-testid="link-knowledge-hub">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Knowledge Hub
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
