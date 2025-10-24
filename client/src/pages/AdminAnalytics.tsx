import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api";
import { Users, MousePointerClick, Eye, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

interface AnalyticsSummary {
  totalUsers: number;
  eventsByKind: { kind: string; count: number }[];
  topServices: { name: string; views: number }[];
  topArticles: { name: string; views: number }[];
  topCtas: { name: string; clicks: number }[];
  recentPageViews: { date: string; views: number }[];
}

export default function AdminAnalytics() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: analytics, isLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["/api/admin/analytics/summary"],
    queryFn: () => apiGet("/api/admin/analytics/summary"),
    enabled: !!user && user.role === "admin",
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  const getEventCount = (kind: string) => {
    return analytics?.eventsByKind.find(e => e.kind === kind)?.count || 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-admin-analytics-title">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track platform adoption and engagement metrics
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card data-testid="card-total-users">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                </CardContent>
              </Card>

              <Card data-testid="card-page-views">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getEventCount("page_view")}</div>
                </CardContent>
              </Card>

              <Card data-testid="card-service-views">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Service Views</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getEventCount("service_view")}</div>
                </CardContent>
              </Card>

              <Card data-testid="card-cta-clicks">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CTA Clicks</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getEventCount("cta_click")}</div>
                </CardContent>
              </Card>
            </div>

            {/* Top Content Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Services Viewed</CardTitle>
                  <CardDescription>Most popular service catalog pages</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics && analytics.topServices.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.topServices.map((service, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                          data-testid={`service-stat-${idx}`}
                        >
                          <span className="text-sm font-medium truncate">{service.name}</span>
                          <span className="text-sm text-muted-foreground">{service.views} views</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No service views yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Knowledge Articles</CardTitle>
                  <CardDescription>Most accessed training content</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics && analytics.topArticles.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.topArticles.map((article, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                          data-testid={`article-stat-${idx}`}
                        >
                          <span className="text-sm font-medium truncate">{article.name}</span>
                          <span className="text-sm text-muted-foreground">{article.views} views</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No article views yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top CTA Clicks</CardTitle>
                  <CardDescription>Most clicked call-to-action buttons</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics && analytics.topCtas.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.topCtas.map((cta, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                          data-testid={`cta-stat-${idx}`}
                        >
                          <span className="text-sm font-medium truncate">{cta.name}</span>
                          <span className="text-sm text-muted-foreground">{cta.clicks} clicks</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No CTA clicks yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Page Views (7 Days)</CardTitle>
                  <CardDescription>Daily page view trend</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics && analytics.recentPageViews.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.recentPageViews.map((pv, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                          data-testid={`pageview-stat-${idx}`}
                        >
                          <span className="text-sm font-medium">{pv.date}</span>
                          <span className="text-sm text-muted-foreground">{pv.views} views</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent page views</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
