import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkerCard } from "@/components/WorkerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import type { ServiceListing, WorkerProfile } from "@shared/schema";

type ListingWithWorker = ServiceListing & {
  worker?: WorkerProfile & { user?: { name: string; avatar: string | null } };
  likeCount?: number;
  avgRating?: number;
  reviewCount?: number;
};

export default function Feed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("ranked");

  const { data: listings, isLoading } = useQuery<ListingWithWorker[]>({
    queryKey: ["/api/listings"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-feed-title">
            Explore Services
          </h1>
          <p className="text-muted-foreground">
            Browse verified professionals ranked by quality and reviews
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ranked">Top Ranked</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" data-testid="button-filters">
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Workers Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid gap-6">
            {listings.map((listing) => (
              <WorkerCard
                key={listing.id}
                id={listing.workerId}
                name={listing.worker?.user?.name || "Unknown"}
                bio={listing.description}
                hourlyRate={listing.customRate || "25"}
                likeCount={listing.likeCount || 0}
                avgRating={listing.avgRating || 5}
                reviewCount={listing.reviewCount || 0}
                responseTime={listing.worker?.responseTimeMinutes || 30}
                verified={listing.worker?.verified || false}
                badge={listing.avgRating && listing.avgRating >= 4.8 ? "Top Rated" : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
