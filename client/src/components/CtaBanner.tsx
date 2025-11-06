import { trackCta } from "@/lib/track";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, GraduationCap } from "lucide-react";

export default function CtaBanner() {
  return (
    <div className="border-b bg-card">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            data-testid="button-banner-offer-services"
          >
            <a
              href="/post?type=offer"
              onClick={() => trackCta("banner_offer_services")}
            >
              <Briefcase className="h-4 w-4" />
              Offer Services
            </a>
          </Button>
          <Button
            variant="default"
            size="sm"
            asChild
            data-testid="button-banner-post-task"
          >
            <a
              href="/post?type=request"
              onClick={() => trackCta("banner_post_task")}
            >
              <Plus className="h-4 w-4" />
              Post a Task
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            data-testid="button-banner-get-gigified"
          >
            <a
              href="/profile-setup"
              onClick={() => trackCta("banner_get_gigified")}
            >
              <GraduationCap className="h-4 w-4" />
              Get Gigified
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
