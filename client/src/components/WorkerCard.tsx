import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Clock } from "lucide-react";
import { Link } from "wouter";
import { BookingDialog } from "./BookingDialog";

interface WorkerCardProps {
  id: string;
  listingId?: string;
  name: string;
  avatar?: string;
  bio?: string;
  hourlyRate: string;
  likeCount: number;
  avgRating: number;
  reviewCount: number;
  responseTime?: number;
  verified?: boolean;
  badge?: string;
}

export function WorkerCard({
  id,
  listingId,
  name,
  avatar,
  bio,
  hourlyRate,
  likeCount,
  avgRating,
  reviewCount,
  responseTime,
  verified,
  badge,
}: WorkerCardProps) {
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  return (
    <>
      <Card className="overflow-hidden hover-elevate transition-all" data-testid={`card-worker-${id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={avatar} />
            <AvatarFallback className="text-lg">{name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate" data-testid={`text-worker-name-${id}`}>
                {name}
              </h3>
              {verified && (
                <Badge variant="secondary" className="shrink-0">
                  Verified
                </Badge>
              )}
              {badge && (
                <Badge variant="default" className="shrink-0">
                  {badge}
                </Badge>
              )}
            </div>

            {bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-chart-3 text-chart-3" />
                <span className="font-medium" data-testid={`text-rating-${id}`}>
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">({reviewCount})</span>
              </div>

              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-destructive" />
                <span className="font-medium" data-testid={`text-likes-${id}`}>
                  {likeCount}
                </span>
              </div>

              {responseTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{responseTime}m</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-bold" data-testid={`text-price-${id}`}>
              ${hourlyRate}
            </div>
            <div className="text-xs text-muted-foreground">per hour</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Link href={`/profile/${id}`} className="flex-1" data-testid={`link-view-profile-${id}`}>
          <Button variant="outline" className="w-full">
            View Profile
          </Button>
        </Link>
        <Button
          className="flex-1"
          onClick={() => setShowBookingDialog(true)}
          data-testid={`button-book-${id}`}
        >
          Book Now
        </Button>
      </CardFooter>
      </Card>

      <BookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        workerId={id}
        workerName={name}
        listingId={listingId || id}
        defaultRate={hourlyRate}
      />
    </>
  );
}
