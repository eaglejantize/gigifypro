import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Wrench, ChefHat, Dumbbell, Home, Star, Users, Shield, Briefcase, Plus, GraduationCap } from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { trackCta } from "@/lib/track";
import heroImage from "@assets/generated_images/Hero_image_service_workers_48414824.png";

const categories = [
  { id: "1", name: "Home Repair", Icon: Wrench, description: "Expert handymen" },
  { id: "2", name: "Personal Chef", Icon: ChefHat, description: "Meal preparation" },
  { id: "3", name: "Fitness Training", Icon: Dumbbell, description: "Get in shape" },
  { id: "4", name: "House Cleaning", Icon: Home, description: "Spotless homes" },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="text-hero-title">
            Learn. Earn. Get Gigified.
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Turn everyday skills into income, independence, and freedom.
          </p>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            When you're Gigified, you set your schedule, grow your brand, and even build a team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              variant="default"
              className="text-lg px-8"
              asChild
              data-testid="button-hero-offer-services"
            >
              <a
                href="/post?type=offer"
                onClick={() => trackCta("hero_offer_services")}
              >
                <Briefcase className="h-5 w-5" />
                Offer Services
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              asChild
              data-testid="button-hero-post-task"
            >
              <a
                href="/post?type=request"
                onClick={() => trackCta("hero_post_task")}
              >
                <Plus className="h-5 w-5" />
                Post a Task
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              asChild
              data-testid="button-hero-get-gigified"
            >
              <a
                href="/knowledge"
                onClick={() => trackCta("hero_get_gigified")}
              >
                <GraduationCap className="h-5 w-5" />
                Get Gigified
              </a>
            </Button>
          </div>
          <div className="mt-6 text-sm text-white/70">
            New? Explore{" "}
            <a
              className="underline hover:text-white"
              href="/services"
              onClick={() => trackCta("hero_view_services")}
              data-testid="link-hero-services"
            >
              Services
            </a>{" "}
            or read the{" "}
            <a
              className="underline hover:text-white"
              href="/knowledge"
              onClick={() => trackCta("hero_view_knowledge")}
              data-testid="link-hero-knowledge"
            >
              Knowledge Hub
            </a>
            .
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/90">
            <div className="text-center">
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-sm">Services Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">5,000+</div>
              <div className="text-sm">Verified Workers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">4.8★</div>
              <div className="text-sm">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Categories</h2>
            <p className="text-muted-foreground text-lg">Find the perfect service for your needs</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-xl mb-2">Post Your Task</h3>
              <p className="text-muted-foreground">
                Describe what you need done and set your budget
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-xl mb-2">Choose a Provider</h3>
              <p className="text-muted-foreground">
                Browse verified workers and book the perfect match
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-xl mb-2">Get It Done</h3>
              <p className="text-muted-foreground">
                Work gets completed and you leave a review
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-xl mb-2">Verified Professionals</h3>
              <p className="text-muted-foreground">
                All workers are background checked and verified
              </p>
            </div>
            <div className="text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-xl mb-2">Transparent Reviews</h3>
              <p className="text-muted-foreground">
                Real reviews from real customers help you decide
              </p>
            </div>
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-xl mb-2">Local Community</h3>
              <p className="text-muted-foreground">
                Support local professionals in your area
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of satisfied customers and service providers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" data-testid="link-signup-cta">
              <Button size="lg" className="text-lg px-8">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/feed" data-testid="link-browse-cta">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Browse Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
