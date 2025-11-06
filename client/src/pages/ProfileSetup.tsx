import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ChevronLeft, ChevronRight, Check, Search, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type ServiceInfo = {
  serviceKey: string;
  name: string;
  summary: string;
  category: string;
};

type SelectedService = {
  serviceKey: string;
  name: string;
  niche: string;
};

type ProfileForm = {
  name: string;
  bio: string;
  services: {
    serviceKey: string;
    isPrimary: boolean;
  }[];
};

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileForms, setProfileForms] = useState<ProfileForm[]>([]);

  // Redirect to login if not authenticated (only after auth check completes)
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create your Gig Pro profiles",
        variant: "destructive",
      });
      setLocation("/auth/login");
    }
  }, [user, authLoading, setLocation, toast]);

  // Fetch services - API returns the services array directly
  const { data: servicesData, isLoading } = useQuery<any>({
    queryKey: ["/api/services"],
  });

  // Create profiles mutation
  const createProfilesMutation = useMutation({
    mutationFn: async (profiles: any[]) => {
      return await apiRequest("POST", "/api/profile/giger/create", { profiles });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile/giger/mine"] });
      toast({
        title: "Success!",
        description: "Your Gig Pro profiles have been created.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create profiles",
        variant: "destructive",
      });
    },
  });

  // Convert services data to array
  // API may return { services: [...] } or services: [...] directly
  const rawServices = servicesData?.services || servicesData || [];
  const services: ServiceInfo[] = (Array.isArray(rawServices) ? rawServices : [])
    .map((service: any) => ({
      serviceKey: service.key,
      name: service.label || service.key,
      summary: service.summary || "",
      category: service.category || "Other",
    }))
    .filter((service) => service.serviceKey && service.name);

  // Filter services based on search
  const filteredServices = services.filter(
    (service) =>
      (service.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maxProfiles = Infinity; // No limit on profiles
  const progressPercent = (step / 3) * 100;

  const handleSelectService = (service: ServiceInfo) => {
    if (selectedServices.find((s) => s.serviceKey === service.serviceKey)) {
      toast({
        title: "Already selected",
        description: "This service is already in your selection",
      });
      return;
    }

    setSelectedServices([...selectedServices, { serviceKey: service.serviceKey, name: service.name, niche: "" }]);
  };

  const handleRemoveService = (serviceKey: string) => {
    setSelectedServices(selectedServices.filter((s) => s.serviceKey !== serviceKey));
  };

  const handleNicheChange = (serviceKey: string, niche: string) => {
    setSelectedServices(selectedServices.map((s) => (s.serviceKey === serviceKey ? { ...s, niche } : s)));
  };

  const handleProfileFormChange = (index: number, field: keyof ProfileForm, value: any) => {
    const newForms = [...profileForms];
    newForms[index] = { ...newForms[index], [field]: value };
    setProfileForms(newForms);
  };

  // Reconcile profile forms with selected services - preserves edits when services change
  useEffect(() => {
    if (selectedServices.length > 0) {
      // Reconcile by serviceKey to preserve existing form data
      const newForms: ProfileForm[] = selectedServices.map((service) => {
        // Find existing form for this service
        const existingForm = profileForms.find(
          (form) => form.services[0]?.serviceKey === service.serviceKey
        );
        
        // Return existing form if found, otherwise create new form
        return existingForm || {
          name: `${service.name} Specialist`,
          bio: `Professional ${service.niche} expert`,
          services: [{ serviceKey: service.serviceKey, isPrimary: true }],
        };
      });
      
      // Only update if forms actually changed
      const formsChanged = newForms.length !== profileForms.length ||
        newForms.some((form, i) => 
          !profileForms[i] || 
          form.services[0]?.serviceKey !== profileForms[i].services[0]?.serviceKey
        );
      
      if (formsChanged) {
        setProfileForms(newForms);
      }
    } else if (profileForms.length > 0) {
      // Clear forms if no services selected
      setProfileForms([]);
    }
  }, [selectedServices, profileForms]);

  const canGoToStep2 = selectedServices.length > 0;
  const canGoToStep3 = selectedServices.every((s) => s.niche.trim().length > 0);

  const handleNext = () => {
    if (step === 1 && !canGoToStep2) {
      toast({
        title: "Select at least one service",
        description: "Choose at least one service to continue",
      });
      return;
    }

    if (step === 2 && !canGoToStep3) {
      toast({
        title: "Complete all niches",
        description: "Please specify a niche for each selected service",
      });
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    // Validate forms
    const invalidForms = profileForms.filter((f) => !f.name.trim() || !f.bio.trim());
    if (invalidForms.length > 0) {
      toast({
        title: "Incomplete forms",
        description: "Please complete all profile details",
        variant: "destructive",
      });
      return;
    }

    // Create profiles payload
    const profiles = profileForms.map((form, index) => ({
      name: form.name,
      bio: form.bio,
      niche: selectedServices[index].niche,
      services: form.services,
    }));

    createProfilesMutation.mutate(profiles);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-profile-setup">
            Set Up Your Gig Pro Profiles
          </h1>
          <p className="text-muted-foreground">
            Create specialized profiles to showcase your unique skills and services
          </p>
        </div>

        <div className="mb-8">
          <Progress value={progressPercent} className="h-2" data-testid="progress-setup" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span className={step >= 1 ? "text-primary font-medium" : ""}>1. Select Services</span>
            <span className={step >= 2 ? "text-primary font-medium" : ""}>2. Define Niches</span>
            <span className={step >= 3 ? "text-primary font-medium" : ""}>3. Profile Details</span>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle data-testid="heading-select-services">Select Your Services</CardTitle>
              <CardDescription>Choose services you want to offer as a Gig Pro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="search-services">Search Services</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-services"
                    placeholder="Search by service or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-services"
                  />
                </div>
              </div>

              {selectedServices.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Services ({selectedServices.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((service) => (
                      <Badge
                        key={service.serviceKey}
                        variant="secondary"
                        className="gap-1 pr-1"
                        data-testid={`badge-selected-${service.serviceKey}`}
                      >
                        {service.name}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-4 w-4 rounded-full hover-elevate"
                          onClick={() => handleRemoveService(service.serviceKey)}
                          data-testid={`button-remove-${service.serviceKey}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Available Services</Label>
                <ScrollArea className="h-96 border rounded-md">
                  <div className="p-4 space-y-2">
                    {filteredServices.length === 0 && !isLoading && (
                      <p className="text-muted-foreground text-center py-8">
                        {searchTerm ? `No services found matching "${searchTerm}"` : "No services available"}
                      </p>
                    )}
                    {filteredServices.map((service) => {
                      const isSelected = selectedServices.some((s) => s.serviceKey === service.serviceKey);
                      return (
                        <button
                          key={service.serviceKey}
                          onClick={() => !isSelected && handleSelectService(service)}
                          disabled={isSelected}
                          className={`w-full text-left p-3 rounded-md border transition-colors ${
                            isSelected
                              ? "bg-muted cursor-not-allowed opacity-50"
                              : "hover-elevate active-elevate-2 cursor-pointer"
                          }`}
                          data-testid={`button-service-${service.serviceKey}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{service.name}</p>
                                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{service.summary}</p>
                            </div>
                            <Badge variant="outline" className="shrink-0">
                              {service.category}
                            </Badge>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle data-testid="heading-define-niches">Define Your Niches</CardTitle>
              <CardDescription>
                Specify your unique niche or specialty for each service to stand out
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedServices.map((service, index) => (
                <div key={service.serviceKey} className="space-y-2">
                  <Label htmlFor={`niche-${service.serviceKey}`}>
                    {service.name} - Your Niche
                  </Label>
                  <Input
                    id={`niche-${service.serviceKey}`}
                    placeholder="e.g., 'Organic vegan meal prep' or 'Senior-friendly tech support'"
                    value={service.niche}
                    onChange={(e) => handleNicheChange(service.serviceKey, e.target.value)}
                    data-testid={`input-niche-${service.serviceKey}`}
                  />
                  <p className="text-sm text-muted-foreground">
                    Make it specific and memorable. This helps clients find exactly what they need.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle data-testid="heading-profile-details">Profile Details</CardTitle>
                <CardDescription>
                  Customize each profile to highlight your expertise
                </CardDescription>
              </CardHeader>
            </Card>

            {profileForms.map((form, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Profile {index + 1}: {selectedServices[index].name}
                  </CardTitle>
                  <CardDescription>Niche: {selectedServices[index].niche}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`profile-name-${index}`}>Profile Name</Label>
                    <Input
                      id={`profile-name-${index}`}
                      value={form.name}
                      onChange={(e) => handleProfileFormChange(index, "name", e.target.value)}
                      placeholder="e.g., 'Chef Maria - Vegan Specialist'"
                      data-testid={`input-profile-name-${index}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`profile-bio-${index}`}>Bio</Label>
                    <Textarea
                      id={`profile-bio-${index}`}
                      value={form.bio}
                      onChange={(e) => handleProfileFormChange(index, "bio", e.target.value)}
                      placeholder="Tell clients about your experience and what makes you special..."
                      rows={4}
                      data-testid={`input-profile-bio-${index}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            data-testid="button-back"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext} data-testid="button-next">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createProfilesMutation.isPending}
              data-testid="button-submit"
            >
              {createProfilesMutation.isPending ? "Creating..." : "Create Profiles"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
