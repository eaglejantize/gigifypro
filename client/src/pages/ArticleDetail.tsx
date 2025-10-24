import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import * as LucideIcons from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { KnowledgeArticle, TrainingProgress } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";

function getDynamicIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Circle;
  return Icon;
}

export default function ArticleDetail() {
  const [, params] = useRoute("/knowledge/article/:slug");
  const slug = params?.slug;
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: article, isLoading } = useQuery<KnowledgeArticle>({
    queryKey: ["/api/knowledge/articles", slug],
    enabled: !!slug,
  });

  const { data: progress } = useQuery<TrainingProgress[]>({
    queryKey: ["/api/knowledge/my-progress"],
    enabled: !!user,
  });

  const completeMutation = useMutation({
    mutationFn: async (articleId: string) => {
      return await apiRequest(`/api/knowledge/complete/${articleId}`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge/my-progress"] });
      toast({
        title: "Progress saved",
        description: "Article marked as complete!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isCompleted = article && progress?.some(
    p => p.articleId === article.id && p.completed
  );

  const handleComplete = () => {
    if (article && user) {
      completeMutation.mutate(article.id);
    } else if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to track your progress.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link href="/knowledge">
            <Button variant="ghost" size="sm" className="mb-8" data-testid="button-back">
              <LucideIcons.ChevronLeft className="w-4 h-4 mr-2" />
              Back to Knowledge Hub
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Article not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/knowledge">
          <Button variant="ghost" size="sm" className="mb-8" data-testid="button-back">
            <LucideIcons.ChevronLeft className="w-4 h-4 mr-2" />
            Back to Knowledge Hub
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            {(() => {
              const IconComponent = getDynamicIcon(article.icon || "FileText");
              return <IconComponent className="w-10 h-10 text-primary" />;
            })()}
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-article-title">
                {article.title}
              </h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <LucideIcons.Clock className="w-4 h-4" />
              <span className="text-sm">{article.readTimeMinutes} min read</span>
            </div>
            {isCompleted && (
              <Badge variant="default" className="gap-1.5" data-testid="badge-completed">
                <LucideIcons.CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8">
            <div 
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(article.content) }}
              data-testid="content-article"
            />
          </CardContent>
        </Card>

        {user && !isCompleted && (
          <div className="flex justify-center">
            <Button 
              onClick={handleComplete}
              disabled={completeMutation.isPending}
              size="lg"
              data-testid="button-mark-complete"
            >
              <LucideIcons.CheckCircle2 className="w-5 h-5 mr-2" />
              {completeMutation.isPending ? "Saving..." : "Mark as Complete"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatMarkdown(content: string): string {
  let html = content;

  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
  
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  html = html.replace(/<p><h/g, '<h');
  html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
  html = html.replace(/<p><ul>/g, '<ul>');
  html = html.replace(/<\/ul><\/p>/g, '</ul>');
  
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  return html;
}
