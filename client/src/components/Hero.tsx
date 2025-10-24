import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trackCta } from "@/lib/track";

interface HeroProps {
  title: string;
  subtitle?: string;
  description: string;
  primaryCta?: {
    text: string;
    href: string;
    trackingId?: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
    trackingId?: string;
  };
  backgroundImage?: string;
}

export function Hero({
  title,
  subtitle,
  description,
  primaryCta,
  secondaryCta,
  backgroundImage,
}: HeroProps) {
  const hasBackground = !!backgroundImage;

  return (
    <div className="relative overflow-hidden">
      {hasBackground && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        </>
      )}
      
      <div
        className={`relative px-6 py-16 sm:py-24 ${
          hasBackground ? "text-white" : ""
        }`}
      >
        <div className="mx-auto max-w-4xl text-center">
          {subtitle && (
            <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              {subtitle}
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p
            className={`mx-auto mt-6 max-w-2xl text-lg ${
              hasBackground ? "text-white/90" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
          
          {(primaryCta || secondaryCta) && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {primaryCta && (
                <Button
                  asChild
                  variant={hasBackground ? "default" : "default"}
                  size="lg"
                  className="group"
                  data-testid={`button-${primaryCta.trackingId || "primary-cta"}`}
                >
                  <Link 
                    href={primaryCta.href}
                    onClick={() => primaryCta.trackingId && trackCta(primaryCta.trackingId)}
                  >
                    {primaryCta.text}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
              {secondaryCta && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className={hasBackground ? "bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" : ""}
                  data-testid={`button-${secondaryCta.trackingId || "secondary-cta"}`}
                >
                  <Link 
                    href={secondaryCta.href}
                    onClick={() => secondaryCta.trackingId && trackCta(secondaryCta.trackingId)}
                  >
                    {secondaryCta.text}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
