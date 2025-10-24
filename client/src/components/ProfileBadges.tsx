import { useQuery } from "@tanstack/react-query";
import BadgePill from "./BadgePill";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api";

interface Badge {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
}

interface ProfileBadgesProps {
  userId: string;
}

export default function ProfileBadges({ userId }: ProfileBadgesProps) {
  const { data: badges, isLoading } = useQuery<Badge[]>({
    queryKey: ["/api/profile", userId, "badges"],
    queryFn: () => apiGet(`/api/profile/${userId}/badges`),
  });

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-6 w-24" />
        ))}
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" data-testid="profile-badges-container">
      {badges.map(badge => (
        <BadgePill
          key={badge.id}
          name={badge.name}
          icon={badge.icon}
          color={badge.color}
          title={badge.description}
        />
      ))}
    </div>
  );
}
