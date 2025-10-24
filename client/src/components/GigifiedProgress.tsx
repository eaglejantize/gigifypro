import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function GigifiedProgress() {
  const { data: progress, isLoading } = useQuery({
    queryKey: ["/api/knowledge/my-progress"],
    retry: false,
  });

  const { data: badges } = useQuery({
    queryKey: ["/api/knowledge/my-badges"],
    retry: false,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return null;
  }

  const completionRate = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Get Gigified Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Training Completion</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-lg font-bold">{progress.completed}</div>
              <div className="text-xs text-muted-foreground">Guides Read</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-lg font-bold">{badges?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Badges Earned</div>
            </div>
          </div>
        </div>

        {badges && badges.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">Recent Badges</div>
            <div className="flex flex-wrap gap-1.5">
              {badges.slice(0, 3).map((ub: any) => (
                <Badge key={ub.id} variant="secondary" className="text-xs">
                  {ub.badge.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
