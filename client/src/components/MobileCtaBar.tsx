import { useEffect, useState } from "react";
import { trackCta } from "@/lib/track";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";

export default function MobileCtaBar() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setShow(y < 120 || y > 600);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 md:hidden transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-24"
      }`}
    >
      <div className="mx-auto flex max-w-lg items-center justify-center gap-2">
        <Button
          variant="default"
          size="default"
          asChild
          className="flex-1"
          data-testid="button-mobile-post-task"
        >
          <a
            href="/post?type=request"
            onClick={() => trackCta("mobile_post_task")}
          >
            <Plus className="h-4 w-4" />
            Post a Task
          </a>
        </Button>
        <Button
          variant="outline"
          size="default"
          asChild
          className="flex-1"
          data-testid="button-mobile-offer-services"
        >
          <a
            href="/post?type=offer"
            onClick={() => trackCta("mobile_offer_services")}
          >
            <Briefcase className="h-4 w-4" />
            Offer Services
          </a>
        </Button>
      </div>
    </div>
  );
}
