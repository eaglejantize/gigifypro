import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Search,
  UserCheck,
  MessageSquare,
  Star,
  Award,
  Shield,
  TrendingUp,
  Briefcase,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Heart,
} from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="heading-how-it-works">
              How Gigifypro Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your complete guide to connecting with local service professionals
              and building your gig business
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Platform Overview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">What is Gigifypro?</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg mb-4">
                Life gets busy. Your sink starts leaking at the worst time. Your lawn needs attention but weekends are precious. You need someone you can trust, right in your neighborhood, at a price that's fair.
              </p>
              <p className="text-lg mb-4">
                At the same time, you've got skills. Maybe you're great with your hands, creative with design, or a natural with pets. You're looking for flexible work that respects your time and pays what you're worth.
              </p>
              <p className="text-lg mb-4">
                <span className="font-semibold">That's where Gigifypro comes in.</span> We're a local marketplace that brings neighbors together—Taskers who need help and Gigers who provide it. From home repairs and cleaning to creative services and pet care, we make it simple to find trusted professionals in your area or turn your talents into real income.
              </p>
              <p className="text-lg">
                Our mission: <span className="font-bold">Learn. Earn. Get Gigified.</span> We believe everyone deserves access to affordable help when they need it, and everyone deserves the opportunity to build something meaningful with the skills they already have.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* For Taskers Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">For Taskers: Finding Help Made Easy</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  1. Browse Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Explore 75+ services across 12 categories including home repair,
                  cleaning, yard care, creative services, pet care, and more.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Search by service type or browse categories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Filter by location, ratings, and GigScore</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>View giger profiles with detailed info</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  2. Choose Your Giger
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Select the perfect giger based on their GigScore, reviews, pricing,
                  and specialization.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>See upfront pricing (hourly, fixed, or custom)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Read verified reviews and ratings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Check GigScore for performance insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  3. Book & Communicate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Book the service with just a few clicks and communicate directly
                  with your giger.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Choose date, time, and location</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Message directly for questions or details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Get instant confirmation or counteroffers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  4. Review & Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  After the job is complete, share your experience to help future
                  taskers and reward great gigers.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Leave star ratings (1-5 stars)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Write detailed reviews with photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Give "likes" for exceptional service</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Models Explained */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Understanding Pricing Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Badge>Hourly Rate</Badge>
                  <p className="text-sm text-muted-foreground">
                    Pay by 30-minute blocks. Great for ongoing tasks or when
                    duration is uncertain.
                  </p>
                  <p className="text-xs font-mono bg-muted p-2 rounded">
                    Example: $25/30min = $50/hour
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge>Fixed Price</Badge>
                  <p className="text-sm text-muted-foreground">
                    One-time flat fee for the entire job. You know the exact cost
                    upfront.
                  </p>
                  <p className="text-xs font-mono bg-muted p-2 rounded">
                    Example: $150 for full house cleaning
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge>Custom Quote</Badge>
                  <p className="text-sm text-muted-foreground">
                    Giger provides a custom quote based on your specific needs and
                    requirements.
                  </p>
                  <p className="text-xs font-mono bg-muted p-2 rounded">
                    Example: Quote provided after consultation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* For Gigers Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">For Gigers: Turn Skills Into Income</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  1. Create Your Profile(s)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Set up 1-3 specialized profiles to showcase different services or
                  niches.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Choose services you offer (up to 5 per profile)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Define your niche and unique value proposition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Write compelling bio highlighting experience</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  2. Set Your Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Choose the pricing model that works best for each service you offer.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Hourly: Charge per 30-minute blocks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Fixed: Set flat rates for specific services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Custom: Provide quotes case-by-case</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  3. Accept Jobs & Deliver
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Receive job requests, communicate with taskers, and deliver
                  excellent service.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Get notified when taskers request your services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Accept, decline, or send counteroffers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Complete jobs and get paid</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  4. Build Your Reputation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Earn great reviews and boost your GigScore to attract more taskers.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Deliver quality work to earn 5-star reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Respond quickly to boost your GigScore</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Complete training to earn certifications</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* GigScore System */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Understanding GigScore</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                What is GigScore?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">
                GigScore is our proprietary performance scoring system that rates gigers
                on a 0-100 scale based on multiple performance factors. It helps taskers
                quickly identify top-performing gigers.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-5 h-5 text-chart-3" />
                  <div>
                    <div className="font-bold">Review Quality</div>
                    <div className="text-sm text-muted-foreground">40% weight</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Average star rating from tasker reviews. Higher ratings mean higher scores.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-bold">Completed Jobs</div>
                    <div className="text-sm text-muted-foreground">25% weight</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total jobs completed. Uses logarithmic scale to reward consistent work.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-bold">Response Speed</div>
                    <div className="text-sm text-muted-foreground">15% weight</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Average response time to messages. Faster responses earn higher scores.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-bold">Reliability</div>
                    <div className="text-sm text-muted-foreground">10% weight</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Job completion rate. Lower cancellations mean higher reliability.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-5 h-5 text-destructive" />
                  <div>
                    <div className="font-bold">Repeat Taskers</div>
                    <div className="text-sm text-muted-foreground">10% weight</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Percentage of taskers who book again. Higher loyalty = higher score.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>GigScore Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Badge className="mb-2">Rising</Badge>
                  <div className="text-2xl font-bold mb-1">0-39</div>
                  <div className="text-xs text-muted-foreground">New or developing</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Badge className="mb-2">Pro</Badge>
                  <div className="text-2xl font-bold mb-1">40-69</div>
                  <div className="text-xs text-muted-foreground">Experienced & reliable</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Badge className="mb-2">Elite</Badge>
                  <div className="text-2xl font-bold mb-1">70-89</div>
                  <div className="text-xs text-muted-foreground">Top-tier performance</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Badge className="mb-2">Legend</Badge>
                  <div className="text-2xl font-bold mb-1">90-100</div>
                  <div className="text-xs text-muted-foreground">Exceptional excellence</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Safety & Trust */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Safety & Trust</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Verified Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All gigers go through verification processes. Look for the verified
                  badge on profiles.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Review System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real reviews from real taskers. Both taskers and gigers can leave
                  feedback after each job.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  In-App Messaging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All communication happens in-app for transparency and record-keeping.
                  Never share personal contact info outside the platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you need help or want to offer services, gigifypro makes it simple
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/explore">
              <Button size="lg" data-testid="button-find-gigers">
                Find Gigers
              </Button>
            </Link>
            <Link href="/settings/giger-profiles">
              <Button size="lg" variant="outline" data-testid="button-become-giger">
                Become a Giger
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
