import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Heart, Clock, MapPin, Award, MessageSquare } from "lucide-react";
import ProfileBadges from "@/components/ProfileBadges";

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const userId = params?.id;

  // Mock data
  const profile = {
    id: userId,
    name: "John Smith",
    avatar: null,
    bio: "Professional handyman with 10+ years of experience. Specialized in home repairs, plumbing, and electrical work.",
    location: "San Francisco, CA",
    verified: true,
    stats: {
      likes: 45,
      rating: 4.8,
      reviews: 32,
      jobsCompleted: 156,
      responseTime: 15,
    },
    skills: ["Plumbing", "Electrical", "Carpentry", "Painting", "General Repairs"],
    hourlyRate: "50",
  };

  const reviews = [
    {
      id: "1",
      client: "Sarah Johnson",
      rating: 5,
      comment: "Excellent work! Very professional and completed the job quickly.",
      date: "2 days ago",
    },
    {
      id: "2",
      client: "Mike Davis",
      rating: 5,
      comment: "Fixed my plumbing issue perfectly. Highly recommend!",
      date: "1 week ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.avatar || undefined} />
                <AvatarFallback className="text-4xl">
                  {profile.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold" data-testid="text-profile-name">
                    {profile.name}
                  </h1>
                  {profile.verified && (
                    <Badge variant="default">Verified</Badge>
                  )}
                  <Badge variant="secondary">Top Rated</Badge>
                </div>

                <p className="text-muted-foreground mb-4">{profile.bio}</p>

                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 fill-chart-3 text-chart-3" />
                      <span className="font-bold">{profile.stats.rating}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {profile.stats.reviews} reviews
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Heart className="w-4 h-4 text-destructive" />
                      <span className="font-bold" data-testid="text-profile-likes">
                        {profile.stats.likes}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Likes</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="font-bold">{profile.stats.jobsCompleted}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Jobs done</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-bold">{profile.stats.responseTime}m</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Response time</div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <div className="text-sm font-semibold mb-2">Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Badges */}
                {userId && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold mb-2">Certifications & Badges</div>
                    <ProfileBadges userId={userId} />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1" data-testid="button-book-profile">
                    Book Service - ${profile.hourlyRate}/hr
                  </Button>
                  <Button variant="outline" size="icon" data-testid="button-message-profile">
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="reviews" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reviews" data-testid="tab-reviews">
              Reviews ({profile.stats.reviews})
            </TabsTrigger>
            <TabsTrigger value="portfolio" data-testid="tab-portfolio">
              Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{review.client}</CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-chart-3 text-chart-3"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{review.date}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  No portfolio items yet
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
