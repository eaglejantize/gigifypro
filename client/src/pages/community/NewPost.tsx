import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import MarkdownEditor from "@/components/MarkdownEditor";
import { Globe, MapPin } from "lucide-react";

export default function NewPost() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [topicKey, setTopicKey] = useState("ideas");
  const [bodyMd, setBodyMd] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [location, setLocationInput] = useState("");
  const [visibility, setVisibility] = useState<"NATIONAL" | "LOCAL">("NATIONAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !bodyMd.trim()) {
      toast({
        title: "Missing fields",
        description: "Please provide both a title and content for your post",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const hashtagsArray = hashtags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => tag.startsWith("#") ? tag : `#${tag}`);

      const response = await fetch("/api/community/posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          serviceKey: serviceKey.trim() || null,
          topicKey,
          bodyMd,
          mediaUrl: mediaUrl.trim() || null,
          hashtags: hashtagsArray,
          location: location.trim() || null,
          visibility,
        }),
      });

      if (response.ok) {
        const post = await response.json();
        toast({
          title: "Post created!",
          description: "Your post has been published to G-Square",
        });
        setLocation(`/community/post/${post.id}`);
      } else {
        const error = await response.json();
        toast({
          title: "Failed to create post",
          description: error.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Post</CardTitle>
            <CardDescription>
              Share your ideas, questions, or stories with G-Square. Use Markdown for formatting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="What's on your mind?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-post-title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic</label>
                <Select value={topicKey} onValueChange={setTopicKey}>
                  <SelectTrigger data-testid="select-post-topic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ideas">Ideas</SelectItem>
                    <SelectItem value="service-tips">Service Tips</SelectItem>
                    <SelectItem value="show-tell">Show & Tell</SelectItem>
                    <SelectItem value="neighborhood">Neighborhood</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <Select value={visibility} onValueChange={(v) => setVisibility(v as "NATIONAL" | "LOCAL")}>
                  <SelectTrigger data-testid="select-post-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Tag (Optional)</label>
                <Input
                  placeholder="e.g., lawn-care, dog-walking"
                  value={serviceKey}
                  onChange={(e) => setServiceKey(e.target.value)}
                  data-testid="input-post-service-tag"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location (Optional)</label>
                <Input
                  placeholder="e.g., 90210 or Nashville, TN"
                  value={location}
                  onChange={(e) => setLocationInput(e.target.value)}
                  data-testid="input-post-location"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Media URL (Optional)</label>
              <Input
                placeholder="https://example.com/image.jpg or video URL"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                data-testid="input-post-media"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hashtags (Optional)</label>
              <Input
                placeholder="e.g., success, tips, neighborhood (comma-separated)"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                data-testid="input-post-hashtags"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content (Markdown)</label>
              <MarkdownEditor
                value={bodyMd}
                onChange={setBodyMd}
                placeholder="Share your idea, question, or story using Markdown..."
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-testid="button-publish-post"
              >
                {isSubmitting ? "Publishing..." : "Publish Post"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/community")}
                data-testid="button-cancel-post"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
