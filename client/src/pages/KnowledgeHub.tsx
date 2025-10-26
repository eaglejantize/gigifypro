import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Hero } from "@/components/Hero";
import { GigifiedProgress } from "@/components/GigifiedProgress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import * as LucideIcons from "lucide-react";
import type { KnowledgeArticle, Badge as BadgeType } from "@shared/schema";
import { apiGet } from "@/lib/api";

const sections = [
  { 
    id: "getting_started", 
    title: "Getting Started", 
    icon: LucideIcons.BookOpen,
    description: "Business basics and legal foundations",
    color: "text-blue-600"
  },
  { 
    id: "safety_compliance", 
    title: "Safety & Compliance", 
    icon: LucideIcons.Shield,
    description: "Background checks and safety standards",
    color: "text-green-600"
  },
  { 
    id: "skill_builder", 
    title: "Skill Builder", 
    icon: LucideIcons.GraduationCap,
    description: "Service-specific training and certifications",
    color: "text-purple-600"
  },
  { 
    id: "customer_service", 
    title: "Customer Service & Growth", 
    icon: LucideIcons.Award,
    description: "Build repeat clients and trust",
    color: "text-amber-600"
  },
  { 
    id: "local_law", 
    title: "Local Law Map", 
    icon: LucideIcons.MapPin,
    description: "Location-specific licensing requirements",
    color: "text-red-600"
  },
  { 
    id: "insurance_financial", 
    title: "Insurance & Financial", 
    icon: LucideIcons.DollarSign,
    description: "Liability coverage and financial planning",
    color: "text-emerald-600"
  },
  { 
    id: "partner_integrations", 
    title: "Partner Integrations", 
    icon: LucideIcons.Building2,
    description: "LLC formation, EIN, business licenses, and insurance services",
    color: "text-cyan-600"
  },
];

interface PartnerService {
  type: string;
  name: string;
  description: string;
  basePriceCents: number;
  markupCents: number;
  totalPriceCents: number;
  platformFeePercent: number;
}

function getDynamicIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Circle;
  return Icon;
}

export default function KnowledgeHub() {
  const { toast } = useToast();
  const [orderingService, setOrderingService] = useState<string | null>(null);

  const { data: articles, isLoading: articlesLoading } = useQuery<KnowledgeArticle[]>({
    queryKey: ["/api/knowledge/articles"],
    queryFn: () => apiGet("/api/knowledge/articles"),
  });

  const { data: badges, isLoading: badgesLoading } = useQuery<BadgeType[]>({
    queryKey: ["/api/knowledge/badges"],
    queryFn: () => apiGet("/api/knowledge/badges"),
  });

  const { data: partnerServices, isLoading: servicesLoading } = useQuery<{ services: PartnerService[] }>({
    queryKey: ["/api/partners/services"],
    queryFn: () => apiGet("/api/partners/services"),
  });

  const handleOrderService = async (serviceType: string) => {
    try {
      setOrderingService(serviceType);
      const response = await apiRequest("/api/partners/order-setup", "POST", {
        type: serviceType
      }) as unknown as { success: boolean; message: string };

      toast({
        title: "Order Received",
        description: response.message || "A specialist will contact you within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOrderingService(null);
    }
  };

  const articlesBySection = articles?.reduce((acc, article) => {
    if (!acc[article.section]) {
      acc[article.section] = [];
    }
    acc[article.section].push(article);
    return acc;
  }, {} as Record<string, KnowledgeArticle[]>) || {};

  return (
    <div className="min-h-screen bg-background">
      <Hero
        title="Knowledge Hub"
        subtitle="Learn. Earn. Get Gigified."
        description="Learn the skills, certifications, and legal requirements to build a successful gig business. Earn badges as you complete training modules."
        primaryCta={{ text: "Browse Services", href: "/services", trackingId: "knowledge-services" }}
        secondaryCta={{ text: "Start Learning", href: "#training", trackingId: "knowledge-start" }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            {badgesLoading ? (
              <div>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
              </div>
            ) : badges && badges.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6" data-testid="text-badges-title">Available Certifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {badges.map((badge) => {
                    const IconComponent = getDynamicIcon(badge.icon);
                    return (
                      <Card key={badge.id} className="hover-elevate" data-testid={`card-badge-${badge.type}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <div style={{ color: badge.color }}>
                              <IconComponent className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base">{badge.name}</CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {badge.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <GigifiedProgress />
          </div>
        </div>

        <div className="space-y-12">
          {sections.map((section) => {
            const sectionArticles = articlesBySection[section.id] || [];
            const SectionIcon = section.icon;

            // Special rendering for Partner Integrations section
            if (section.id === "partner_integrations") {
              return (
                <div key={section.id} data-testid={`section-${section.id}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <SectionIcon className={`w-8 h-8 ${section.color}`} />
                    <div>
                      <h2 className="text-2xl font-bold">{section.title}</h2>
                      <p className="text-muted-foreground">{section.description}</p>
                    </div>
                  </div>

                  {servicesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-56" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {partnerServices?.services.map((service) => (
                        <Card key={service.type} className="flex flex-col" data-testid={`card-partner-${service.type}`}>
                          <CardHeader>
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            <CardDescription>{service.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col justify-between">
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Base Price:</span>
                                <span>${(service.basePriceCents / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Platform Fee ({service.platformFeePercent}%):</span>
                                <span>${(service.markupCents / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold border-t pt-2">
                                <span>Total:</span>
                                <span>${(service.totalPriceCents / 100).toFixed(2)}</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleOrderService(service.type)}
                              disabled={orderingService === service.type}
                              className="w-full"
                              data-testid={`button-order-${service.type}`}
                            >
                              {orderingService === service.type ? (
                                <>
                                  <LucideIcons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Order Service"
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Regular article sections
            return (
              <div key={section.id} data-testid={`section-${section.id}`}>
                <div className="flex items-center gap-3 mb-6">
                  <SectionIcon className={`w-8 h-8 ${section.color}`} />
                  <div>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                    <p className="text-muted-foreground">{section.description}</p>
                  </div>
                </div>

                {articlesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => <Skeleton key={i} className="h-48" />)}
                  </div>
                ) : sectionArticles.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <p>No articles available in this section yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sectionArticles.map((article) => {
                      const ArticleIcon = getDynamicIcon(article.icon || "FileText");
                      return (
                        <Link 
                          key={article.id} 
                          href={`/knowledge/article/${article.slug}`}
                          data-testid={`link-article-${article.slug}`}
                        >
                          <Card className="h-full hover-elevate active-elevate-2 cursor-pointer">
                            <CardHeader>
                              <div className="flex items-start gap-3">
                                <ArticleIcon className="w-6 h-6 text-primary flex-shrink-0" />
                                <div className="flex-1">
                                  <CardTitle className="text-lg group-hover:text-primary">
                                    {article.title}
                                  </CardTitle>
                                  <CardDescription className="mt-2">
                                    {article.summary}
                                  </CardDescription>
                                  <div className="flex items-center gap-2 mt-3">
                                    <LucideIcons.Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {article.readTimeMinutes} min read
                                    </span>
                                  </div>
                                </div>
                                <LucideIcons.ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              </div>
                            </CardHeader>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
