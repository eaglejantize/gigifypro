import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import InfoPopover from "@/components/InfoPopover";
import { ArrowRight, BookOpen, Briefcase } from "lucide-react";

type ServiceSummary = {
  key: string;
  label: string;
  summary: string;
  badges: string[];
};

export default function Services() {
  const { data: services, isLoading } = useQuery<ServiceSummary[]>({
    queryKey: ["/api/knowledge/services"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground text-center">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight" data-testid="text-services-title">
          Our Services
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover the gig opportunities available on GigifyPro. Each service includes training resources, compliance guidance, and recommended gear to help you succeed.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/feed">
            <Button size="lg" data-testid="button-browse-workers">
              <Briefcase className="mr-2 h-4 w-4" />
              Browse Workers
            </Button>
          </Link>
          <Link href="/knowledge">
            <Button size="lg" variant="outline" data-testid="button-knowledge-hub">
              <BookOpen className="mr-2 h-4 w-4" />
              Knowledge Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services?.map((service) => (
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
  );
}
