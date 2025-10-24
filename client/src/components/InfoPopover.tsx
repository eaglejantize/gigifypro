import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ServiceInfo | null>(null);
  const [hover, setHover] = useState(false);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/knowledge/services/${serviceKey}`, { credentials: "include" });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch service info:", err);
      }
    })();
  }, [serviceKey]);

  function onMouseEnter() {
    tRef.current = window.setTimeout(() => setHover(true), 150);
  }

  function onMouseLeave() {
    if (tRef.current) window.clearTimeout(tRef.current);
    setHover(false);
  }

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={`More info about ${data?.label || serviceKey}`}
        onClick={() => setOpen(true)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground hover-elevate active-elevate-2"
        data-testid={`button-info-${serviceKey}`}
      >
        <Info className="w-3 h-3" />
      </button>

      {/* Hover summary tooltip */}
      {hover && data?.summary && (
        <div
          className="absolute z-50 -left-2 top-6 w-64 rounded-lg border border-border bg-card p-3 text-xs shadow-lg"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={onMouseLeave}
          data-testid={`tooltip-${serviceKey}`}
        >
          <div className="font-semibold mb-1 text-card-foreground">{data.label}</div>
          <div className="text-muted-foreground">{data.summary}</div>
        </div>
      )}

      {/* Click modal */}
      {open && data && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/40" 
            onClick={() => setOpen(false)}
            data-testid={`modal-backdrop-${serviceKey}`}
          />
          <div 
            className="absolute left-1/2 top-1/2 w-[min(640px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-xl"
            data-testid={`modal-${serviceKey}`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-semibold text-card-foreground">{data.label}</h3>
                {data.badges && data.badges.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.badges.map((b: string) => (
                      <Badge key={b} variant="secondary" className="text-xs" data-testid={`badge-${b}`}>
                        {b}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="text-sm text-muted-foreground hover:text-foreground"
                data-testid={`button-close-${serviceKey}`}
              >
                Close
              </button>
            </div>
            
            <div 
              className="mt-3 text-sm text-card-foreground prose prose-sm max-w-none" 
              dangerouslySetInnerHTML={{ __html: data.expanded }} 
            />
            
            {data.recommendedGear && data.recommendedGear.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Recommended Gear
                </div>
                <ul className="list-disc pl-5 text-sm text-card-foreground space-y-1">
                  {data.recommendedGear.map((g: string) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.requirements && data.requirements.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Requirements
                </div>
                <ul className="list-disc pl-5 text-sm text-card-foreground space-y-1">
                  {data.requirements.map((g: string) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-border">
              <a 
                href="/knowledge" 
                className="text-sm text-primary hover:underline"
                data-testid="link-knowledge-hub"
              >
                Learn more in Knowledge Hub →
              </a>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
