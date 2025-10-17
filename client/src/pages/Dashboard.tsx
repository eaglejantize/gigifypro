import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Briefcase, Star, TrendingUp, Loader2 } from "lucide-react";
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

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

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
      apiRequest(`/api/bookings/${id}`, "PATCH", { status }),
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

  const workerBookings = bookings?.filter(b => b.workerId === user?.id) || [];
  const clientBookings = bookings?.filter(b => b.clientId === user?.id) || [];
  
  const stats = {
    earnings: workerBookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + parseFloat(b.quotedTotal), 0),
    activeJobs: workerBookings.filter(b => 
      ["requested", "accepted", "in_progress"].includes(b.status)
    ).length,
    completedJobs: workerBookings.filter(b => b.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your bookings and track your performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-total-earnings">
                    {formatPrice(stats.earnings)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {stats.completedJobs} completed jobs
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-active-jobs">
                    {stats.activeJobs}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {workerBookings.filter(b => b.status === "requested").length} pending requests
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Posted Jobs</CardTitle>
              <Star className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-posted-jobs">
                    {jobs?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">As a client</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="text-total-bookings">
                    {clientBookings.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Services booked
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bookings" data-testid="tab-bookings">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="jobs" data-testid="tab-jobs">
              My Jobs
            </TabsTrigger>
            <TabsTrigger value="earnings" data-testid="tab-earnings">
              Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Worker Bookings</CardTitle>
                <CardDescription>Service requests from clients</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : workerBookings.length > 0 ? (
                  <div className="space-y-4">
                    {workerBookings.map((booking) => (
                      <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{booking.listing?.title || "Service Request"}</div>
                          <div className="text-sm text-muted-foreground">
                            Client: {booking.client?.name || "Unknown"} • 
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
                          {booking.status === "requested" && (
                            <Button
                              size="sm"
                              onClick={() => updateBookingMutation.mutate({ id: booking.id, status: "accepted" })}
                              disabled={updateBookingMutation.isPending}
                              data-testid={`button-accept-${booking.id}`}
                            >
                              Accept
                            </Button>
                          )}
                          {booking.status === "accepted" && (
                            <Button
                              size="sm"
                              onClick={() => updateBookingMutation.mutate({ id: booking.id, status: "in_progress" })}
                              disabled={updateBookingMutation.isPending}
                              data-testid={`button-start-${booking.id}`}
                            >
                              Start
                            </Button>
                          )}
                          {booking.status === "in_progress" && (
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
                    No worker bookings yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Bookings</CardTitle>
                <CardDescription>Services you've booked</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : clientBookings.length > 0 ? (
                  <div className="space-y-4">
                    {clientBookings.map((booking) => (
                      <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{booking.listing?.title || "Service"}</div>
                          <div className="text-sm text-muted-foreground">
                            Worker: {booking.worker?.user?.name || "Unknown"} • 
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
                <CardTitle>Posted Jobs</CardTitle>
                <CardDescription>Tasks you've posted as a client</CardDescription>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : jobs && jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg">
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
                    No jobs posted yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>Completed bookings and income</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : workerBookings.filter(b => b.status === "completed").length > 0 ? (
                  <div className="space-y-4">
                    {workerBookings
                      .filter(b => b.status === "completed")
                      .map((booking) => (
                        <div key={booking.id} className="flex justify-between items-center py-2 border-b">
                          <div>
                            <div className="font-medium">
                              {booking.listing?.title || "Service"} - {booking.client?.name || "Client"}
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
                    No completed bookings yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
