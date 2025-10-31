import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Hero } from "@/components/Hero";
import { GigifiedProgress } from "@/components/GigifiedProgress";
import * as LucideIcons from "lucide-react";
import type { KnowledgeArticle, Badge as BadgeType } from "@shared/schema";
import { apiGet } from "@/lib/api";

// Most popular services to feature in Skill Builder section
const POPULAR_SERVICE_KEYS = [
  "house-cleaning",
  "deep-cleaning", 
  "lawncare",
  "handyman",
  "home-repairs",
  "moving-help",
  "furniture-assembly",
  "dog-walking",
  "pet-sitting",
  "delivery",
  "errands"
];

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
];

function getDynamicIcon(iconName: string) {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Circle;
  return Icon;
}

export default function KnowledgeHub() {
  const { data: articles, isLoading: articlesLoading } = useQuery<KnowledgeArticle[]>({
    queryKey: ["/api/knowledge/articles"],
    queryFn: () => apiGet("/api/knowledge/articles"),
  });

  const { data: badges, isLoading: badgesLoading } = useQuery<BadgeType[]>({
    queryKey: ["/api/knowledge/badges"],
    queryFn: () => apiGet("/api/knowledge/badges"),
  });

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

            // For Skill Builder, show only most popular services
            const isSkillBuilder = section.id === "skill_builder";
            let displayArticles = sectionArticles;
            
            if (isSkillBuilder) {
              // Sort articles by popularity, then take top 6
              const popularArticles = sectionArticles
                .sort((a, b) => {
                  const aIndex = POPULAR_SERVICE_KEYS.indexOf(a.slug);
                  const bIndex = POPULAR_SERVICE_KEYS.indexOf(b.slug);
                  
                  // If both are in popular list, sort by their position
                  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                  // If only one is popular, prioritize it
                  if (aIndex !== -1) return -1;
                  if (bIndex !== -1) return 1;
                  // If neither is popular, maintain original order
                  return 0;
                })
                .slice(0, 6);
              displayArticles = popularArticles;
            }

            return (
              <div key={section.id} data-testid={`section-${section.id}`}>
                <div className="flex items-center gap-3 mb-6">
                  <SectionIcon className={`w-8 h-8 ${section.color}`} />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                    <p className="text-muted-foreground">{section.description}</p>
                  </div>
                  {isSkillBuilder && sectionArticles.length > 6 && (
                    <Link href="/services">
                      <Button variant="outline" size="sm" data-testid="button-view-all-services">
                        View All 75 Services
                        <LucideIcons.ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>

                {articlesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => <Skeleton key={i} className="h-48" />)}
                  </div>
                ) : displayArticles.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <p>No articles available in this section yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayArticles.map((article) => {
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
                    {isSkillBuilder && sectionArticles.length > 6 && (
                      <div className="mt-6 text-center">
                        <Link href="/services">
                          <Button variant="outline" size="lg" data-testid="button-view-all-services-bottom">
                            <LucideIcons.BookOpen className="mr-2 w-5 h-5" />
                            View All 75 Service Training Guides
                            <LucideIcons.ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-3">
                          Explore comprehensive training for all services with certifications, safety guides, and business tips
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
