import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, GraduationCap, Shield, Award, MapPin, DollarSign, Clock, ChevronRight } from "lucide-react";
import type { KnowledgeArticle, Badge as BadgeType } from "@shared/schema";

const sections = [
  { 
    id: "getting_started", 
    title: "Getting Started", 
    icon: BookOpen,
    description: "Business basics and legal foundations",
    color: "text-blue-600"
  },
  { 
    id: "safety_compliance", 
    title: "Safety & Compliance", 
    icon: Shield,
    description: "Background checks and safety standards",
    color: "text-green-600"
  },
  { 
    id: "skill_builder", 
    title: "Skill Builder", 
    icon: GraduationCap,
    description: "Service-specific training and certifications",
    color: "text-purple-600"
  },
  { 
    id: "customer_service", 
    title: "Customer Service & Growth", 
    icon: Award,
    description: "Build repeat clients and trust",
    color: "text-amber-600"
  },
  { 
    id: "local_law", 
    title: "Local Law Map", 
    icon: MapPin,
    description: "Location-specific licensing requirements",
    color: "text-red-600"
  },
  { 
    id: "insurance_financial", 
    title: "Insurance & Financial", 
    icon: DollarSign,
    description: "Liability coverage and financial planning",
    color: "text-emerald-600"
  },
];

export default function KnowledgeHub() {
  const { data: articles, isLoading: articlesLoading } = useQuery<KnowledgeArticle[]>({
    queryKey: ["/api/knowledge/articles"],
  });

  const { data: badges, isLoading: badgesLoading } = useQuery<BadgeType[]>({
    queryKey: ["/api/knowledge/badges"],
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
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4" data-testid="text-knowledge-title">Knowledge Hub</h1>
            <p className="text-lg text-muted-foreground" data-testid="text-knowledge-description">
              Learn the skills, certifications, and legal requirements to build a successful gig business. 
              Earn badges as you complete training modules.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {badgesLoading ? (
          <div className="mb-12">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          </div>
        ) : badges && badges.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6" data-testid="text-badges-title">Available Certifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <Card key={badge.id} className="hover-elevate" data-testid={`card-badge-${badge.type}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div 
                        className="text-3xl" 
                        style={{ color: badge.color }}
                      >
                        {badge.icon}
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
              ))}
            </div>
          </div>
        )}

        <div className="space-y-12">
          {sections.map((section) => {
            const sectionArticles = articlesBySection[section.id] || [];
            const SectionIcon = section.icon;

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
                    {sectionArticles.map((article) => (
                      <Link 
                        key={article.id} 
                        href={`/knowledge/article/${article.slug}`}
                        data-testid={`link-article-${article.slug}`}
                      >
                        <Card className="h-full hover-elevate active-elevate-2 cursor-pointer">
                          <CardHeader>
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{article.icon}</div>
                              <div className="flex-1">
                                <CardTitle className="text-lg group-hover:text-primary">
                                  {article.title}
                                </CardTitle>
                                <CardDescription className="mt-2">
                                  {article.summary}
                                </CardDescription>
                                <div className="flex items-center gap-2 mt-3">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {article.readTimeMinutes} min read
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            </div>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
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
