import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Briefcase, Star, TrendingUp } from "lucide-react";

export default function Dashboard() {
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-earnings">
                $3,250
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-chart-2">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-jobs">
                5
              </div>
              <p className="text-xs text-muted-foreground">2 pending, 3 in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-rating">
                4.8
              </div>
              <p className="text-xs text-muted-foreground">From 32 reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-likes">
                45
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-chart-2">+5</span> this week
              </p>
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
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Manage your service bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock booking */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">Fix Kitchen Faucet</div>
                      <div className="text-sm text-muted-foreground">
                        Client: John Smith • Tomorrow at 2:00 PM
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold">$50</div>
                        <Badge variant="secondary">Accepted</Badge>
                      </div>
                      <Button size="sm">View</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">House Cleaning</div>
                      <div className="text-sm text-muted-foreground">
                        Client: Sarah Johnson • Dec 20 at 10:00 AM
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold">$120</div>
                        <Badge>In Progress</Badge>
                      </div>
                      <Button size="sm">View</Button>
                    </div>
                  </div>

                  {/* Empty state would go here */}
                </div>
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
                <p className="text-muted-foreground text-center py-8">
                  No jobs posted yet
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>Track your income over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">House Cleaning - Sarah J.</div>
                      <div className="text-sm text-muted-foreground">Dec 15, 2024</div>
                    </div>
                    <div className="text-lg font-bold text-chart-2">+$120</div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">Plumbing Repair - Mike D.</div>
                      <div className="text-sm text-muted-foreground">Dec 12, 2024</div>
                    </div>
                    <div className="text-lg font-bold text-chart-2">+$75</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
