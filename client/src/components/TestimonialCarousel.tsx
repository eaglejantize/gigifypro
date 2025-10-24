import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import { Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role?: string;
  quote: string;
}

export default function TestimonialCarousel() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{ items: Testimonial[] }>("/api/testimonials");
        setItems(data.items || []);
      } catch (error) {
        console.error("Failed to load testimonials:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(() => {
      setCurrentIndex(current => (current + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items]);

  if (!items.length) return null;

  const currentTestimonial = items[currentIndex];

  return (
    <Card className="relative overflow-hidden" data-testid="testimonial-carousel">
      <CardContent className="p-8">
        <Quote className="w-12 h-12 text-primary/20 mb-4" />
        <blockquote className="text-lg leading-relaxed mb-6">
          "{currentTestimonial.quote}"
        </blockquote>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-foreground" data-testid="testimonial-name">
              {currentTestimonial.name}
            </div>
            {currentTestimonial.role && (
              <div className="text-sm text-muted-foreground" data-testid="testimonial-role">
                {currentTestimonial.role}
              </div>
            )}
          </div>
          <div className="flex gap-1.5">
            {items.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to testimonial ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-8 bg-primary"
                    : "w-1.5 bg-muted hover:bg-muted-foreground/30"
                }`}
                onClick={() => setCurrentIndex(idx)}
                data-testid={`testimonial-indicator-${idx}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
