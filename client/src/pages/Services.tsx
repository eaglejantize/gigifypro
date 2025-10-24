import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InfoPopover from "@/components/InfoPopover";
import { Hero } from "@/components/Hero";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import { ArrowRight, BookOpen } from "lucide-react";
import { apiGet } from "@/lib/api";

type ServiceSummary = {
  key: string;
  label: string;
  summary: string;
  category: string;
  badges: string[];
};

export default function Services() {
  const { data: services, isLoading } = useQuery<ServiceSummary[]>({
    queryKey: ["/api/knowledge/services"],
    queryFn: () => apiGet("/api/knowledge/services"),
  });

  const servicesByCategory = services?.reduce((acc, service) => {
    const cat = service.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, ServiceSummary[]>) || {};

  return (
    <div className="min-h-screen">
      <Hero
        title="75 Gig Services Ready for You"
        subtitle="Explore Opportunities"
        description="Discover the gig opportunities available on GigifyPro. Each service includes training resources, compliance guidance, and recommended gear to help you succeed."
        primaryCta={{ text: "Browse Workers", href: "/feed", trackingId: "services-browse" }}
        secondaryCta={{ text: "Knowledge Hub", href: "/knowledge", trackingId: "services-knowledge" }}
      />

      {/* Services by Category */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-64" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <div key={category} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold" data-testid={`text-category-${category}`}>
                  {category}
                </h2>
                <p className="text-muted-foreground">{categoryServices.length} services available</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categoryServices.map((service) => (
                  <Card key={service.key} className="hover-elevate" data-testid={`card-service-${service.key}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {service.label}
                            <InfoPopover serviceKey={service.key} />
                          </CardTitle>
                          <CardDescription className="mt-2">{service.summary}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {service.badges?.map((badge) => (
                          <Badge key={badge} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Link href="/post">
                          <Button variant="default" size="sm" data-testid={`button-post-${service.key}`}>
                            Post Job
                          </Button>
                        </Link>
                        <Link href="/feed">
                          <Button variant="outline" size="sm" data-testid={`button-find-${service.key}`}>
                            Find Workers <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">What Our Community Says</h2>
          <TestimonialCarousel />
        </div>

        {/* Bottom CTA */}
        <div className="bg-muted rounded-lg p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you're looking to hire skilled workers or offer your services, GigifyPro makes it easy to connect and succeed.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <Button size="lg" data-testid="button-cta-signup">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/knowledge">
              <Button size="lg" variant="outline" data-testid="button-cta-learn">
                Learn More <BookOpen className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
