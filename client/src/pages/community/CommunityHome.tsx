import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, TrendingUp, Clock } from "lucide-react";
import { useState } from "react";
import { apiGet } from "@/lib/api";

type Post = {
  id: string;
  title: string;
  serviceKey: string | null;
  score: number;
  views: number;
  createdAt: string;
};

export default function CommunityHome() {
  const [mode, setMode] = useState<"latest" | "hot">("latest");
  const [topicKey, setTopicKey] = useState<string>("all");
  const [serviceKey, setServiceKey] = useState<string>("");

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/community/posts", mode, topicKey, serviceKey],
    queryFn: () => {
      const params = new URLSearchParams({ mode });
      if (topicKey && topicKey !== "all") params.append("topicKey", topicKey);
      if (serviceKey) params.append("serviceKey", serviceKey);
      return apiGet(`/api/community/posts?${params}`);
    },
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-community-title">
              Community Forum
            </h1>
            <p className="text-muted-foreground">
              Share ideas, ask questions, and connect with the GigifyPro community
            </p>
          </div>
          <Link href="/community/new">
            <Button size="lg" data-testid="button-new-post">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Link key={post.id} href={`/community/post/${post.id}`}>
                <Card className="hover-elevate cursor-pointer" data-testid={`card-post-${post.id}`}>
                  <CardHeader>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-xs">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.serviceKey && <span className="text-primary">#{post.serviceKey}</span>}
                      <span>{post.views} views</span>
                      <span>{post.score} score</span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
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
