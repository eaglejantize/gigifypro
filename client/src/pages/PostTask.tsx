import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryDropdown } from "@/components/CategoryDropdown";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { calculatePrice, durationOptions, formatPrice } from "@/lib/pricing";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ServiceCategory } from "@shared/schema";

export default function PostTask() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState<Date>();
  const [location, setLocationValue] = useState("");

  const quote = calculatePrice(duration);

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/jobs", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "jobs"] });
      toast({
        title: "Task posted successfully!",
        description: "Workers will start responding soon.",
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

    createJobMutation.mutate({
      clientId: user.id,
      categoryId: category,
      title,
      description,
      budget: quote.total.toString(),
      duration,
      location,
      scheduledFor: date?.toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-post-task-title">
            Post a Task
          </h1>
          <p className="text-muted-foreground">Tell us what you need done</p>
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

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && "Category & Details"}
                  {step === 2 && "Schedule & Location"}
                  {step === 3 && "Duration & Budget"}
                  {step === 4 && "Review & Post"}
                </CardTitle>
                <CardDescription>Step {step} of 4</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="category">Service Category</Label>
                      <CategoryDropdown
                        value={category}
                        onChange={setCategory}
                        placeholder="Select a service category..."
                        showAllOption={false}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Task Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Fix leaking kitchen faucet"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        data-testid="input-title"
                      />
                    </div>
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
                  </>
                )}

                {step === 2 && (
                  <>
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
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Estimated Duration</Label>
                      <Select
                        value={duration.toString()}
                        onValueChange={(v) => setDuration(Number(v))}
                      >
                        <SelectTrigger data-testid="select-duration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value.toString()}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Estimated Cost</div>
                      <div className="text-3xl font-bold" data-testid="text-estimated-cost">
                        {formatPrice(quote.total)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{quote.breakdown}</div>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Category</div>
                      <div className="text-lg">{category}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Title</div>
                      <div className="text-lg">{title}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Description</div>
                      <div className="text-sm">{description}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Date</div>
                      <div className="text-lg">{date ? format(date, "PPP") : "Not set"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Location</div>
                      <div className="text-lg">{location}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Budget</div>
                      <div className="text-lg font-bold">{formatPrice(quote.total)}</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {step > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                  )}
                  {step < 4 ? (
                    <Button
                      onClick={() => setStep(step + 1)}
                      className="flex-1"
                      data-testid="button-next"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={createJobMutation.isPending}
                      className="flex-1"
                      data-testid="button-post-task"
                    >
                      {createJobMutation.isPending ? "Posting..." : "Post Task"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Calculator Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Price Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-medium">$25/30min</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(quote.total)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Final price may vary based on worker's custom rate
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
