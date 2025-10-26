import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkerCard } from "@/components/WorkerCard";
import { CategoryDropdown } from "@/components/CategoryDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import type { ServiceListing, WorkerProfile } from "@shared/schema";

type ListingWithWorker = ServiceListing & {
  worker?: WorkerProfile & { 
    user?: { name: string; avatar: string | null };
    completedJobs?: number;
    gigScore?: number;
    createdAt?: Date | string;
  };
  likeCount?: number;
  avgRating?: number;
  reviewCount?: number;
};

export default function Feed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("ranked");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const { data: allListings, isLoading } = useQuery<ListingWithWorker[]>({
    queryKey: ["/api/listings"],
  });

  // Filter and sort listings
  const listings = useMemo(() => {
    let filtered = allListings || [];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((listing) => listing.categoryId === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.worker?.user?.name.toLowerCase().includes(query)
      );
    }

    // Sort listings
    const sorted = [...filtered];
    switch (sortBy) {
      case "rating":
        sorted.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        break;
      case "price-low":
        sorted.sort(
          (a, b) =>
            parseFloat(a.customRate || "25") - parseFloat(b.customRate || "25")
        );
        break;
      case "price-high":
        sorted.sort(
          (a, b) =>
            parseFloat(b.customRate || "25") - parseFloat(a.customRate || "25")
        );
        break;
      case "recent":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "ranked":
      default:
        // Keep default ranking from backend
        break;
    }

    return sorted;
  }, [allListings, selectedCategory, searchQuery, sortBy]);

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
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
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
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-[400px]">
              <CategoryDropdown
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Filter by category..."
                showAllOption={true}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <Input
                placeholder="ZIP Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full sm:w-32"
                data-testid="input-zip"
              />
              <Input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full sm:flex-1"
                data-testid="input-city"
              />
              <Input
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full sm:w-24"
                maxLength={2}
                data-testid="input-state"
              />
            </div>
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
                listingId={listing.id}
                name={listing.worker?.user?.name || "Unknown"}
                bio={listing.description}
                hourlyRate={listing.customRate || "25"}
                likeCount={listing.likeCount || 0}
                avgRating={listing.avgRating || 5}
                reviewCount={listing.reviewCount || 0}
                responseTime={listing.worker?.responseTimeMinutes || 30}
                verified={listing.worker?.verified || false}
                badge={listing.avgRating && listing.avgRating >= 4.8 ? "Top Rated" : undefined}
                completedJobs={listing.worker?.completedJobs}
                gigScore={listing.worker?.gigScore}
                memberSince={listing.worker?.createdAt}
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
