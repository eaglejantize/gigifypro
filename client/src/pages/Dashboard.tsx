import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DollarSign, Briefcase, Star, TrendingUp, Loader2, Users, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/pricing";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Booking, JobRequest } from "@shared/schema";

type BookingWithDetails = Booking & {
  client?: { name: string };
  worker?: { user?: { name: string } };
  listing?: { title: string };
};

type JobRequestWithDetails = JobRequest & {
  category?: { name: string };
};

// Mock data for demonstration
const mockGProBookings: BookingWithDetails[] = [
  {
    id: "mock-gig-1",
    clientId: "mock-client-1",
    workerId: "current-user",
    listingId: "mock-listing-1",
    jobRequestId: null,
    quotedTotal: "125.00",
    status: "requested",
    duration: 60,
    location: "123 Main St, Downtown",
    notes: null,
    scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    client: { name: "Sarah Martinez" },
    listing: { title: "Deep Cleaning - 3BR Home" },
  },
  {
    id: "mock-gig-2",
    clientId: "mock-client-2",
    workerId: "current-user",
    listingId: "mock-listing-2",
    jobRequestId: null,
    quotedTotal: "85.00",
    status: "in_progress",
    duration: 90,
    location: "456 Oak Ave, Suburbia",
    notes: null,
    scheduledFor: new Date(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    client: { name: "James Wilson" },
    listing: { title: "Lawn Mowing & Edging" },
  },
  {
    id: "mock-gig-3",
    clientId: "mock-client-3",
    workerId: "current-user",
    listingId: "mock-listing-3",
    jobRequestId: null,
    quotedTotal: "200.00",
    status: "completed",
    duration: 120,
    location: "789 Elm Blvd, Riverside",
    notes: null,
    scheduledFor: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    client: { name: "Emma Chen" },
    listing: { title: "Professional Pet Grooming" },
  },
];

const mockTaskerBookings: BookingWithDetails[] = [
  {
    id: "mock-task-1",
    clientId: "current-user",
    workerId: "mock-worker-1",
    listingId: "mock-listing-4",
    jobRequestId: null,
    quotedTotal: "150.00",
    status: "accepted",
    duration: 120,
    location: "321 Pine St, Midtown",
    notes: null,
    scheduledFor: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    worker: { user: { name: "Marcus Johnson" } },
    listing: { title: "AC Installation & Setup" },
  },
  {
    id: "mock-task-2",
    clientId: "current-user",
    workerId: "mock-worker-2",
    listingId: "mock-listing-5",
    jobRequestId: null,
    quotedTotal: "75.00",
    status: "completed",
    duration: 60,
    location: "654 Maple Dr, Eastside",
    notes: null,
    scheduledFor: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    worker: { user: { name: "Lisa Park" } },
    listing: { title: "House Cleaning - 2BR Apartment" },
  },
];

const mockJobs: JobRequestWithDetails[] = [
  {
    id: "mock-job-1",
    clientId: "current-user",
    title: "Moving Help - Furniture Assembly",
    description: "Need help assembling IKEA furniture in new apartment. Approximately 5 pieces including bed frame, desk, and shelving.",
    budget: "100.00",
    categoryId: "1",
    duration: null,
    serviceKey: null,
    pricingModel: null,
    profileId: null,
    location: "Downtown Area",
    scheduledFor: null,
    createdAt: new Date(),
    category: { name: "Home & Living" },
  },
  {
    id: "mock-job-2",
    clientId: "current-user",
    title: "Dog Walking - 2 Weeks",
    description: "Looking for a reliable dog walker for my golden retriever. Need someone Monday-Friday for 2 weeks while I'm traveling.",
    budget: "280.00",
    categoryId: "2",
    duration: null,
    serviceKey: null,
    pricingModel: null,
    profileId: null,
    location: "Greenwood Park Area",
    scheduledFor: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    category: { name: "Pet Services" },
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(useSearch());
  const [isGProView, setIsGProView] = useState(searchParams.get("view") !== "tasker");
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "tasks" ? "jobs" : "bookings");

  // Update view and tab from query params on mount
  useEffect(() => {
    const view = searchParams.get("view");
    const tab = searchParams.get("tab");
    if (view === "tasker") setIsGProView(false);
    if (tab === "tasks") setActiveTab("jobs");
  }, []);

  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/users", user?.id, "bookings"],
    enabled: !!user,
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<JobRequestWithDetails[]>({
    queryKey: ["/api/users", user?.id, "jobs"],
    enabled: !!user,
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/bookings/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "bookings"] });
      toast({
        title: "Booking updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Combine real data with mock data for demonstration
  const allWorkerBookings = [...(bookings?.filter(b => b.workerId === user?.id) || []), ...mockGProBookings];
  const allClientBookings = [...(bookings?.filter(b => b.clientId === user?.id) || []), ...mockTaskerBookings];
  const allJobs = [...(jobs || []), ...mockJobs];

  const gProStats = {
    earnings: allWorkerBookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + parseFloat(b.quotedTotal), 0),
    activeJobs: allWorkerBookings.filter(b => 
      ["requested", "accepted", "in_progress"].includes(b.status)
    ).length,
    completedJobs: allWorkerBookings.filter(b => b.status === "completed").length,
    totalClients: new Set(allWorkerBookings.map(b => b.clientId)).size,
  };

  const taskerStats = {
    totalSpent: allClientBookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + parseFloat(b.quotedTotal), 0),
    activeBookings: allClientBookings.filter(b => 
      ["requested", "accepted", "in_progress"].includes(b.status)
    ).length,
    completedBookings: allClientBookings.filter(b => b.status === "completed").length,
    postedJobs: allJobs.length,
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Toggle */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
                {isGProView ? "Gig Pro Dashboard" : "Tasker Dashboard"}
              </h1>
              <p className="text-muted-foreground">
                {isGProView 
                  ? "Manage your service bookings and track your earnings" 
                  : "Manage your tasks and track service requests"}
              </p>
            </div>
            
            {/* Toggle Switch */}
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
              <Label htmlFor="view-toggle" className="font-medium">
                {isGProView ? "G-Pro View" : "Tasker View"}
              </Label>
              <Switch
                id="view-toggle"
                checked={isGProView}
                onCheckedChange={setIsGProView}
                data-testid="switch-dashboard-view"
              />
            </div>
          </div>
        </div>

        {isGProView ? (
          // GIG PRO VIEW
          <>
            {/* Gig Pro Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-giger-earnings">
                    {formatPrice(gProStats.earnings)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {gProStats.completedJobs} completed gigs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">Active Gigs</CardTitle>
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-giger-active">
                    {gProStats.activeJobs}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {allWorkerBookings.filter(b => b.status === "requested").length} pending requests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Gigs</CardTitle>
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-giger-completed">
                    {gProStats.completedJobs}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All-time total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">Total Taskers</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-giger-taskers">
                    {gProStats.totalClients}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Unique taskers served
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gig Pro Tabs */}
            <Tabs defaultValue="bookings" className="space-y-4">
              <TabsList>
                <TabsTrigger value="bookings" data-testid="tab-giger-bookings">
                  My Bookings
                </TabsTrigger>
                <TabsTrigger value="earnings" data-testid="tab-giger-earnings">
                  Earnings History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Bookings</CardTitle>
                    <CardDescription>Gigs requested from taskers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookingsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    ) : allWorkerBookings.length > 0 ? (
                      <div className="space-y-4">
                        {allWorkerBookings.map((booking) => (
                          <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg hover-elevate">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold">{booking.listing?.title || "Service Request"}</div>
                              <div className="text-sm text-muted-foreground">
                                Tasker: {booking.client?.name || "Unknown"} • 
                                {booking.scheduledFor ? format(new Date(booking.scheduledFor), " PPP") : " Date TBD"}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-bold">{formatPrice(parseFloat(booking.quotedTotal))}</div>
                                <Badge variant={
                                  booking.status === "completed" ? "default" :
                                  booking.status === "accepted" || booking.status === "in_progress" ? "secondary" :
                                  booking.status === "cancelled" ? "destructive" :
                                  "outline"
                                }>
                                  {booking.status.replace("_", " ")}
                                </Badge>
                              </div>
                              {booking.status === "requested" && !booking.id.startsWith("mock-") && (
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingMutation.mutate({ id: booking.id, status: "accepted" })}
                                  disabled={updateBookingMutation.isPending}
                                  data-testid={`button-accept-${booking.id}`}
                                >
                                  Accept
                                </Button>
                              )}
                              {booking.status === "accepted" && !booking.id.startsWith("mock-") && (
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingMutation.mutate({ id: booking.id, status: "in_progress" })}
                                  disabled={updateBookingMutation.isPending}
                                  data-testid={`button-start-${booking.id}`}
                                >
                                  Start
                                </Button>
                              )}
                              {booking.status === "in_progress" && !booking.id.startsWith("mock-") && (
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingMutation.mutate({ id: booking.id, status: "completed" })}
                                  disabled={updateBookingMutation.isPending}
                                  data-testid={`button-complete-${booking.id}`}
                                >
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No gig bookings yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="earnings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings History</CardTitle>
                    <CardDescription>Completed gigs and income</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookingsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    ) : allWorkerBookings.filter(b => b.status === "completed").length > 0 ? (
                      <div className="space-y-4">
                        {allWorkerBookings
                          .filter(b => b.status === "completed")
                          .map((booking) => (
                            <div key={booking.id} className="flex justify-between items-center py-2 border-b">
                              <div>
                                <div className="font-medium">
                                  {booking.listing?.title || "Service"} - {booking.client?.name || "Tasker"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {booking.updatedAt ? format(new Date(booking.updatedAt), "PPP") : "Completed"}
                                </div>
                              </div>
                              <div className="text-lg font-bold text-chart-2">
                                +{formatPrice(parseFloat(booking.quotedTotal))}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No completed gigs yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          // TASKER VIEW
          <>
            {/* Tasker Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-tasker-spent">
                    {formatPrice(taskerStats.totalSpent)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    On {taskerStats.completedBookings} services
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-tasker-active">
                    {taskerStats.activeBookings}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In progress or scheduled
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">Posted Tasks</CardTitle>
                  <Star className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-tasker-tasks">
                    {taskerStats.postedJobs}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Looking for Gig Pros
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium">Services Used</CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-tasker-services">
                    {taskerStats.completedBookings}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completed services
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tasker Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="bookings" data-testid="tab-tasker-bookings">
                  My Services
                </TabsTrigger>
                <TabsTrigger value="jobs" data-testid="tab-tasker-jobs">
                  Posted Tasks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Booked Services</CardTitle>
                    <CardDescription>Services you've requested from Gig Pros</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookingsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    ) : allClientBookings.length > 0 ? (
                      <div className="space-y-4">
                        {allClientBookings.map((booking) => (
                          <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg hover-elevate">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold">{booking.listing?.title || "Service"}</div>
                              <div className="text-sm text-muted-foreground">
                                Gig Pro: {booking.worker?.user?.name || "Unknown"} • 
                                {booking.scheduledFor ? format(new Date(booking.scheduledFor), " PPP") : " Date TBD"}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-bold">{formatPrice(parseFloat(booking.quotedTotal))}</div>
                                <Badge variant={
                                  booking.status === "completed" ? "default" :
                                  booking.status === "accepted" || booking.status === "in_progress" ? "secondary" :
                                  booking.status === "cancelled" ? "destructive" :
                                  "outline"
                                }>
                                  {booking.status.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No bookings yet. Browse services to get started!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Posted Tasks</CardTitle>
                    <CardDescription>Tasks you've posted for Gig Pros to bid on</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {jobsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    ) : allJobs.length > 0 ? (
                      <div className="space-y-4">
                        {allJobs.map((job) => (
                          <div key={job.id} className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg hover-elevate">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold">{job.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {job.category?.name || "Uncategorized"} • Budget: {formatPrice(parseFloat(job.budget))}
                              </div>
                              {job.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {job.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline">
                              Active
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No tasks posted yet. Post a task to find Gig Pros!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
