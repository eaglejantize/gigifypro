import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-settings-title">
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" data-testid="tab-profile-settings">
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="worker" data-testid="tab-worker-settings">
              Worker Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="John Doe" data-testid="input-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="john@example.com"
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    defaultValue="San Francisco, CA"
                    data-testid="input-location"
                  />
                </div>
                <Button data-testid="button-save-profile">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    data-testid="input-current-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    data-testid="input-new-password"
                  />
                </div>
                <Button data-testid="button-change-password">Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Booking Updates</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified about booking status changes
                    </div>
                  </div>
                  <Switch defaultChecked data-testid="switch-booking-updates" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">New Messages</div>
                    <div className="text-sm text-muted-foreground">
                      Receive alerts for new messages
                    </div>
                  </div>
                  <Switch defaultChecked data-testid="switch-messages" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Marketing Emails</div>
                    <div className="text-sm text-muted-foreground">
                      Promotions and product updates
                    </div>
                  </div>
                  <Switch data-testid="switch-marketing" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="worker" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Worker Profile</CardTitle>
                <CardDescription>Manage your service provider information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell clients about your experience..."
                    rows={4}
                    data-testid="input-bio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    defaultValue="50"
                    data-testid="input-hourly-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input
                    id="skills"
                    placeholder="Plumbing, Electrical, Carpentry..."
                    data-testid="input-skills"
                  />
                </div>
                <Button data-testid="button-save-worker-profile">Save Worker Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
