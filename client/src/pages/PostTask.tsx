import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GigerCard } from "@/components/GigerCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Giger {
  profileId: string;
  profileName: string;
  tagline?: string | null;
  bio?: string | null;
  mainNiche?: string | null;
  city?: string | null;
  state?: string | null;
  rateCents: number;
  pricingModel: "hourly" | "fixed" | "custom";
  userId: string;
  userName: string;
  avatar?: string | null;
  reviewCount: number;
  avgRating: number;
  likeCount: number;
  isPrimaryService: boolean;
}

interface Service {
  key: string;
  label: string;
  summary: string;
  category: string;
}

export default function PostTask() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  
  // Step 1: Service selection
  const [serviceKey, setServiceKey] = useState("");
  const [title, setTitle] = useState("");
  
  // Step 2: Giger selection
  const [selectedGigerId, setSelectedGigerId] = useState<string | null>(null);
  const [selectedGiger, setSelectedGiger] = useState<Giger | null>(null);
  
  // Step 3: Task details
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>();
  const [location, setLocationValue] = useState("");

  // Fetch available services
  const { data: servicesData, isLoading: servicesLoading } = useQuery<any>({
    queryKey: ["/api/services"],
  });

  const services: Service[] = Array.isArray(servicesData)
    ? servicesData
    : servicesData?.services || [];

  // Fetch available gigers when service is selected
  const { data: gigers = [], isLoading: gigersLoading } = useQuery<Giger[]>({
    queryKey: ["/api/profile/gigers/by-service", serviceKey],
    enabled: !!serviceKey && step === 2,
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/jobs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "jobs"] });
      toast({
        title: "Task posted successfully!",
        description: "Your selected giger will be notified.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post task",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectGiger = (giger: Giger) => {
    setSelectedGigerId(giger.profileId);
    setSelectedGiger(giger);
  };

  const handleNext = () => {
    if (step === 1 && !serviceKey) {
      toast({
        title: "Service required",
        description: "Please select a service to continue.",
        variant: "destructive",
      });
      return;
    }
    if (step === 1 && !title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a task title.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !selectedGigerId) {
      toast({
        title: "Giger required",
        description: "Please select a giger to continue.",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You must be logged in to post a task.",
        variant: "destructive",
      });
      setLocation("/auth/login");
      return;
    }

    if (!selectedGiger) {
      toast({
        title: "No giger selected",
        description: "Please select a giger.",
        variant: "destructive",
      });
      return;
    }

    createJobMutation.mutate({
      clientId: user.id,
      serviceKey,
      title,
      description,
      profileId: selectedGigerId,
      quotedPrice: selectedGiger.rateCents,
      pricingModel: selectedGiger.pricingModel,
      location,
      scheduledFor: date?.toISOString(),
    });
  };

  const selectedService = services.find((s) => s.key === serviceKey);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-post-task-title">
            Post a Task
          </h1>
          <p className="text-muted-foreground">Find the perfect giger for your job</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s === step
                    ? "bg-primary text-primary-foreground"
                    : s < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    s < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Service & Title */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>What do you need done?</CardTitle>
                <CardDescription>Step 1 of 4: Select a service and describe your task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Service Needed</Label>
                  <Select value={serviceKey} onValueChange={setServiceKey}>
                    <SelectTrigger data-testid="select-service">
                      <SelectValue placeholder="Select a service..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {servicesLoading ? (
                        <div className="p-4 text-center text-muted-foreground">
                          Loading services...
                        </div>
                      ) : (
                        services.map((service) => (
                          <SelectItem key={service.key} value={service.key}>
                            {service.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedService && (
                    <p className="text-sm text-muted-foreground">{selectedService.summary}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., 5-day meal prep for family of 4"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-title"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleNext}
                    className="min-w-32"
                    data-testid="button-next"
                  >
                    Find Gigers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Browse & Select Giger */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Available Gigers</h2>
              <p className="text-muted-foreground">
                {gigers.length} {gigers.length === 1 ? "giger" : "gigers"} available for {selectedService?.label}
              </p>
            </div>

            {gigersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : gigers.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No gigers available</h3>
                  <p className="text-muted-foreground mb-4">
                    No gigers currently offer this service. Try selecting a different service.
                  </p>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Change Service
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {gigers.map((giger) => (
                  <GigerCard
                    key={giger.profileId}
                    {...giger}
                    onSelect={() => handleSelectGiger(giger)}
                    isSelected={selectedGigerId === giger.profileId}
                  />
                ))}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    data-testid="button-back"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!selectedGigerId}
                    className="flex-1"
                    data-testid="button-next"
                  >
                    Continue with {selectedGiger?.profileName || "Selected Giger"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Task Details */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
                <CardDescription>Step 3 of 4: When and where do you need this done?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about the task..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    data-testid="input-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                        data-testid="button-select-date"
                      >
                        <CalendarIcon className="mr-2 w-4 h-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter your address"
                    value={location}
                    onChange={(e) => setLocationValue(e.target.value)}
                    data-testid="input-location"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    data-testid="button-back"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                    data-testid="button-next"
                  >
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && selectedGiger && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>Step 4 of 4: Confirm your task details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Service</div>
                  <div className="text-lg">{selectedService?.label}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Task Title</div>
                  <div className="text-lg">{title}</div>
                </div>

                {description && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
                    <div className="text-sm">{description}</div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="text-sm font-medium text-muted-foreground mb-3">Selected Giger</div>
                  <GigerCard
                    {...selectedGiger}
                    onSelect={() => {}}
                    isSelected={true}
                  />
                </div>

                {date && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Preferred Date</div>
                    <div className="text-lg">{format(date, "PPP")}</div>
                  </div>
                )}

                {location && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Location</div>
                    <div className="text-lg">{location}</div>
                  </div>
                )}

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Quoted Price</span>
                    <span className="text-2xl font-bold text-primary">
                      ${(selectedGiger.rateCents / 100).toFixed(0)}
                      {selectedGiger.pricingModel === "hourly" ? "/hr" : selectedGiger.pricingModel === "fixed" ? " fixed" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    data-testid="button-back"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createJobMutation.isPending}
                    className="flex-1"
                    data-testid="button-post-task"
                  >
                    {createJobMutation.isPending ? "Posting..." : "Post Task"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
