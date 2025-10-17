import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ListingDetail() {
  const [, params] = useRoute("/listing/:id");
  const listingId = params?.id;
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);

  // Mock data
  const listing = {
    id: listingId,
    title: "Professional Home Repair Services",
    description: "I provide expert handyman services including plumbing, electrical work, carpentry, and general home repairs. With over 10 years of experience, I ensure quality workmanship and timely completion.",
    worker: {
      id: "w1",
      name: "John Smith",
      avatar: null,
      rating: 4.8,
      reviews: 32,
      verified: true,
    },
    category: "Home Repair",
    hourlyRate: "50",
    duration: 120,
    likes: 45,
    location: "San Francisco, CA",
  };

  const handleLike = () => {
    setLiked(!liked);
    toast({
      title: liked ? "Like removed" : "Service liked!",
      description: liked ? "" : "You can see liked services in your dashboard",
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge className="mb-2">{listing.category}</Badge>
                    <h1 className="text-2xl font-bold mb-2" data-testid="text-listing-title">
                      {listing.title}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                  <Button
                    variant={liked ? "default" : "outline"}
                    size="icon"
                    onClick={handleLike}
                    data-testid="button-like"
                  >
                    <Heart
                      className={`w-5 h-5 ${liked ? "fill-current" : ""}`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{listing.description}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-destructive" />
                      <span className="font-medium" data-testid="text-listing-likes">
                        {listing.likes}
                      </span>
                      <span className="text-muted-foreground">likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {listing.duration} min typical
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Worker Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={listing.worker.avatar || undefined} />
                    <AvatarFallback className="text-xl">
                      {listing.worker.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{listing.worker.name}</h3>
                      {listing.worker.verified && (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-chart-3 text-chart-3" />
                      <span className="font-medium">{listing.worker.rating}</span>
                      <span className="text-muted-foreground">
                        ({listing.worker.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <Link href={`/profile/${listing.worker.id}`} data-testid="link-worker-profile">
                    <Button variant="outline">View Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Book This Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold" data-testid="text-listing-price">
                    ${listing.hourlyRate}
                  </div>
                  <div className="text-sm text-muted-foreground">per hour</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Typical duration</span>
                    <span className="font-medium">{listing.duration} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated cost</span>
                    <span className="font-medium">
                      ${(parseFloat(listing.hourlyRate) * (listing.duration / 60)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button className="w-full" data-testid="button-book-now">
                  Book Now
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  You won't be charged until the service is completed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
