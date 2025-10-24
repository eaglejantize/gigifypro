import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link } from "wouter";

type ServiceInfo = {
  key: string;
  label: string;
  summary: string;
  expanded: string;
  recommendedGear?: string[];
  requirements?: string[];
  badges?: string[];
};

export default function InfoPopover({ serviceKey }: { serviceKey: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<ServiceInfo>({
    queryKey: ["/api/knowledge/services", serviceKey],
    enabled: true,
  });

  return (
    <>
      <HoverCard openDelay={150}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            aria-label={`More info about ${data?.label || serviceKey}`}
            onClick={() => data && setDialogOpen(true)}
            disabled={isLoading || isError}
            className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground hover-elevate active-elevate-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid={`button-info-${serviceKey}`}
          >
            <Info className="w-3 h-3" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          side="bottom"
          align="start"
          className="w-64"
          data-testid={`tooltip-${serviceKey}`}
        >
          <div className="space-y-2">
            {isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
            {isError && <p className="text-xs text-muted-foreground">Info unavailable</p>}
            {data && (
              <>
                <h4 className="font-semibold text-sm">{data.label}</h4>
                <p className="text-xs text-muted-foreground">{data.summary}</p>
              </>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>

      {data && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid={`modal-${serviceKey}`}>
            <DialogHeader>
              <DialogTitle className="text-xl">{data.label}</DialogTitle>
              {data.badges && data.badges.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.badges.map((b: string) => (
                    <Badge key={b} variant="secondary" className="text-xs" data-testid={`badge-${b}`}>
                      {b}
                    </Badge>
                  ))}
                </div>
              )}
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div
                className="text-sm prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: data.expanded }}
              />

              {data.recommendedGear && data.recommendedGear.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    Recommended Gear
                  </h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {data.recommendedGear.map((g: string) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {data.requirements && data.requirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    Requirements
                  </h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {data.requirements.map((g: string) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t">
                <Link 
                  href="/knowledge" 
                  className="text-sm text-primary hover:underline inline-block"
                  data-testid="link-knowledge-hub"
                >
                  Learn more in Knowledge Hub →
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
