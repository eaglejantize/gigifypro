import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Heart, Clock, MapPin, Award, MessageSquare, TrendingUp, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ProfileBadges from "@/components/ProfileBadges";

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const profileId = params?.id;
  const [gigScoreDialogOpen, setGigScoreDialogOpen] = useState(false);

  // Fetch GigScore for profile
  const { data: gigScoreData } = useQuery<{
    reviewQuality: number;
    completedJobs: number;
    responseTime: number;
    cancellations: number;
    repeatClients: number;
    totalScore: number;
  }>({
    queryKey: ["/api/profile", profileId, "gigscore"],
    enabled: !!profileId,
  });

  // Mock data (will be replaced with real data from backend)
  const profile = {
    id: profileId,
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

                {/* GigScore - Prominent Display */}
                {gigScoreData && (
                  <>
                    <button
                      onClick={() => setGigScoreDialogOpen(true)}
                      className="w-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-6 hover-elevate active-elevate-2 text-left transition-all"
                      data-testid="button-view-gigscore"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 rounded-full p-3">
                            <TrendingUp className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">
                              GigScore
                            </div>
                            <div className="text-3xl font-bold text-primary" data-testid="text-gigscore">
                              {gigScoreData.totalScore}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <Badge variant="outline" className="bg-background">
                            {gigScoreData.totalScore >= 90 ? "Legend" : gigScoreData.totalScore >= 70 ? "Elite" : gigScoreData.totalScore >= 40 ? "Pro" : "Rising"}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Info className="w-3 h-3" />
                            <span>Click for details</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Score Breakdown */}
                      <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-primary/10">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Reviews</div>
                          <div className="font-semibold text-sm">{gigScoreData.reviewQuality.toFixed(0)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Jobs</div>
                          <div className="font-semibold text-sm">{gigScoreData.completedJobs.toFixed(0)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Speed</div>
                          <div className="font-semibold text-sm">{gigScoreData.responseTime.toFixed(0)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Reliability</div>
                          <div className="font-semibold text-sm">{gigScoreData.cancellations.toFixed(0)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Repeat</div>
                          <div className="font-semibold text-sm">{gigScoreData.repeatClients.toFixed(0)}</div>
                        </div>
                      </div>
                    </button>

                    {/* GigScore Details Dialog */}
                    <Dialog open={gigScoreDialogOpen} onOpenChange={setGigScoreDialogOpen}>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="modal-gigscore-breakdown">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-primary" />
                            GigScore Breakdown
                          </DialogTitle>
                          <DialogDescription>
                            Understanding how this giger's performance score is calculated
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 mt-4">
                          {/* Total Score */}
                          <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground mb-2">Total GigScore</div>
                            <div className="text-5xl font-bold text-primary mb-2">{gigScoreData.totalScore}</div>
                            <Badge variant="outline" className="bg-background">
                              {gigScoreData.totalScore >= 90 ? "Legend" : gigScoreData.totalScore >= 70 ? "Elite" : gigScoreData.totalScore >= 40 ? "Pro" : "Rising"}
                            </Badge>
                          </div>

                          {/* Score Components */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Score Components</h3>

                            {/* Review Quality - 40% */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-chart-3" />
                                  <span className="font-medium">Review Quality</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-lg">{gigScoreData.reviewQuality.toFixed(1)}</span>
                                  <span className="text-sm text-muted-foreground ml-1">/ 40</span>
                                </div>
                              </div>
                              <Progress value={(gigScoreData.reviewQuality / 40) * 100} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                Based on average star ratings from client reviews. Higher ratings = higher score. (40% weight)
                              </p>
                            </div>

                            {/* Completed Jobs - 25% */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-primary" />
                                  <span className="font-medium">Completed Jobs</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-lg">{gigScoreData.completedJobs.toFixed(1)}</span>
                                  <span className="text-sm text-muted-foreground ml-1">/ 25</span>
                                </div>
                              </div>
                              <Progress value={(gigScoreData.completedJobs / 25) * 100} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                Number of successfully completed jobs. Uses logarithmic scale to reward consistent work. (25% weight)
                              </p>
                            </div>

                            {/* Response Time - 15% */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-primary" />
                                  <span className="font-medium">Response Speed</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-lg">{gigScoreData.responseTime.toFixed(1)}</span>
                                  <span className="text-sm text-muted-foreground ml-1">/ 15</span>
                                </div>
                              </div>
                              <Progress value={(gigScoreData.responseTime / 15) * 100} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                Average response time to client messages. Faster responses = higher score. (15% weight)
                              </p>
                            </div>

                            {/* Cancellations - 10% */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-primary" />
                                  <span className="font-medium">Reliability</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-lg">{gigScoreData.cancellations.toFixed(1)}</span>
                                  <span className="text-sm text-muted-foreground ml-1">/ 10</span>
                                </div>
                              </div>
                              <Progress value={(gigScoreData.cancellations / 10) * 100} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                Job completion rate. Lower cancellations = higher reliability score. (10% weight)
                              </p>
                            </div>

                            {/* Repeat Clients - 10% */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Heart className="w-4 h-4 text-destructive" />
                                  <span className="font-medium">Repeat Clients</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-lg">{gigScoreData.repeatClients.toFixed(1)}</span>
                                  <span className="text-sm text-muted-foreground ml-1">/ 10</span>
                                </div>
                              </div>
                              <Progress value={(gigScoreData.repeatClients / 10) * 100} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                Percentage of clients who book again. Higher loyalty = higher score. (10% weight)
                              </p>
                            </div>
                          </div>

                          {/* Tier Explanation */}
                          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <h4 className="text-sm font-semibold">GigScore Tiers</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Rising</Badge>
                                <span className="text-muted-foreground">0-39 points</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Pro</Badge>
                                <span className="text-muted-foreground">40-69 points</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Elite</Badge>
                                <span className="text-muted-foreground">70-89 points</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Legend</Badge>
                                <span className="text-muted-foreground">90-100 points</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}

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
                {profileId && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold mb-2">Certifications & Badges</div>
                    <ProfileBadges userId={profileId} />
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
