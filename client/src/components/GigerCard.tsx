import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Briefcase, DollarSign } from "lucide-react";

interface GigerCardProps {
  profileId: string;
  profileName: string;
  tagline?: string | null;
  bio?: string | null;
  mainNiche?: string | null;
  city?: string | null;
  state?: string | null;
  rateCents: number;
  pricingModel: "hourly" | "fixed" | "custom";
  userName: string;
  avatar?: string | null;
  reviewCount: number;
  avgRating: number;
  likeCount: number;
  isPrimaryService: boolean;
  onSelect: () => void;
  isSelected?: boolean;
}

export function GigerCard({
  profileId,
  profileName,
  tagline,
  bio,
  mainNiche,
  city,
  state,
  rateCents,
  pricingModel,
  userName,
  avatar,
  reviewCount,
  avgRating,
  likeCount,
  isPrimaryService,
  onSelect,
  isSelected = false,
}: GigerCardProps) {
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const getPricingLabel = () => {
    if (pricingModel === "hourly") {
      return `${formatPrice(rateCents)}/hr`;
    } else if (pricingModel === "fixed") {
      return `${formatPrice(rateCents)} fixed`;
    } else {
      return "Custom pricing";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const location = [city, state].filter(Boolean).join(", ");

  return (
    <Card
      className={`hover-elevate transition-all ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      data-testid={`card-giger-${profileId}`}
    >
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={avatar || undefined} alt={userName} />
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate" data-testid={`text-giger-name-${profileId}`}>
                  {profileName}
                </h3>
                {tagline && (
                  <p className="text-sm text-muted-foreground truncate">{tagline}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-bold text-primary" data-testid={`text-giger-price-${profileId}`}>
                  {getPricingLabel()}
                </div>
                {pricingModel === "hourly" && (
                  <p className="text-xs text-muted-foreground">Hourly rate</p>
                )}
              </div>
            </div>

            {mainNiche && (
              <div className="flex items-center gap-1 mb-2">
                <Briefcase className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{mainNiche}</span>
              </div>
            )}

            {location && (
              <div className="flex items-center gap-1 mb-3">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{location}</span>
              </div>
            )}

            {bio && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{bio}</p>
            )}

            <div className="flex items-center gap-4 mb-4">
              {reviewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-sm">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
              {likeCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {likeCount} {likeCount === 1 ? "like" : "likes"}
                </span>
              )}
              {isPrimaryService && (
                <Badge variant="secondary" className="text-xs">
                  Primary Service
                </Badge>
              )}
            </div>

            <Button
              onClick={onSelect}
              variant={isSelected ? "default" : "outline"}
              className="w-full"
              data-testid={`button-select-giger-${profileId}`}
            >
              {isSelected ? "Selected" : "Select Giger"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
