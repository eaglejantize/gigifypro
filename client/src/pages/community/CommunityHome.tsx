import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Clock, Globe, MapPin, Hash, Image, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

type Post = {
  id: string;
  title: string;
  serviceKey: string | null;
  mediaUrl: string | null;
  hashtags: string[];
  location: string | null;
  visibility: "NATIONAL" | "LOCAL";
  score: number;
  views: number;
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
          title: quickPostText.substring(0, 100), // Use first 100 chars as title
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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-community-title">
            G-Square
          </h1>
          <p className="text-muted-foreground">
            Your digital town square—share ideas, connect locally, and grow together
          </p>
        </div>

        {/* Quick Post */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Textarea
                placeholder="What's on your mind? Share your thoughts with G-Square..."
                value={quickPostText}
                onChange={(e) => setQuickPostText(e.target.value)}
                className="min-h-[100px] resize-none"
                data-testid="textarea-quick-post"
              />
              <div className="flex items-center justify-between gap-2">
                <Link href="/community/new">
                  <Button variant="ghost" size="sm" data-testid="button-advanced-post">
                    <Plus className="w-4 h-4 mr-2" />
                    Advanced options
                  </Button>
                </Link>
                <Button 
                  onClick={handleQuickPost} 
                  disabled={isPosting || !quickPostText.trim()}
                  data-testid="button-quick-post"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isPosting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Feed</label>
                <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                  <SelectTrigger data-testid="select-feed-mode">
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger data-testid="select-visibility">
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Topic</label>
                <Select value={topicKey} onValueChange={setTopicKey}>
                  <SelectTrigger data-testid="select-topic">
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service Tag</label>
                <Input
                  placeholder="e.g., lawn-care"
                  value={serviceKey}
                  onChange={(e) => setServiceKey(e.target.value)}
                  data-testid="input-service-filter"
                />
              </div>
            </div>

            {visibility === "LOCAL" && (
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Filter
                </label>
                <Input
                  placeholder="e.g., 90210 or Nashville, TN"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  data-testid="input-location-filter"
                />
                {locationFilter && (
                  <p className="text-xs text-muted-foreground">
                    Filtering by location: {locationFilter}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posts List */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="hover-elevate" data-testid={`card-post-${post.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link href={`/community/post/${post.id}`}>
                        <CardTitle className="text-xl cursor-pointer hover:text-primary">
                          {post.title}
                        </CardTitle>
                      </Link>
                      <CardDescription className="flex flex-wrap items-center gap-3 text-xs mt-2">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
                          <span className="text-primary">#{post.serviceKey}</span>
                        )}
                        <span>{post.views} views</span>
                        <span>{post.score} score</span>
                      </CardDescription>
                    </div>
                    {post.mediaUrl && (
                      <Image className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
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
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts found. Be the first to start a discussion!</p>
                <Link href="/community/new">
                  <Button className="mt-4" data-testid="button-create-first-post">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
